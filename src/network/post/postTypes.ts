export type PostRow = {
  id: string;
  user_id: string;
  description: string;
  who: string;
  created_at_ms: number;
  search_terms: string[];

  bg_color: string | null; // hex code, e.g. #ff0000
  bg_opacity: number | string;
  radius: string | null; // rectangle, circle, rounded

  font_color: string | null;

  profile_icon_type?: string | null;
  profile_links_enabled?: boolean | null;
  post_copy_enabled?: boolean | null;
};

export type CreatePostInput = {
  description: string;
  who: string;
};

export type PostsPageCursor = {
  createdAtMs: number;
  id: string;
} | null;
