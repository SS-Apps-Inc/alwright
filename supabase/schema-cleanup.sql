-- Run this after post-entitlements.sql and referrals-once.sql.
-- It removes duplicate legacy fields/RPCs while preserving data in the columns
-- the app actually uses.

-- Remove old public triggers/functions that still read subscription_plan before
-- dropping the duplicate column.
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

-- Profiles: keep billing_plan as the canonical plan field.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'subscription_plan'
  ) then
    update public.profiles
    set billing_plan = subscription_plan
    where subscription_plan in ('free', 'starter', 'pro')
      and (billing_plan is null or billing_plan = 'free');
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'revenuecat_customer_id'
  ) then
    update public.profiles
    set revenuecat_app_user_id = revenuecat_customer_id
    where revenuecat_app_user_id is null
      and revenuecat_customer_id is not null;
  end if;
end $$;

-- Referrals: keep user_id as the referred user and referrer_user_id as the referrer.
alter table public.referrals
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
      and table_name = 'profiles'
      and column_name = 'referred_by_user_id'
  ) then
    execute '
      insert into public.referrals (user_id, referrer_user_id, referrer_phone_e164, status)
      select p.id, p.referred_by_user_id, au.phone, ''claimed''
      from public.profiles p
      join auth.users au on au.id = p.referred_by_user_id
      where p.referred_by_user_id is not null
        and au.phone is not null
        and not exists (
          select 1 from public.referrals r
          where r.user_id = p.id
        )
      on conflict do nothing
    ';
  end if;
end $$;

alter table public.profiles
  drop column if exists subscription_plan,
  drop column if exists subscription_status,
  drop column if exists subscription_updated_at_ms,
  drop column if exists revenuecat_customer_id,
  drop column if exists referral_count,
  drop column if exists referred_by_user_id;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'referrals'
      and column_name = 'referred_user_id'
  ) then
    execute '
      update public.referrals
      set user_id = referred_user_id
      where user_id is null
        and referred_user_id is not null
    ';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'referrals'
      and column_name = 'referred_by_user_id'
  ) then
    execute '
      update public.referrals
      set referrer_user_id = referred_by_user_id
      where referrer_user_id is null
        and referred_by_user_id is not null
    ';
  end if;
end $$;

update public.referrals r
set referrer_phone_e164 = au.phone
from auth.users au
where r.referrer_user_id = au.id
  and r.referrer_phone_e164 is null
  and au.phone is not null;

delete from public.referrals
where user_id is null
   or referrer_phone_e164 is null;

delete from public.referrals r
using public.referrals older
where r.user_id = older.user_id
  and (
    r.created_at > older.created_at
    or (r.created_at = older.created_at and r.id > older.id)
  );

drop index if exists public.referrals_referred_user_id_once_idx;
drop index if exists public.referrals_user_id_once_idx;

alter table public.referrals
  alter column user_id set not null,
  alter column referrer_phone_e164 set not null,
  alter column referrer_user_id drop not null,
  drop column if exists referred_user_id,
  drop column if exists referred_by_user_id,
  drop column if exists referred_phone_e164,
  drop column if exists referral_was_signed_up,
  drop column if exists referred_signed_up;

create unique index referrals_user_id_once_idx
  on public.referrals (user_id);

-- Drop old/unused RPCs and helper functions.
drop function if exists public.sync_my_billing_plan(text);
drop function if exists public.sync_my_billing_plan(text, text, text, text, text[], jsonb, text);
drop function if exists public.sync_my_billing_plan(text, text, text, text, text, text[], jsonb, text);
drop function if exists public.get_my_post_entitlement();
drop function if exists public.delete_my_account();
drop function if exists public._column_exists(text, text);
drop function if exists public.update_my_posts_page_settings(boolean, boolean, text, numeric);
drop function if exists public.update_my_posts_page_settings(boolean, boolean, text, numeric, text, boolean, boolean);

notify pgrst, 'reload schema';
