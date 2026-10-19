begin;

alter table public.profiles
  add column if not exists phone_country_code text,
  add column if not exists phone_country_flag text,
  add column if not exists country_discovery_enabled boolean not null default true,
  add column if not exists my_posts_profile_links_enabled boolean not null default true,
  add column if not exists my_posts_profile_icon_type text not null default 'unknown';

alter table public.profiles
  alter column country_discovery_enabled set default true,
  alter column my_posts_profile_links_enabled set default true;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_phone_country_code_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_phone_country_code_check
      check (
        phone_country_code is null
        or phone_country_code ~ '^[A-Z]{2}$'
      );
  end if;
end $$;

create or replace function public.save_my_phone_country(p_country_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_country_code text := upper(trim(coalesce(p_country_code, '')));
  v_country_flag text;
begin
  if v_uid is null then
    raise exception 'You must be logged in.';
  end if;

  if v_country_code !~ '^[A-Z]{2}$' then
    raise exception 'Invalid phone country code.' using errcode = '22023';
  end if;

  -- ISO letters map directly to the two Unicode regional-indicator symbols.
  v_country_flag :=
    chr(ascii(substr(v_country_code, 1, 1)) + 127397)
    || chr(ascii(substr(v_country_code, 2, 1)) + 127397);

  insert into public.profiles (
    id,
    page_bg_color,
    page_bg_opacity,
    show_post_list,
    phone_country_code,
    phone_country_flag,
    country_discovery_enabled,
    my_posts_profile_links_enabled,
    my_posts_profile_icon_type
  )
  values (
    v_uid,
    null,
    1,
    true,
    v_country_code,
    v_country_flag,
    true,
    true,
    'unknown'
  )
  on conflict (id) do update set
    phone_country_code = excluded.phone_country_code,
    phone_country_flag = excluded.phone_country_flag,
    country_discovery_enabled = true,
    my_posts_profile_links_enabled = true,
    my_posts_profile_icon_type = 'unknown',
    updated_at = now();
end;
$$;

revoke all on function public.save_my_phone_country(text) from public;
grant execute on function public.save_my_phone_country(text) to authenticated;

notify pgrst, 'reload schema';

commit;
