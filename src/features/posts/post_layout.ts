import {
  DEFAULT_POST_LAYOUT_MODE_VALUE,
  POST_LAYOUT_OPTIONS_CONFIG,
} from "@/config";

export type PostLayoutMode = "list" | "top_70" | "top_50" | "top_30";

export const DEFAULT_POST_LAYOUT_MODE: PostLayoutMode =
  DEFAULT_POST_LAYOUT_MODE_VALUE;

export const POST_LAYOUT_OPTIONS: {
  mode: PostLayoutMode;
  title: string;
  subtitle: string;
}[] = POST_LAYOUT_OPTIONS_CONFIG.map((option) => ({ ...option }));

export function normalizePostLayoutMode(value: unknown): PostLayoutMode {
  if (
    value === "list" ||
    value === "top_70" ||
    value === "top_50" ||
    value === "top_30"
  ) {
    return value;
  }

  return DEFAULT_POST_LAYOUT_MODE;
}

export function getMainPostRatio(mode: PostLayoutMode) {
  if (mode === "top_50") return 0.5;
  if (mode === "top_30") return 0.3;
  return 0.7;
}

export function isListOnlyLayout(mode: PostLayoutMode) {
  return mode === "list";
}
