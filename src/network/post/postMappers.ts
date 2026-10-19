import type { PostRow } from "./postTypes";
import {
  normalizeProfileIconType,
  type ProfileIconType,
} from "@/features/profile/profile_icon";

export type PostUIRadius = "rectangle" | "circle" | "rounded" | "wavy";

export type PostUI = {
  id: string;
  userId: string;
  description: string;
  who: string;
  createdAtMs: number;

  bgColor: string | null;
  bgOpacity: number;
  bgRadius: PostUIRadius;

  fontColor: string | null;

  profileIconType: ProfileIconType;
  profileLinksEnabled: boolean;
  postCopyEnabled: boolean;
};
function normalizeRadius(value: string | null): PostUIRadius {
  if (
    value === "circle" ||
    value === "rounded" ||
    value === "rectangle" ||
    value === "wavy"
  ) {
    return value;
  }
  return "rounded";
}

export function mapPostRowToUI(r: PostRow): PostUI {
  const bgOpacity = Number(r.bg_opacity);

  return {
    id: r.id,
    userId: r.user_id,
    description: r.description,
    who: r.who,
    createdAtMs: r.created_at_ms,
    bgColor: r.bg_color,
    bgOpacity: Number.isFinite(bgOpacity) ? bgOpacity : 1,
    bgRadius: normalizeRadius(r.radius),
    fontColor: r.font_color,
    profileIconType: normalizeProfileIconType(r.profile_icon_type),
    profileLinksEnabled: !!r.profile_links_enabled,
    postCopyEnabled: r.post_copy_enabled !== false,
  };
}
