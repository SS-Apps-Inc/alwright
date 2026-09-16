// home_posts_defaults.ts
import type { PostUI } from "@/network/post/postMappers";

const DEFAULT_BG_COLOR = "#EAEAEA";
const DEFAULT_FONT_COLOR = "#111111";
const DEFAULT_BG_RADIUS: PostUI["bgRadius"] = "rounded";

export function withPostDefaults(post: PostUI): PostUI {
  return {
    ...post,
    bgColor: post.bgColor ?? DEFAULT_BG_COLOR,
    fontColor: post.fontColor ?? DEFAULT_FONT_COLOR,
    bgRadius: post.bgRadius ?? DEFAULT_BG_RADIUS,
    bgOpacity:
      typeof post.bgOpacity === "number" && Number.isFinite(post.bgOpacity)
        ? post.bgOpacity
        : 1,
  };
}

export function withPostDefaultsList(posts: PostUI[]) {
  return posts.map(withPostDefaults);
}