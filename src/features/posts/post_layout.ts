export type PostLayoutMode = "list" | "top_70" | "top_50" | "top_30";

export const DEFAULT_POST_LAYOUT_MODE: PostLayoutMode = "top_70";

export const POST_LAYOUT_OPTIONS: {
  mode: PostLayoutMode;
  title: string;
  subtitle: string;
}[] = [
  {
    mode: "list",
    title: "List",
    subtitle: "Horizontal post list only.",
  },
  {
    mode: "top_70",
    title: "70 / 30",
    subtitle: "Latest post large, list compact.",
  },
  {
    mode: "top_50",
    title: "50 / 50",
    subtitle: "Latest post and list balanced.",
  },
  {
    mode: "top_30",
    title: "30 / 70",
    subtitle: "Latest post compact, list large.",
  },
];

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
