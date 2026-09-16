-- Run this in the Supabase SQL editor.
-- Account export and scheduled deletion RPCs. Every user-facing RPC uses auth.uid().

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.account_data_export_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text not null,
  export_payload jsonb not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  user_data jsonb not null,
  delete_after timestamptz not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.account_data_export_requests enable row level security;
alter table public.account_deletion_requests enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'account_data_export_requests'
      and policyname = 'Users can read their own export requests'
  ) then
    create policy "Users can read their own export requests"
    on public.account_data_export_requests
    for select
    to authenticated
    using (user_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'account_deletion_requests'
      and policyname = 'Users can read their own deletion request'
  ) then
    create policy "Users can read their own deletion request"
    on public.account_deletion_requests
    for select
    to authenticated
    using (user_id = auth.uid());
  end if;
end $$;

drop function if exists public._account_json_rows(text, uuid, text[]);
create or replace function public._account_json_rows(
  p_table_name text,
  p_user_id uuid,
  p_columns text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_column text;
  v_conditions text[] := array[]::text[];
  v_result jsonb := '[]'::jsonb;
begin
  if to_regclass('public.' || quote_ident(p_table_name)) is null then
    return v_result;
  end if;

  foreach v_column in array p_columns loop
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = p_table_name
        and column_name = v_column
        and data_type = 'uuid'
    ) then
      v_conditions := array_append(v_conditions, format('%I = $1', v_column));
    end if;
  end loop;

  if coalesce(array_length(v_conditions, 1), 0) = 0 then
    return v_result;
  end if;

  execute format(
    'select coalesce(jsonb_agg(to_jsonb(t)), ''[]''::jsonb) from public.%I t where %s',
    p_table_name,
    array_to_string(v_conditions, ' or ')
  )
  into v_result
  using p_user_id;

  return coalesce(v_result, '[]'::jsonb);
end;
$$;

drop function if exists public._account_delete_rows(text, uuid, text[]);
create or replace function public._account_delete_rows(
  p_table_name text,
  p_user_id uuid,
  p_columns text[]
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_column text;
  v_conditions text[] := array[]::text[];
  v_count integer := 0;
begin
  if to_regclass('public.' || quote_ident(p_table_name)) is null then
    return 0;
  end if;

  foreach v_column in array p_columns loop
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = p_table_name
        and column_name = v_column
        and data_type = 'uuid'
    ) then
      v_conditions := array_append(v_conditions, format('%I = $1', v_column));
    end if;
  end loop;

  if coalesce(array_length(v_conditions, 1), 0) = 0 then
    return 0;
  end if;

  execute format(
    'delete from public.%I where %s',
    p_table_name,
    array_to_string(v_conditions, ' or ')
  )
  using p_user_id;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

drop function if exists public._build_account_data_payload(uuid);
create or replace function public._build_account_data_payload(p_user_id uuid)
returns jsonb
language sql
security definer
set search_path = public, auth
as $$
  select jsonb_build_object(
    'user_id', p_user_id,
    'generated_at', now(),
    'auth_user', (
      select jsonb_build_object(
        'id', au.id,
        'phone', au.phone,
        'email', au.email,
        'created_at', au.created_at,
        'last_sign_in_at', au.last_sign_in_at,
        'raw_user_meta_data', au.raw_user_meta_data
      )
      from auth.users au
      where au.id = p_user_id
    ),
    'profile', (
      select to_jsonb(pr)
      from public.profiles pr
      where pr.id = p_user_id
    ),
    'posts', (
      select coalesce(jsonb_agg(to_jsonb(p) order by p.created_at_ms desc), '[]'::jsonb)
      from public.posts p
      where p.user_id = p_user_id
    ),
    'post_usage_events', public._account_json_rows(
      'post_usage_events',
      p_user_id,
      array['user_id', 'profile_id', 'owner_id']
    ),
    'referrals', public._account_json_rows(
      'referrals',
      p_user_id,
      array['user_id', 'referrer_user_id']
    )
  );
$$;

drop function if exists public.request_my_account_data_export(text);
create or replace function public.request_my_account_data_export(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_email text := lower(trim(coalesce(p_email, '')));
  v_payload jsonb;
begin
  if v_uid is null then
    raise exception 'You must be logged in.';
  end if;

  if v_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'Invalid email address.';
  end if;

  update auth.users
  set raw_user_meta_data =
    coalesce(raw_user_meta_data, '{}'::jsonb) ||
    jsonb_build_object(
      'data_export_email', v_email,
      'data_export_requested_at', now()
    )
  where id = v_uid;

  v_payload := public._build_account_data_payload(v_uid);

  insert into public.account_data_export_requests (user_id, email, export_payload)
  values (v_uid, v_email, v_payload);

  return jsonb_build_object('requested', true, 'email', v_email);
end;
$$;

drop function if exists public.request_my_account_deletion();
create or replace function public.request_my_account_deletion()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_delete_after timestamptz := now() + interval '30 days';
  v_payload jsonb;
begin
  if v_uid is null then
    raise exception 'You must be logged in.';
  end if;

  v_payload := public._build_account_data_payload(v_uid);

  insert into public.account_deletion_requests (
    user_id,
    user_data,
    delete_after,
    status
  )
  values (
    v_uid,
    v_payload,
    v_delete_after,
    'pending'
  )
  on conflict (user_id) do update set
    user_data = excluded.user_data,
    delete_after = excluded.delete_after,
    status = 'pending',
    updated_at = now();

  update auth.users
  set raw_user_meta_data =
    coalesce(raw_user_meta_data, '{}'::jsonb) ||
    jsonb_build_object(
      'account_deletion_requested_at', now(),
      'account_delete_after', v_delete_after
    )
  where id = v_uid;

  return jsonb_build_object(
    'requested', true,
    'delete_after', v_delete_after
  );
end;
$$;

drop function if exists public.cancel_my_account_deletion();
create or replace function public.cancel_my_account_deletion()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_deleted integer := 0;
begin
  if v_uid is null then
    raise exception 'You must be logged in.';
  end if;

  delete from public.account_deletion_requests
  where user_id = v_uid
    and status = 'pending';

  get diagnostics v_deleted = row_count;

  update auth.users
  set raw_user_meta_data =
    (coalesce(raw_user_meta_data, '{}'::jsonb) - 'account_deletion_requested_at') -
    'account_delete_after'
  where id = v_uid;

  return jsonb_build_object('canceled', v_deleted > 0);
end;
$$;

drop function if exists public.delete_my_account();

drop function if exists public.purge_due_account_deletions();
create or replace function public.purge_due_account_deletions()
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_request record;
  v_count integer := 0;
begin
  for v_request in
    select user_id
    from public.account_deletion_requests
    where status = 'pending'
      and delete_after <= now()
  loop
    perform public._account_delete_rows(
      'post_usage_events',
      v_request.user_id,
      array['user_id', 'profile_id', 'owner_id']
    );

    perform public._account_delete_rows(
      'referrals',
      v_request.user_id,
      array['user_id', 'referrer_user_id']
    );

    delete from public.account_data_export_requests
    where user_id = v_request.user_id;

    delete from public.posts
    where user_id = v_request.user_id;

    delete from public.profiles
    where id = v_request.user_id;

    delete from public.account_deletion_requests
    where user_id = v_request.user_id;

    delete from auth.users
    where id = v_request.user_id;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

revoke all on function public._account_json_rows(text, uuid, text[]) from public;
revoke all on function public._account_delete_rows(text, uuid, text[]) from public;
revoke all on function public._build_account_data_payload(uuid) from public;
revoke all on function public.request_my_account_data_export(text) from public;
revoke all on function public.request_my_account_deletion() from public;
revoke all on function public.cancel_my_account_deletion() from public;
revoke all on function public.purge_due_account_deletions() from public;

grant execute on function public.request_my_account_data_export(text) to authenticated;
grant execute on function public.request_my_account_deletion() to authenticated;
grant execute on function public.cancel_my_account_deletion() to authenticated;
grant execute on function public.purge_due_account_deletions() to service_role;

notify pgrst, 'reload schema';
