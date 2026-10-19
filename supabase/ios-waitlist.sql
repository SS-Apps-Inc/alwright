begin;

create table if not exists public.ios_waitlist (
  id bigint generated always as identity primary key,
  full_name text,
  email text,
  email_normalized text unique,
  phone text,
  phone_normalized text,
  source text not null default 'marketing_web',
  created_at timestamptz not null default now(),
  notified_at timestamptz
);

alter table public.ios_waitlist
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists phone_normalized text;

alter table public.ios_waitlist
  alter column email drop not null,
  alter column email_normalized drop not null;

create unique index if not exists ios_waitlist_phone_normalized_key
  on public.ios_waitlist (phone_normalized)
  where phone_normalized is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ios_waitlist_contact_required'
      and conrelid = 'public.ios_waitlist'::regclass
  ) then
    alter table public.ios_waitlist
      add constraint ios_waitlist_contact_required
      check (email_normalized is not null or phone_normalized is not null);
  end if;
end;
$$;

alter table public.ios_waitlist enable row level security;

revoke all on table public.ios_waitlist from anon, authenticated;

drop function if exists public.join_ios_waitlist(text);
drop function if exists public.join_ios_waitlist(text, text, text);

create function public.join_ios_waitlist(
  p_name text,
  p_email text,
  p_phone text
)
returns table (
  registered_name text,
  registered_email text,
  registered_phone text,
  already_registered boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := regexp_replace(trim(coalesce(p_name, '')), '\s+', ' ', 'g');
  v_email text := nullif(trim(coalesce(p_email, '')), '');
  v_email_normalized text;
  v_phone text := nullif(trim(coalesce(p_phone, '')), '');
  v_phone_normalized text;
  v_inserted_id bigint;
  v_existing public.ios_waitlist%rowtype;
begin
  if length(v_name) < 1 or length(v_name) > 100 then
    raise exception 'Please enter a valid name.' using errcode = '22023';
  end if;

  if v_email is not null and (
    length(v_email) > 254
    or v_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ) then
    raise exception 'Please enter a valid email address.' using errcode = '22023';
  end if;

  if v_phone is not null then
    v_phone_normalized := regexp_replace(v_phone, '[^0-9+]', '', 'g');
    if v_phone_normalized !~ '^\+[1-9][0-9]{7,14}$' then
      raise exception 'Please enter a valid phone number.' using errcode = '22023';
    end if;
  end if;

  if v_email is null and v_phone_normalized is null then
    raise exception 'Please enter an email address or phone number.' using errcode = '22023';
  end if;

  v_email_normalized := lower(v_email);

  select *
  into v_existing
  from public.ios_waitlist
  where
    (v_email_normalized is not null and email_normalized = v_email_normalized)
    or
    (v_phone_normalized is not null and phone_normalized = v_phone_normalized)
  order by id
  limit 1;

  if found then
    update public.ios_waitlist
    set full_name = v_name
    where id = v_existing.id
    returning * into v_existing;

    return query
    select
      v_existing.full_name,
      v_existing.email,
      v_existing.phone,
      true;
    return;
  end if;

  insert into public.ios_waitlist (
    full_name,
    email,
    email_normalized,
    phone,
    phone_normalized
  )
  values (
    v_name,
    v_email,
    v_email_normalized,
    v_phone_normalized,
    v_phone_normalized
  )
  returning id into v_inserted_id;

  return query
  select v_name, v_email, v_phone_normalized, false;
end;
$$;

revoke all on function public.join_ios_waitlist(text, text, text) from public;
grant execute on function public.join_ios_waitlist(text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';

commit;
