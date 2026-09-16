export type ProfileIconType = "unknown" | "female" | "male";

export const PROFILE_ICON_OPTIONS: {
  type: ProfileIconType;
  label: string;
}[] = [
  { type: "unknown", label: "?" },
  { type: "female", label: "👩" },
  { type: "male", label: "👨" },
];

export function normalizeProfileIconType(value: unknown): ProfileIconType {
  if (value === "female" || value === "male" || value === "unknown") {
    return value;
  }

  return "unknown";
}

export function getProfileIconLabel(value: unknown) {
  const type = normalizeProfileIconType(value);
  return PROFILE_ICON_OPTIONS.find((option) => option.type === type)?.label ?? "?";
}
