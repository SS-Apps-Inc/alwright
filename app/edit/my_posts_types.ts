import type { PostUI, PostUIRadius } from "@/network/post/postMappers";
import type { ProfileIconType } from "@/features/profile/profile_icon";
import {
  DEFAULT_POST_LAYOUT_MODE,
  type PostLayoutMode,
} from "@/features/posts/post_layout";

export type EditablePostStyle = {
  bgColor: string | null;
  bgOpacity: number;
  bgRadius: PostUIRadius;
  fontColor: string | null;
};

export type MyPostsUpdatePayload = {
  postId: string;
  style: EditablePostStyle;
};

export function getEditableStyleFromPost(post: PostUI): EditablePostStyle {
  return {
    bgColor: post.bgColor ?? "#EAEAEA",
    bgOpacity: post.bgOpacity ?? 1,
    bgRadius: post.bgRadius ?? "rounded",
    fontColor: post.fontColor ?? "#111111",
  };
}

export type MyPostsPageSettings = {
  showOnlyLast: boolean;
  autoLatest: boolean;
  bgColor: string | null;
  bgOpacity: number;
  layoutMode: PostLayoutMode;
  profileIconType: ProfileIconType;
  profileLinksEnabled: boolean;
  postCopyEnabled: boolean;
};

export const DEFAULT_MY_POSTS_PAGE_SETTINGS: MyPostsPageSettings = {
  showOnlyLast: false,
  autoLatest: true,
  bgColor: null,
  bgOpacity: 1,
  layoutMode: DEFAULT_POST_LAYOUT_MODE,
  profileIconType: "unknown",
  profileLinksEnabled: false,
  postCopyEnabled: true,
};
