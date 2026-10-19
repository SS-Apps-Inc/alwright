// home_posts_defaults.ts
import type { PostUI } from "@/network/post/postMappers";
import { DEFAULT_POST_STYLE } from "@/config";

export function withPostDefaults(post: PostUI): PostUI {
  return {
    ...post,
    bgColor: post.bgColor ?? DEFAULT_POST_STYLE.backgroundColor,
    fontColor: post.fontColor ?? DEFAULT_POST_STYLE.fontColor,
    bgRadius: post.bgRadius ?? DEFAULT_POST_STYLE.backgroundRadius,
    bgOpacity:
      typeof post.bgOpacity === "number" && Number.isFinite(post.bgOpacity)
        ? post.bgOpacity
        : DEFAULT_POST_STYLE.backgroundOpacity,
  };
}

export function withPostDefaultsList(posts: PostUI[]) {
  return posts.map(withPostDefaults);
}
