import type { PostUI, PostUIRadius } from "@/network/post/postMappers";
import type { ProfileIconType } from "@/features/profile/profile_icon";
import {
  DEFAULT_POST_LAYOUT_MODE,
  type PostLayoutMode,
} from "@/features/posts/post_layout";
import { DEFAULT_POST_STYLE } from "@/config";

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
    bgColor: post.bgColor ?? DEFAULT_POST_STYLE.backgroundColor,
    bgOpacity: post.bgOpacity ?? DEFAULT_POST_STYLE.backgroundOpacity,
    bgRadius: post.bgRadius ?? DEFAULT_POST_STYLE.backgroundRadius,
    fontColor: post.fontColor ?? DEFAULT_POST_STYLE.fontColor,
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
  countryDiscoveryEnabled: boolean;
  phoneCountryCode: string | null;
  phoneCountryFlag: string | null;
  postCopyEnabled: boolean;
};

export const DEFAULT_MY_POSTS_PAGE_SETTINGS: MyPostsPageSettings = {
  showOnlyLast: false,
  autoLatest: true,
  bgColor: null,
  bgOpacity: 1,
  layoutMode: DEFAULT_POST_LAYOUT_MODE,
  profileIconType: "unknown",
  profileLinksEnabled: true,
  countryDiscoveryEnabled: true,
  phoneCountryCode: null,
  phoneCountryFlag: null,
  postCopyEnabled: true,
};
