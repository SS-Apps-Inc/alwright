export const colors = {
  background: "#0B0B0C",
  backgroundLower: "#0b0b0b",
  surface: "#1C1C1E",
  surfaceBorder: "#2A2A2A",
  text: "#FFFFFF",
  textMuted: "#AFAFAF",
  textInverse: "#111111",
  overlay: "#000000",
  white: "#ffffff",
  pressed: "rgba(255,255,255,0.72)",
  subtleBorder: "rgba(255,255,255,0.12)",
  darkFloating: "rgba(28,28,30,0.72)",
  darkControl: "rgba(20,20,20,0.72)",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 22,
  pill: 999,
} as const;

export const typography = {
  weight: {
    semibold: "600",
    bold: "700",
    heavy: "800",
    black: "900",
  },
} as const;
