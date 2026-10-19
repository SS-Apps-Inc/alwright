-- Run this in the Supabase SQL editor.
-- RevenueCat-backed post restrictions.
--
-- Current app sync path:
-- 1. Native app reads RevenueCat customer info.
-- 2. App calls sync_my_billing_plan(...) with the derived plan and RevenueCat details.
-- 3. Post RPCs enforce limits from profiles.billing_plan.
--
-- For stronger production security, point a RevenueCat webhook at a service-role
-- Edge Function and update profiles.billing_plan there instead of trusting the client.

-- Remove stale public triggers/functions from older schemas that still read
-- profiles.subscription_plan. Those break profile updates after the column is
-- removed with: record "new" has no field "subscription_plan".
do $$
declare
  v_item record;
begin
  for v_item in
    select
      table_ns.nspname as table_schema,
      table_class.relname as table_name,
      trigger_row.tgname as trigger_name
    from pg_trigger trigger_row
    join pg_class table_class on table_class.oid = trigger_row.tgrelid
    join pg_namespace table_ns on table_ns.oid = table_class.relnamespace
    join pg_proc proc_row on proc_row.oid = trigger_row.tgfoid
    join pg_namespace proc_ns on proc_ns.oid = proc_row.pronamespace
    where not trigger_row.tgisinternal
      and table_ns.nspname = 'public'
      and proc_ns.nspname = 'public'
      and proc_row.prosrc ilike '%subscription_plan%'
  loop
    execute format(
      'drop trigger if exists %I on %I.%I',
      v_item.trigger_name,
      v_item.table_schema,
      v_item.table_name
    );
  end loop;

  for v_item in
    select
      proc_ns.nspname as function_schema,
      proc_row.proname as function_name,
      pg_get_function_identity_arguments(proc_row.oid) as function_args
    from pg_proc proc_row
    join pg_namespace proc_ns on proc_ns.oid = proc_row.pronamespace
    where proc_ns.nspname = 'public'
      and proc_row.prosrc ilike '%subscription_plan%'
  loop
    execute format(
      'drop function if exists %I.%I(%s) cascade',
      v_item.function_schema,
      v_item.function_name,
      v_item.function_args
    );
  end loop;
end $$;

alter table public.profiles
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists billing_plan text not null default 'free',
  add column if not exists billing_plan_synced_at timestamptz,
  add column if not exists revenuecat_app_user_id text,
  add column if not exists revenuecat_original_app_user_id text,
  add column if not exists revenuecat_entitlement text,
  add column if not exists revenuecat_active_product_ids text[] not null default array[]::text[],
  add column if not exists revenuecat_customer_info jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_billing_plan_check'
  ) then
    alter table public.profiles
      add constraint profiles_billing_plan_check
      check (billing_plan in ('free', 'starter', 'pro'));
  end if;
end $$;

drop function if exists public._count_post_creates_today(uuid);
drop function if exists public._count_post_creates_since(uuid, timestamptz);
create or replace function public._count_post_creates_since(
  p_user_id uuid,
  p_since timestamptz
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_since timestamptz := coalesce(p_since, now());
  v_since_ms bigint := floor(extract(epoch from v_since) * 1000)::bigint;
  v_has_usage_table boolean := to_regclass('public.post_usage_events') is not null;
  v_has_user_id boolean := false;
  v_has_created_at boolean := false;
  v_has_created_at_ms boolean := false;
  v_has_event_type boolean := false;
  v_where text;
  v_count integer := 0;
begin
  if v_has_usage_table then
    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'post_usage_events'
        and column_name = 'user_id'
        and data_type = 'uuid'
    ) into v_has_user_id;

    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'post_usage_events'
        and column_name = 'created_at'
    ) into v_has_created_at;

    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'post_usage_events'
        and column_name = 'created_at_ms'
    ) into v_has_created_at_ms;

    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'post_usage_events'
        and column_name = 'event_type'
    ) into v_has_event_type;

    if v_has_user_id and (v_has_created_at or v_has_created_at_ms) then
      v_where := 'user_id = $1';

      if v_has_created_at_ms then
        v_where := v_where || ' and created_at_ms >= $2';
        if v_has_event_type then
          v_where := v_where || ' and event_type in (''create_post'', ''post_created'', ''post'')';
        end if;

        execute format('select count(*)::integer from public.post_usage_events where %s', v_where)
        into v_count
        using p_user_id, v_since_ms;

        return coalesce(v_count, 0);
      end if;

      v_where := v_where || ' and created_at >= $2';
      if v_has_event_type then
        v_where := v_where || ' and event_type in (''create_post'', ''post_created'', ''post'')';
      end if;

      execute format('select count(*)::integer from public.post_usage_events where %s', v_where)
      into v_count
      using p_user_id, v_since;

      return coalesce(v_count, 0);
    end if;
  end if;

  select count(*)::integer
  into v_count
  from public.posts p
  where p.user_id = p_user_id
    and p.created_at_ms >= v_since_ms;

  return coalesce(v_count, 0);
end;
$$;

drop function if exists public._record_post_create_usage(uuid, uuid);
create or replace function public._record_post_create_usage(
  p_user_id uuid,
  p_post_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_columns text[] := array[]::text[];
  v_values text[] := array[]::text[];
begin
  if to_regclass('public.post_usage_events') is null then
    return;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'post_usage_events'
      and column_name = 'user_id'
      and data_type = 'uuid'
  ) then
    return;
  end if;

  v_columns := array_append(v_columns, 'user_id');
  v_values := array_append(v_values, '$1');

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'post_usage_events'
      and column_name = 'post_id'
      and data_type = 'uuid'
  ) then
    v_columns := array_append(v_columns, 'post_id');
    v_values := array_append(v_values, '$2');
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'post_usage_events'
      and column_name = 'event_type'
  ) then
    v_columns := array_append(v_columns, 'event_type');
    v_values := array_append(v_values, '''create_post''');
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'post_usage_events'
      and column_name = 'created_at'
  ) then
    v_columns := array_append(v_columns, 'created_at');
    v_values := array_append(v_values, 'now()');
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'post_usage_events'
      and column_name = 'created_at_ms'
  ) then
    v_columns := array_append(v_columns, 'created_at_ms');
    v_values := array_append(v_values, 'floor(extract(epoch from now()) * 1000)::bigint');
  end if;

  execute format(
    'insert into public.post_usage_events (%s) values (%s)',
    array_to_string(v_columns, ', '),
    array_to_string(v_values, ', ')
  )
  using p_user_id, p_post_id;
end;
$$;

drop function if exists public.sync_my_billing_plan(text);
drop function if exists public.sync_my_billing_plan(text, text, text, text, text[], jsonb);
drop function if exists public.sync_my_billing_plan(text, text, text, text, text[], jsonb, text);
drop function if exists public.sync_my_billing_plan(text, text, text, text, text, text[], jsonb, text);
create or replace function public.sync_my_billing_plan(
  p_plan text,
  p_revenuecat_app_user_id text default null,
  p_revenuecat_original_app_user_id text default null,
  p_revenuecat_entitlement text default null,
  p_revenuecat_active_product_ids text[] default array[]::text[],
  p_revenuecat_customer_info jsonb default null
)
returns table (
  billing_plan text,
  revenuecat_app_user_id text,
  revenuecat_entitlement text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_plan text := coalesce(p_plan, 'free');
  v_revenuecat_active_product_ids text[] := coalesce(p_revenuecat_active_product_ids, array[]::text[]);
  v_identifier_blob text := lower(concat_ws(
    ' ',
    p_revenuecat_entitlement,
    array_to_string(coalesce(p_revenuecat_active_product_ids, array[]::text[]), ' ')
  ));
begin
  if v_uid is null then
    raise exception 'You must be logged in.';
  end if;

  if v_plan not in ('free', 'starter', 'pro') then
    raise exception 'Invalid billing plan.';
  end if;

  if v_plan = 'free'
    and (
      p_revenuecat_entitlement is not null
      or cardinality(v_revenuecat_active_product_ids) > 0
    )
  then
    v_plan := case
      when v_identifier_blob ~ '(^|[^a-z0-9])pro([^a-z0-9]|$)' then 'pro'
      else 'starter'
    end;
  end if;

  insert into public.profiles (
    id,
    billing_plan,
    billing_plan_synced_at,
    revenuecat_app_user_id,
    revenuecat_original_app_user_id,
    revenuecat_entitlement,
    revenuecat_active_product_ids,
    revenuecat_customer_info
  )
  values (
    v_uid,
    v_plan,
    now(),
    p_revenuecat_app_user_id,
    p_revenuecat_original_app_user_id,
    p_revenuecat_entitlement,
    v_revenuecat_active_product_ids,
    p_revenuecat_customer_info
  )
  on conflict (id) do update set
    billing_plan = excluded.billing_plan,
    billing_plan_synced_at = excluded.billing_plan_synced_at,
    revenuecat_app_user_id = excluded.revenuecat_app_user_id,
    revenuecat_original_app_user_id = excluded.revenuecat_original_app_user_id,
    revenuecat_entitlement = excluded.revenuecat_entitlement,
    revenuecat_active_product_ids = excluded.revenuecat_active_product_ids,
    revenuecat_customer_info = excluded.revenuecat_customer_info,
    updated_at = now();

  return query
  select
    p.billing_plan,
    p.revenuecat_app_user_id,
    p.revenuecat_entitlement
  from public.profiles p
  where p.id = v_uid;
end;
$$;

drop function if exists public.get_my_post_entitlement();

drop function if exists public.create_post_with_limits(text, text, text[]);
create or replace function public.create_post_with_limits(
  p_description text,
  p_who text,
  p_search_terms text[]
)
returns public.posts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_description text := trim(coalesce(p_description, ''));
  v_who text := trim(coalesce(p_who, ''));
  v_plan text;
  v_limit integer;
  v_window_start timestamptz;
  v_used integer;
  v_post public.posts;
begin
  if v_uid is null then
    raise exception 'You must be logged in.';
  end if;

  if v_description = '' then
    raise exception 'Description cannot be empty.';
  end if;

  if char_length(v_description) > 181 then
    raise exception 'Description cannot exceed 181 characters.';
  end if;

  if char_length(v_who) > 24 then
    raise exception 'Who cannot exceed 24 characters.';
  end if;

  select coalesce(p.billing_plan, 'free')
  into v_plan
  from public.profiles p
  where p.id = v_uid;

  v_plan := coalesce(v_plan, 'free');

  v_limit := case
    when v_plan = 'pro' then 31
    when v_plan = 'starter' then 6
    else 2
  end;

  v_window_start := case
    when v_plan = 'free' then now() - interval '3 days'
    else date_trunc('day', now() at time zone 'utc') at time zone 'utc'
  end;

  v_used := public._count_post_creates_since(v_uid, v_window_start);

  if coalesce(v_used, 0) >= v_limit then
    if v_plan = 'free' then
      raise exception 'You reached your limit of 2 posts every 3 days!';
    end if;

    raise exception 'Daily post limit reached for your plan.';
  end if;

  insert into public.posts (
    user_id,
    description,
    who,
    search_terms,
    created_at_ms
  )
  values (
    v_uid,
    v_description,
    v_who,
    coalesce(p_search_terms, array[]::text[]),
    floor(extract(epoch from now()) * 1000)::bigint
  )
  returning * into v_post;

  perform public._record_post_create_usage(v_uid, v_post.id);

  return v_post;
end;
$$;

drop function if exists public.update_post_style_secure(uuid, text, numeric, text, text);
create or replace function public.update_post_style_secure(
  p_post_id uuid,
  p_bg_color text,
  p_bg_opacity numeric,
  p_radius text,
  p_font_color text
)
returns public.posts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_plan text;
  v_post public.posts;
begin
  if v_uid is null then
    raise exception 'You must be logged in.';
  end if;

  select coalesce(p.billing_plan, 'free')
  into v_plan
  from public.profiles p
  where p.id = v_uid;

  if coalesce(v_plan, 'free') not in ('starter', 'pro') then
    raise exception 'Post style editing is available on Starter and Pro plans.';
  end if;

  if p_radius is not null and p_radius not in ('rectangle', 'circle', 'rounded', 'wavy') then
    raise exception 'Invalid post radius.';
  end if;

  update public.posts p
  set
    bg_color = p_bg_color,
    bg_opacity = greatest(0.2, least(1, coalesce(p_bg_opacity, 1))),
    radius = p_radius,
    font_color = p_font_color
  where p.id = p_post_id
    and p.user_id = v_uid
  returning * into v_post;

  if v_post.id is null then
    raise exception 'Post not found.';
  end if;

  return v_post;
end;
$$;

revoke all on function public.sync_my_billing_plan(text, text, text, text, text[], jsonb) from public;
revoke all on function public._count_post_creates_since(uuid, timestamptz) from public;
revoke all on function public._record_post_create_usage(uuid, uuid) from public;
revoke all on function public.create_post_with_limits(text, text, text[]) from public;
revoke all on function public.update_post_style_secure(uuid, text, numeric, text, text) from public;

grant execute on function public.sync_my_billing_plan(text, text, text, text, text[], jsonb) to authenticated;
grant execute on function public.create_post_with_limits(text, text, text[]) to authenticated;
grant execute on function public.update_post_style_secure(uuid, text, numeric, text, text) to authenticated;

notify pgrst, 'reload schema';
