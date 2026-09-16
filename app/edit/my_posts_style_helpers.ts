import type { PostUI } from "@/network/post/postMappers";
import type { EditablePostStyle } from "./my_posts_types";

export function applyPostStyle(post: PostUI, style: EditablePostStyle): PostUI {
  return {
    ...post,
    bgColor: style.bgColor,
    bgOpacity: style.bgOpacity,
    bgRadius: style.bgRadius,
    fontColor: style.fontColor,
  };
}

export function applyPostStyleToList(
  posts: PostUI[],
  postId: string,
  style: EditablePostStyle
) {
  return posts.map((post) =>
    post.id === postId ? applyPostStyle(post, style) : post
  );
}