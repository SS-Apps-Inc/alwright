-- Run this in the Supabase SQL editor.
-- It adds the static profile icon and public post permission settings used by the app.

alter table public.profiles
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists page_bg_color text,
  add column if not exists page_bg_opacity numeric not null default 1,
  add column if not exists show_post_list boolean not null default true,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists my_posts_show_only_last boolean not null default false,
  add column if not exists my_posts_auto_latest boolean not null default false,
  add column if not exists my_posts_bg_color text,
  add column if not exists my_posts_bg_opacity numeric not null default 1,
  add column if not exists my_posts_layout_mode text not null default 'top_70',
  add column if not exists my_posts_profile_icon_type text not null default 'unknown',
  add column if not exists my_posts_profile_links_enabled boolean not null default true,
  add column if not exists my_posts_copy_enabled boolean not null default true;

alter table public.profiles
  alter column my_posts_profile_links_enabled set default true;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_my_posts_profile_icon_type_check'
  ) then
    alter table public.profiles
      add constraint profiles_my_posts_profile_icon_type_check
      check (my_posts_profile_icon_type in ('unknown', 'female', 'male'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_my_posts_layout_mode_check'
  ) then
    alter table public.profiles
      add constraint profiles_my_posts_layout_mode_check
      check (my_posts_layout_mode in ('list', 'top_70', 'top_50', 'top_30'));
  end if;
end $$;

drop function if exists public.get_my_posts_page_settings();
create or replace function public.get_my_posts_page_settings()
returns table (
  my_posts_show_only_last boolean,
  my_posts_auto_latest boolean,
  my_posts_bg_color text,
  my_posts_bg_opacity numeric,
  my_posts_layout_mode text,
  my_posts_profile_icon_type text,
  my_posts_profile_links_enabled boolean,
  my_posts_copy_enabled boolean
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
    coalesce(p.my_posts_show_only_last, false),
    coalesce(p.my_posts_auto_latest, false),
    p.my_posts_bg_color,
    coalesce(p.my_posts_bg_opacity, 1),
    coalesce(p.my_posts_layout_mode, 'top_70'),
    coalesce(p.my_posts_profile_icon_type, 'unknown'),
    coalesce(p.my_posts_profile_links_enabled, false),
    coalesce(p.my_posts_copy_enabled, true)
  from public.profiles p
  where p.id = v_uid;
end;
$$;

drop function if exists public.get_public_my_posts_page_settings(uuid);
create or replace function public.get_public_my_posts_page_settings(p_user_id uuid)
returns table (
  my_posts_show_only_last boolean,
  my_posts_auto_latest boolean,
  my_posts_bg_color text,
  my_posts_bg_opacity numeric,
  my_posts_layout_mode text,
  my_posts_profile_icon_type text,
  my_posts_profile_links_enabled boolean,
  my_posts_copy_enabled boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(p.my_posts_show_only_last, false),
    coalesce(p.my_posts_auto_latest, false),
    p.my_posts_bg_color,
    coalesce(p.my_posts_bg_opacity, 1),
    coalesce(p.my_posts_layout_mode, 'top_70'),
    coalesce(p.my_posts_profile_icon_type, 'unknown'),
    coalesce(p.my_posts_profile_links_enabled, false),
    coalesce(p.my_posts_copy_enabled, true)
  from public.profiles p
  where p.id = p_user_id;
$$;

drop function if exists public.update_my_posts_page_settings(boolean, boolean, text, numeric);
drop function if exists public.update_my_posts_page_settings(boolean, boolean, text, numeric, text, boolean, boolean);
drop function if exists public.update_my_posts_page_settings(boolean, boolean, text, numeric, text, text, boolean, boolean);
create or replace function public.update_my_posts_page_settings(
  p_show_only_last boolean,
  p_auto_latest boolean,
  p_bg_color text,
  p_bg_opacity numeric,
  p_layout_mode text,
  p_profile_icon_type text,
  p_profile_links_enabled boolean,
  p_copy_enabled boolean
)
returns table (
  my_posts_show_only_last boolean,
  my_posts_auto_latest boolean,
  my_posts_bg_color text,
  my_posts_bg_opacity numeric,
  my_posts_layout_mode text,
  my_posts_profile_icon_type text,
  my_posts_profile_links_enabled boolean,
  my_posts_copy_enabled boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_icon text := coalesce(p_profile_icon_type, 'unknown');
  v_layout text := coalesce(p_layout_mode, 'top_70');
begin
  if v_uid is null then
    raise exception 'You must be logged in.';
  end if;

  if v_icon not in ('unknown', 'female', 'male') then
    raise exception 'Invalid profile icon type.';
  end if;

  if v_layout not in ('list', 'top_70', 'top_50', 'top_30') then
    raise exception 'Invalid post layout mode.';
  end if;

  insert into public.profiles (
    id,
    page_bg_color,
    page_bg_opacity,
    show_post_list,
    my_posts_show_only_last,
    my_posts_auto_latest,
    my_posts_bg_color,
    my_posts_bg_opacity,
    my_posts_layout_mode,
    my_posts_profile_icon_type,
    my_posts_profile_links_enabled,
    my_posts_copy_enabled
  )
  values (
    v_uid,
    null,
    1,
    true,
    coalesce(p_show_only_last, false),
    coalesce(p_auto_latest, false),
    p_bg_color,
    greatest(0.2, least(1, coalesce(p_bg_opacity, 1))),
    v_layout,
    v_icon,
    coalesce(p_profile_links_enabled, false),
    coalesce(p_copy_enabled, true)
  )
  on conflict (id) do update set
    my_posts_show_only_last = excluded.my_posts_show_only_last,
    my_posts_auto_latest = excluded.my_posts_auto_latest,
    my_posts_bg_color = excluded.my_posts_bg_color,
    my_posts_bg_opacity = excluded.my_posts_bg_opacity,
    my_posts_layout_mode = excluded.my_posts_layout_mode,
    my_posts_profile_icon_type = excluded.my_posts_profile_icon_type,
    my_posts_profile_links_enabled = excluded.my_posts_profile_links_enabled,
    my_posts_copy_enabled = excluded.my_posts_copy_enabled,
    updated_at = now();

  return query
  select
    coalesce(p.my_posts_show_only_last, false),
    coalesce(p.my_posts_auto_latest, false),
    p.my_posts_bg_color,
    coalesce(p.my_posts_bg_opacity, 1),
    coalesce(p.my_posts_layout_mode, 'top_70'),
    coalesce(p.my_posts_profile_icon_type, 'unknown'),
    coalesce(p.my_posts_profile_links_enabled, false),
    coalesce(p.my_posts_copy_enabled, true)
  from public.profiles p
  where p.id = v_uid;
end;
$$;

drop function if exists public.get_public_posts_page(integer, bigint, uuid);
create or replace function public.get_public_posts_page(
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
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.user_id,
    p.description,
    p.who,
    p.created_at_ms,
    p.search_terms,
    p.bg_color,
    p.bg_opacity,
    p.radius,
    p.font_color,
    coalesce(pr.my_posts_profile_icon_type, 'unknown') as profile_icon_type,
    coalesce(pr.my_posts_profile_links_enabled, false) as profile_links_enabled,
    coalesce(pr.my_posts_copy_enabled, true) as post_copy_enabled
  from public.posts p
  left join public.profiles pr on pr.id = p.user_id
  where
    p_cursor_created_at_ms is null
    or p.created_at_ms < p_cursor_created_at_ms
    or (
      p.created_at_ms = p_cursor_created_at_ms
      and p.id < p_cursor_id
    )
  order by p.created_at_ms desc, p.id desc
  limit least(greatest(coalesce(p_page_size, 30), 1), 100);
$$;

drop function if exists public.get_public_posts_random_page(integer, text, text, uuid);
create or replace function public.get_public_posts_random_page(
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
language sql
stable
security definer
set search_path = public
as $$
  with ranked_posts as (
    select
      p.id,
      p.user_id,
      p.description,
      p.who,
      p.created_at_ms,
      p.search_terms,
      p.bg_color,
      p.bg_opacity,
      p.radius,
      p.font_color,
      coalesce(pr.my_posts_profile_icon_type, 'unknown') as profile_icon_type,
      coalesce(pr.my_posts_profile_links_enabled, false) as profile_links_enabled,
      coalesce(pr.my_posts_copy_enabled, true) as post_copy_enabled,
      md5(coalesce(p_seed, '') || ':' || p.id::text) as random_score
    from public.posts p
    left join public.profiles pr on pr.id = p.user_id
  )
  select
    r.id,
    r.user_id,
    r.description,
    r.who,
    r.created_at_ms,
    r.search_terms,
    r.bg_color,
    r.bg_opacity,
    r.radius,
    r.font_color,
    r.profile_icon_type,
    r.profile_links_enabled,
    r.post_copy_enabled,
    r.random_score
  from ranked_posts r
  where
    p_cursor_score is null
    or r.random_score > p_cursor_score
    or (
      r.random_score = p_cursor_score
      and r.id > p_cursor_id
    )
  order by r.random_score asc, r.id asc
  limit least(greatest(coalesce(p_page_size, 30), 1), 100);
$$;

drop function if exists public.get_public_user_posts_page(uuid, integer, bigint, uuid);
create or replace function public.get_public_user_posts_page(
  p_user_id uuid,
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
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.user_id,
    p.description,
    p.who,
    p.created_at_ms,
    p.search_terms,
    p.bg_color,
    p.bg_opacity,
    p.radius,
    p.font_color,
    coalesce(pr.my_posts_profile_icon_type, 'unknown') as profile_icon_type,
    coalesce(pr.my_posts_profile_links_enabled, false) as profile_links_enabled,
    coalesce(pr.my_posts_copy_enabled, true) as post_copy_enabled
  from public.posts p
  left join public.profiles pr on pr.id = p.user_id
  where
    p.user_id = p_user_id
    and (
      p_cursor_created_at_ms is null
      or p.created_at_ms < p_cursor_created_at_ms
      or (
        p.created_at_ms = p_cursor_created_at_ms
        and p.id < p_cursor_id
      )
    )
  order by p.created_at_ms desc, p.id desc
  limit least(greatest(coalesce(p_page_size, 30), 1), 100);
$$;

grant execute on function public.get_public_posts_page(integer, bigint, uuid) to anon, authenticated;
grant execute on function public.get_public_posts_random_page(integer, text, text, uuid) to anon, authenticated;
grant execute on function public.get_public_user_posts_page(uuid, integer, bigint, uuid) to anon, authenticated;
grant execute on function public.get_public_my_posts_page_settings(uuid) to anon, authenticated;
grant execute on function public.get_my_posts_page_settings() to authenticated;
grant execute on function public.update_my_posts_page_settings(boolean, boolean, text, numeric, text, text, boolean, boolean) to authenticated;

notify pgrst, 'reload schema';
