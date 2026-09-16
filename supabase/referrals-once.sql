-- Run this in the Supabase SQL editor.
-- Canonical referral meaning:
-- - referrals.user_id is the referred user, meaning the current signed-in user.
-- - referrals.referrer_user_id is the user who referred them.
-- The claim_referral RPC never overwrites the first referral.

create extension if not exists pgcrypto;

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  referrer_user_id uuid references auth.users(id) on delete set null,
  referrer_phone_e164 text not null,
  status text not null default 'claimed',
  created_at timestamptz not null default now()
);

alter table public.referrals
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists referrer_user_id uuid references auth.users(id) on delete set null,
  add column if not exists referrer_phone_e164 text,
  add column if not exists status text not null default 'claimed',
  add column if not exists created_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'referrals'
      and column_name = 'referrer_user_id'
  ) then
    execute 'alter table public.referrals alter column referrer_user_id drop not null';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'referrals'
      and column_name = 'referred_user_id'
  ) then
    execute 'alter table public.referrals alter column referred_user_id drop not null';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'referrals'
      and column_name = 'referred_by_user_id'
  ) then
    execute 'alter table public.referrals alter column referred_by_user_id drop not null';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'referrals'
      and column_name = 'referred_phone_e164'
  ) then
    execute 'alter table public.referrals alter column referred_phone_e164 drop not null';
  end if;
end $$;

create unique index if not exists referrals_user_id_once_idx
  on public.referrals (user_id)
  where user_id is not null;

alter table public.referrals enable row level security;

drop policy if exists "Users can read their own referral" on public.referrals;
create policy "Users can read their own referral"
  on public.referrals
  for select
  using (auth.uid() = user_id);

drop function if exists public.claim_referral(text);
create or replace function public.claim_referral(p_referrer_phone_e164 text)
returns table (
  referral_id uuid,
  user_id uuid,
  referrer_user_id uuid,
  already_claimed boolean
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_referrer_phone text := trim(coalesce(p_referrer_phone_e164, ''));
  v_referrer_digits text;
  v_referrer_user_id uuid;
  v_existing public.referrals%rowtype;
  v_rows_inserted integer := 0;
begin
  if v_uid is null then
    raise exception 'You must be logged in.';
  end if;

  select *
  into v_existing
  from public.referrals r
  where r.user_id = v_uid
  limit 1;

  if found then
    return query
    select v_existing.id, v_existing.user_id, v_existing.referrer_user_id, true;
    return;
  end if;

  if v_referrer_phone = '' then
    raise exception 'Referral phone number is required.';
  end if;

  v_referrer_digits := regexp_replace(v_referrer_phone, '[^0-9]', '', 'g');

  if length(v_referrer_digits) = 10 then
    v_referrer_phone := '+1' || v_referrer_digits;
  elsif length(v_referrer_digits) = 11 and left(v_referrer_digits, 1) = '1' then
    v_referrer_phone := '+' || v_referrer_digits;
  else
    raise exception 'Enter a complete Canadian phone number.';
  end if;

  select u.id
  into v_referrer_user_id
  from auth.users u
  where regexp_replace(coalesce(u.phone, ''), '[^0-9]', '', 'g') in (
    v_referrer_digits,
    right(v_referrer_digits, 10),
    '1' || right(v_referrer_digits, 10)
  )
  limit 1;

  if v_referrer_user_id = v_uid then
    raise exception 'Referral phone number cannot be your own.';
  end if;

  insert into public.referrals (
    user_id,
    referrer_user_id,
    referrer_phone_e164,
    status
  )
  values (
    v_uid,
    v_referrer_user_id,
    v_referrer_phone,
    case when v_referrer_user_id is null then 'pending_referrer' else 'claimed' end
  )
  on conflict do nothing;

  get diagnostics v_rows_inserted = row_count;

  select *
  into v_existing
  from public.referrals r
  where r.user_id = v_uid
  limit 1;

  if v_existing.id is null then
    raise exception 'Referral could not be saved.';
  end if;

  return query
  select
    v_existing.id,
    v_existing.user_id,
    v_existing.referrer_user_id,
    v_rows_inserted = 0;
end;
$$;

revoke all on function public.claim_referral(text) from public;
grant execute on function public.claim_referral(text) to authenticated;

notify pgrst, 'reload schema';
