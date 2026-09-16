// post_card_helpers.ts
import { Platform } from "react-native";

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function getContainerRadius(
  size: number,
  radius: "rectangle" | "circle" | "rounded"
) {
  if (radius === "circle") return size / 2;
  if (radius === "rectangle") return 1;
  return 22;
}

export function hexToRgba(hex: string | null, opacity: number) {
  const safeOpacity = clamp(opacity, 0, 1);

  if (!hex) return `rgba(255,255,255,${safeOpacity})`;

  const normalized = hex.replace("#", "");

  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16);
    const g = parseInt(normalized[1] + normalized[1], 16);
    const b = parseInt(normalized[2] + normalized[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${safeOpacity})`;
  }

  if (normalized.length === 6) {
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${safeOpacity})`;
  }

  return `rgba(255,255,255,${safeOpacity})`;
}

export function getMinDescriptionFontSize() {
  return Platform.OS === "web" ? 18 : 14;
}

export function getMaxDescriptionFontSize() {
  return Platform.OS === "web" ? 176 : 160;
}

export function getWhoFontSize(width: number, who: string) {
  const len = Math.max(who.trim().length, 3);
  return clamp(
    width / (len * 0.95),
    Platform.OS === "web" ? 12 : 11,
    Platform.OS === "web" ? 22 : 18
  );
}

export function getDateFontSize(width: number, showDate: boolean) {
  if (!showDate) return Platform.OS === "web" ? 9 : 10;
  return clamp(
    width * 0.028,
    Platform.OS === "web" ? 9 : 10,
    Platform.OS === "web" ? 13 : 15
  );
}

export function getShapeInsets(
  width: number,
  height: number,
  radius: "rectangle" | "circle" | "rounded"
) {
  if (radius === "circle") {
    const size = Math.min(width, height);
    return {
      left: Math.round(size * 0.2),
      right: Math.round(size * 0.2),
      top: Math.round(size * 0.16),
      bottom: Math.round(size * 0.16),
    };
  }

  if (radius === "rounded") {
    return { left: 16, right: 16, top: 14, bottom: 14 };
  }

  return { left: 12, right: 12, top: 10, bottom: 10 };
}

export function getTextDirection(text: string): "rtl" | "ltr" {
  const rtlCount =
    text.match(/[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/g)?.length ?? 0;
  const ltrCount = text.match(/[A-Za-z]/g)?.length ?? 0;
  return rtlCount > ltrCount ? "rtl" : "ltr";
}

export function normalizeMixedText(
  input: string,
  direction: "rtl" | "ltr"
) {
  const ZWSP = "\u200B";
  const LRM = "\u200E";
  const RLM = "\u200F";

  let text = input;

  text = text.replace(/([\u0600-\u06FF])([A-Za-z0-9])/g, `$1${ZWSP}$2`);
  text = text.replace(/([A-Za-z0-9])([\u0600-\u06FF])/g, `$1${ZWSP}$2`);

  text = text.replace(
    /([A-Za-z0-9@#%&*_.:/+\-]+(?:\s+[A-Za-z0-9@#%&*_.:/+\-]+)*)/g,
    `${LRM}$1${LRM}`
  );

  return direction === "rtl" ? `${RLM}${text}${RLM}` : text;
}


// ------------ COLOR HELPER ------

export function normalizeHexColor(hex: string | null | undefined, fallback = "#111111") {
  if (!hex) return fallback;

  const value = hex.trim();

  if (/^#[0-9A-Fa-f]{6}$/.test(value)) return value;

  if (/^#[0-9A-Fa-f]{3}$/.test(value)) {
    return (
      "#" +
      value[1] + value[1] +
      value[2] + value[2] +
      value[3] + value[3]
    );
  }

  return fallback;
}

export function hexToRgb(hex: string) {
  const normalized = normalizeHexColor(hex);
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number) {
  const toHex = (v: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(v)));
    return clamped.toString(16).padStart(2, "0");
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function mixHexColors(baseHex: string, mixWithHex: string, amount: number) {
  const a = Math.max(0, Math.min(1, amount));
  const base = hexToRgb(baseHex);
  const mix = hexToRgb(mixWithHex);

  return rgbToHex(
    base.r * (1 - a) + mix.r * a,
    base.g * (1 - a) + mix.g * a,
    base.b * (1 - a) + mix.b * a
  );
}

export function getPostTextColors(fontColor: string | null | undefined) {
  const main = normalizeHexColor(fontColor, "#111111");

  return {
    main,
    date: mixHexColors(main, "#ffffff", 0.28),
    who: mixHexColors(main, "#ffffff", 0.22),
    actionText: main,
  };
}
