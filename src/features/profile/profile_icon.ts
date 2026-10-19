import {
  DEFAULT_PROFILE_ICON_TYPE,
  PROFILE_ICON_OPTIONS_CONFIG,
} from "@/config";

export type ProfileIconType = "unknown" | "female" | "male";

export const PROFILE_ICON_OPTIONS: {
  type: ProfileIconType;
  label: string;
}[] = PROFILE_ICON_OPTIONS_CONFIG.map((option) => ({ ...option }));

export function normalizeProfileIconType(value: unknown): ProfileIconType {
  if (value === "female" || value === "male" || value === "unknown") {
    return value;
  }

  return DEFAULT_PROFILE_ICON_TYPE;
}

export function getProfileIconLabel(value: unknown) {
  const type = normalizeProfileIconType(value);
  return PROFILE_ICON_OPTIONS.find((option) => option.type === type)?.label ?? "?";
}
