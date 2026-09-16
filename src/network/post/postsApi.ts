// postsApi.ts
import { supabase } from "../supabaseClient";
import { buildSearchTerms } from "./searchTerms";
import type { CreatePostInput, PostRow, PostsPageCursor } from "./postTypes";
import {
  DEFAULT_MY_POSTS_PAGE_SETTINGS,
  type MyPostsPageSettings,
} from "../../../app/edit/my_posts_types";
import { normalizeProfileIconType } from "@/features/profile/profile_icon";
import { normalizePostLayoutMode } from "@/features/posts/post_layout";

async function requireUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const uid = data.user?.id;
  if (!uid) throw new Error("You must be logged in.");
  return uid;
}

function isMissingRpcError(error: unknown) {
  return (
    !!error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: unknown }).code === "PGRST202"
  );
}

function getPostsPageCursor(rows: PostRow[]): PostsPageCursor {
  const last = rows[rows.length - 1] ?? null;
  return last ? { createdAtMs: last.created_at_ms, id: last.id } : null;
}

async function getPostsPageFallback(
  pageSize: number,
  cursor: PostsPageCursor,
  userId?: string
) {
  let q = supabase
    .from("posts")
    .select("*")
    .order("created_at_ms", { ascending: false })
    .order("id", { ascending: false })
    .limit(pageSize);

  if (userId) {
    q = q.eq("user_id", userId);
  }

  if (cursor) {
    q = q.or(
      `created_at_ms.lt.${cursor.createdAtMs},and(created_at_ms.eq.${cursor.createdAtMs},id.lt.${cursor.id})`
    );
  }

  const { data, error } = await q;
  if (error) throw error;

  const rows = (data ?? []) as PostRow[];
  return { rows, nextCursor: getPostsPageCursor(rows) };
}

export async function apiAddPost(input: CreatePostInput) {
  const description = input.description.trim();
  const who = input.who.trim();

  // Keep these client-side checks for fast UX.
  // The RPC must also validate them server-side.
  if (!description) {
    throw new Error("Description cannot be empty.");
  }

  if (description.length > 181) {
    throw new Error("Description cannot exceed 181 characters.");
  }

  if (who.length > 24) {
    throw new Error("Who cannot exceed 24 characters.");
  }

  const searchTerms = buildSearchTerms(description, who);

  const { data, error } = await supabase.rpc("create_post_with_limits", {
    p_description: description,
    p_who: who,
    p_search_terms: searchTerms,
  });

  if (error) throw error;
  return data as PostRow;
}

export async function apiDeletePost(postId: string) {
  await requireUserId();

  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw error;
}

export async function apiUpdatePostStyle(input: {
  postId: string;
  bgColor: string | null;
  bgOpacity: number;
  radius: string | null;
  fontColor: string | null;
}) {
  const { data, error } = await supabase.rpc("update_post_style_secure", {
    p_post_id: input.postId,
    p_bg_color: input.bgColor,
    p_bg_opacity: input.bgOpacity,
    p_radius: input.radius,
    p_font_color: input.fontColor,
  });

  if (error) throw error;
  return data as PostRow;
}

/**
 * Public: get latest posts
 */
export async function apiGetPostsPage(pageSize: number, cursor: PostsPageCursor) {
  const { data, error } = await supabase.rpc("get_public_posts_page", {
    p_page_size: pageSize,
    p_cursor_created_at_ms: cursor?.createdAtMs ?? null,
    p_cursor_id: cursor?.id ?? null,
  });

  if (error) {
    if (isMissingRpcError(error)) {
      return getPostsPageFallback(pageSize, cursor);
    }

    throw error;
  }

  const rows = (data ?? []) as PostRow[];
  const nextCursor = getPostsPageCursor(rows);

  return { rows, nextCursor };
}

export async function apiGetPostById(postId: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (error) throw error;
  return data as PostRow;
}

export async function apiGetUserPostById(postId: string) {
  const uid = await requireUserId();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .eq("user_id", uid)
    .single();

  if (error) throw error;
  return data as PostRow;
}

export async function apiGetPostsByUserPage(
  userId: string,
  pageSize: number,
  cursor: PostsPageCursor
) {
  const { data, error } = await supabase.rpc("get_public_user_posts_page", {
    p_user_id: userId,
    p_page_size: pageSize,
    p_cursor_created_at_ms: cursor?.createdAtMs ?? null,
    p_cursor_id: cursor?.id ?? null,
  });

  if (error) {
    if (isMissingRpcError(error)) {
      return getPostsPageFallback(pageSize, cursor, userId);
    }

    throw error;
  }

  const rows = (data ?? []) as PostRow[];
  const nextCursor = getPostsPageCursor(rows);

  return { rows, nextCursor };
}

export async function apiGetMyPostsPage(
  pageSize: number,
  cursor: PostsPageCursor
) {
  const uid = await requireUserId();
  return apiGetPostsByUserPage(uid, pageSize, cursor);
}

export type MyPostsPageSettingsRow = {
  my_posts_show_only_last: boolean | null;
  my_posts_auto_latest: boolean | null;
  my_posts_bg_color: string | null;
  my_posts_bg_opacity: number | null;
  my_posts_layout_mode: string | null;
  my_posts_profile_icon_type: string | null;
  my_posts_profile_links_enabled: boolean | null;
  my_posts_copy_enabled: boolean | null;
};

export function mapMyPostsPageSettingsRow(row: Partial<MyPostsPageSettingsRow> | null | undefined): MyPostsPageSettings {
  return {
    showOnlyLast: !!row?.my_posts_show_only_last,
    autoLatest: !!row?.my_posts_auto_latest,
    bgColor: row?.my_posts_bg_color ?? DEFAULT_MY_POSTS_PAGE_SETTINGS.bgColor,
    bgOpacity: Math.max(
      0.2,
      Number(row?.my_posts_bg_opacity ?? DEFAULT_MY_POSTS_PAGE_SETTINGS.bgOpacity)
    ),
    layoutMode: normalizePostLayoutMode(
      row?.my_posts_layout_mode ?? DEFAULT_MY_POSTS_PAGE_SETTINGS.layoutMode
    ),
    profileIconType: normalizeProfileIconType(
      row?.my_posts_profile_icon_type ?? DEFAULT_MY_POSTS_PAGE_SETTINGS.profileIconType
    ),
    profileLinksEnabled: !!row?.my_posts_profile_links_enabled,
    postCopyEnabled:
      row?.my_posts_copy_enabled ?? DEFAULT_MY_POSTS_PAGE_SETTINGS.postCopyEnabled,
  };
}

export async function apiGetPublicMyPostsPageSettings(userId: string) {
  const { data, error } = await supabase
    .rpc("get_public_my_posts_page_settings", {
      p_user_id: userId,
    })
    .maybeSingle();

  if (error) throw error;

  return (
    data ?? {
      my_posts_show_only_last: DEFAULT_MY_POSTS_PAGE_SETTINGS.showOnlyLast,
      my_posts_auto_latest: DEFAULT_MY_POSTS_PAGE_SETTINGS.autoLatest,
      my_posts_bg_color: DEFAULT_MY_POSTS_PAGE_SETTINGS.bgColor,
      my_posts_bg_opacity: DEFAULT_MY_POSTS_PAGE_SETTINGS.bgOpacity,
      my_posts_layout_mode: DEFAULT_MY_POSTS_PAGE_SETTINGS.layoutMode,
      my_posts_profile_icon_type: DEFAULT_MY_POSTS_PAGE_SETTINGS.profileIconType,
      my_posts_profile_links_enabled:
        DEFAULT_MY_POSTS_PAGE_SETTINGS.profileLinksEnabled,
      my_posts_copy_enabled: DEFAULT_MY_POSTS_PAGE_SETTINGS.postCopyEnabled,
    }
  ) as MyPostsPageSettingsRow;
}

export async function apiGetMyPostsPageSettings() {
  const { data, error } = await supabase
    .rpc("get_my_posts_page_settings")
    .maybeSingle();

  if (error) throw error;

  return (
    data ?? {
      my_posts_show_only_last: DEFAULT_MY_POSTS_PAGE_SETTINGS.showOnlyLast,
      my_posts_auto_latest: DEFAULT_MY_POSTS_PAGE_SETTINGS.autoLatest,
      my_posts_bg_color: DEFAULT_MY_POSTS_PAGE_SETTINGS.bgColor,
      my_posts_bg_opacity: DEFAULT_MY_POSTS_PAGE_SETTINGS.bgOpacity,
      my_posts_layout_mode: DEFAULT_MY_POSTS_PAGE_SETTINGS.layoutMode,
      my_posts_profile_icon_type: DEFAULT_MY_POSTS_PAGE_SETTINGS.profileIconType,
      my_posts_profile_links_enabled:
        DEFAULT_MY_POSTS_PAGE_SETTINGS.profileLinksEnabled,
      my_posts_copy_enabled: DEFAULT_MY_POSTS_PAGE_SETTINGS.postCopyEnabled,
    }
  ) as MyPostsPageSettingsRow;
}

export async function apiUpdateMyPostsPageSettings(input: MyPostsPageSettings) {
  const { data, error } = await supabase
    .rpc("update_my_posts_page_settings", {
      p_show_only_last: input.showOnlyLast,
      p_auto_latest: input.autoLatest,
      p_bg_color: input.bgColor,
      p_bg_opacity: input.bgOpacity,
      p_layout_mode: input.layoutMode,
      p_profile_icon_type: input.profileIconType,
      p_profile_links_enabled: input.profileLinksEnabled,
      p_copy_enabled: input.postCopyEnabled,
    })
    .single();

  if (error) {
    if (isMissingRpcError(error)) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .rpc("update_my_posts_page_settings", {
          p_show_only_last: input.showOnlyLast,
          p_auto_latest: input.autoLatest,
          p_bg_color: input.bgColor,
          p_bg_opacity: input.bgOpacity,
          p_profile_icon_type: input.profileIconType,
          p_profile_links_enabled: input.profileLinksEnabled,
          p_copy_enabled: input.postCopyEnabled,
        })
        .single();

      if (fallbackError) throw fallbackError;

      return {
        ...(fallbackData as MyPostsPageSettingsRow),
        my_posts_layout_mode: input.layoutMode,
      };
    }

    throw error;
  }

  return data as MyPostsPageSettingsRow;
}
