begin;

alter table public.profiles
  add column if not exists phone_country_code text,
  add column if not exists phone_country_flag text,
  add column if not exists feed_country_codes text[] not null default array[]::text[],
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

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_feed_country_codes_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_feed_country_codes_check
      check (
        cardinality(feed_country_codes) = 0
        or (
          cardinality(feed_country_codes) between 1 and 5
          and array_to_string(feed_country_codes, ',')
            ~ '^[A-Z]{2}(,[A-Z]{2}){0,4}$'
        )
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

create index if not exists profiles_country_discovery_idx
  on public.profiles (phone_country_code, id)
  where country_discovery_enabled = true;

create or replace function public._normalize_country_codes(p_country_codes text[])
returns text[]
language sql
immutable
set search_path = public
as $$
  select coalesce(array_agg(items.code order by items.first_position), array[]::text[])
  from (
    select
      upper(trim(country.value)) as code,
      min(country.position) as first_position
    from unnest(coalesce(p_country_codes, array[]::text[]))
      with ordinality as country(value, position)
    where upper(trim(country.value)) ~ '^[A-Z]{2}$'
    group by upper(trim(country.value))
  ) items;
$$;

create or replace function public.get_my_country_preferences()
returns table (
  feed_country_codes text[],
  phone_country_code text,
  phone_country_flag text,
  country_discovery_enabled boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'You must be logged in.';
  end if;

  insert into public.profiles (id, page_bg_color, page_bg_opacity, show_post_list)
  values (v_uid, null, 1, true)
  on conflict (id) do nothing;

  return query
  select
    coalesce(profile.feed_country_codes, array[]::text[]),
    profile.phone_country_code,
    profile.phone_country_flag,
    coalesce(profile.country_discovery_enabled, false)
  from public.profiles profile
  where profile.id = v_uid;
end;
$$;

create or replace function public.update_my_feed_countries(p_country_codes text[])
returns table (
  feed_country_codes text[],
  phone_country_code text,
  phone_country_flag text,
  country_discovery_enabled boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_codes text[] := public._normalize_country_codes(p_country_codes);
  v_input_count integer := cardinality(coalesce(p_country_codes, array[]::text[]));
begin
  if v_uid is null then
    raise exception 'You must be logged in.';
  end if;

  if v_input_count > 5 or cardinality(v_codes) <> v_input_count then
    raise exception 'Choose up to 5 valid countries.' using errcode = '22023';
  end if;

  insert into public.profiles (
    id,
    page_bg_color,
    page_bg_opacity,
    show_post_list,
    feed_country_codes
  )
  values (v_uid, null, 1, true, v_codes)
  on conflict (id) do update set
    feed_country_codes = excluded.feed_country_codes,
    updated_at = now();

  return query
  select
    profile.feed_country_codes,
    profile.phone_country_code,
    profile.phone_country_flag,
    profile.country_discovery_enabled
  from public.profiles profile
  where profile.id = v_uid;
end;
$$;

create or replace function public.update_my_country_discovery(p_enabled boolean)
returns table (
  feed_country_codes text[],
  phone_country_code text,
  phone_country_flag text,
  country_discovery_enabled boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'You must be logged in.';
  end if;

  insert into public.profiles (
    id,
    page_bg_color,
    page_bg_opacity,
    show_post_list,
    country_discovery_enabled
  )
  values (v_uid, null, 1, true, coalesce(p_enabled, false))
  on conflict (id) do update set
    country_discovery_enabled = excluded.country_discovery_enabled,
    updated_at = now();

  return query
  select
    profile.feed_country_codes,
    profile.phone_country_code,
    profile.phone_country_flag,
    profile.country_discovery_enabled
  from public.profiles profile
  where profile.id = v_uid;
end;
$$;

create or replace function public.can_profile_appear_in_country_feed(
  p_user_id uuid,
  p_country_codes text[]
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_codes text[] := public._normalize_country_codes(p_country_codes);
begin
  if v_uid is null then
    raise exception 'You must be logged in.';
  end if;

  if cardinality(v_codes) = 0 then
    return true;
  end if;

  return exists (
    select 1
    from public.profiles profile
    where profile.id = p_user_id
      and profile.country_discovery_enabled = true
      and profile.phone_country_code = any(v_codes)
  );
end;
$$;

create or replace function public.get_country_posts_page(
  p_country_codes text[],
  p_page_size integer,
  p_cursor_created_at_ms bigint default null,
  p_cursor_id uuid default null
)
returns table (
  id uuid,
  user_id uuid,
  description text,
  who text,
  created_at_ms bigint,
  search_terms text[],
  bg_color text,
  bg_opacity numeric,
  radius text,
  font_color text,
  profile_icon_type text,
  profile_links_enabled boolean,
  post_copy_enabled boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_codes text[] := public._normalize_country_codes(p_country_codes);
begin
  if v_uid is null then
    raise exception 'You must be logged in.';
  end if;

  if cardinality(v_codes) = 0 or cardinality(v_codes) > 5 then
    raise exception 'Choose between 1 and 5 countries.' using errcode = '22023';
  end if;

  return query
  select
    post.id,
    post.user_id,
    post.description,
    post.who,
    post.created_at_ms,
    post.search_terms,
    post.bg_color,
    post.bg_opacity,
    post.radius,
    post.font_color,
    coalesce(profile.my_posts_profile_icon_type, 'unknown'),
    coalesce(profile.my_posts_profile_links_enabled, false),
    coalesce(profile.my_posts_copy_enabled, true)
  from public.posts post
  join public.profiles profile on profile.id = post.user_id
  where profile.country_discovery_enabled = true
    and profile.phone_country_code = any(v_codes)
    and (
      p_cursor_created_at_ms is null
      or post.created_at_ms < p_cursor_created_at_ms
      or (
        post.created_at_ms = p_cursor_created_at_ms
        and post.id < p_cursor_id
      )
    )
  order by post.created_at_ms desc, post.id desc
  limit least(greatest(coalesce(p_page_size, 30), 1), 100);
end;
$$;

create or replace function public.get_country_posts_random_page(
  p_country_codes text[],
  p_page_size integer,
  p_seed text,
  p_cursor_score text default null,
  p_cursor_id uuid default null
)
returns table (
  id uuid,
  user_id uuid,
  description text,
  who text,
  created_at_ms bigint,
  search_terms text[],
  bg_color text,
  bg_opacity numeric,
  radius text,
  font_color text,
  profile_icon_type text,
  profile_links_enabled boolean,
  post_copy_enabled boolean,
  random_score text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_codes text[] := public._normalize_country_codes(p_country_codes);
begin
  if v_uid is null then
    raise exception 'You must be logged in.';
  end if;

  if cardinality(v_codes) = 0 or cardinality(v_codes) > 5 then
    raise exception 'Choose between 1 and 5 countries.' using errcode = '22023';
  end if;

  return query
  with ranked_posts as (
    select
      post.id,
      post.user_id,
      post.description,
      post.who,
      post.created_at_ms,
      post.search_terms,
      post.bg_color,
      post.bg_opacity,
      post.radius,
      post.font_color,
      coalesce(profile.my_posts_profile_icon_type, 'unknown') as profile_icon_type,
      coalesce(profile.my_posts_profile_links_enabled, false) as profile_links_enabled,
      coalesce(profile.my_posts_copy_enabled, true) as post_copy_enabled,
      md5(coalesce(p_seed, '') || ':' || post.id::text) as random_score
    from public.posts post
    join public.profiles profile on profile.id = post.user_id
    where profile.country_discovery_enabled = true
      and profile.phone_country_code = any(v_codes)
  )
  select
    ranked.id,
    ranked.user_id,
    ranked.description,
    ranked.who,
    ranked.created_at_ms,
    ranked.search_terms,
    ranked.bg_color,
    ranked.bg_opacity,
    ranked.radius,
    ranked.font_color,
    ranked.profile_icon_type,
    ranked.profile_links_enabled,
    ranked.post_copy_enabled,
    ranked.random_score
  from ranked_posts ranked
  where p_cursor_score is null
    or ranked.random_score > p_cursor_score
    or (
      ranked.random_score = p_cursor_score
      and ranked.id > p_cursor_id
    )
  order by ranked.random_score asc, ranked.id asc
  limit least(greatest(coalesce(p_page_size, 30), 1), 100);
end;
$$;

revoke all on function public._normalize_country_codes(text[]) from public;
revoke all on function public.save_my_phone_country(text) from public;
revoke all on function public.get_my_country_preferences() from public;
revoke all on function public.update_my_feed_countries(text[]) from public;
revoke all on function public.update_my_country_discovery(boolean) from public;
revoke all on function public.can_profile_appear_in_country_feed(uuid, text[]) from public;
revoke all on function public.get_country_posts_page(text[], integer, bigint, uuid) from public;
revoke all on function public.get_country_posts_random_page(text[], integer, text, text, uuid) from public;

grant execute on function public.get_my_country_preferences() to authenticated;
grant execute on function public.save_my_phone_country(text) to authenticated;
grant execute on function public.update_my_feed_countries(text[]) to authenticated;
grant execute on function public.update_my_country_discovery(boolean) to authenticated;
grant execute on function public.can_profile_appear_in_country_feed(uuid, text[]) to authenticated;
grant execute on function public.get_country_posts_page(text[], integer, bigint, uuid) to authenticated;
grant execute on function public.get_country_posts_random_page(text[], integer, text, text, uuid) to authenticated;

notify pgrst, 'reload schema';

commit;
