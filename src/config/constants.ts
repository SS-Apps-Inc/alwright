export const APP_NAME = "Alwright";
export const APP_TAGLINE = "Connect Intentionally";
export const APP_VERSION = "1.1.0";
export const ANDROID_BUILD_NUMBER = 37;
export const ANDROID_PACKAGE_ID = "ca.ssapps.alwright";

export const PUBLIC_SITE_URL = "https://alwright.cc";
export const PRIVACY_URL = `${PUBLIC_SITE_URL}/privacy`;
export const TERMS_URL = `${PUBLIC_SITE_URL}/terms`;
export const OG_IMAGE_URL = `${PUBLIC_SITE_URL}/og.png`;
export const GOOGLE_PLAY_URL =
  `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_ID}`;
export const GITHUB_REPOSITORY_URL =
  "https://github.com/SS-Apps-Inc/alwright";

export const SUPPORT_EMAIL = "support@alwright.cc";
export const SUPPORT_EMAIL_URL =
  `mailto:${SUPPORT_EMAIL}?subject=App%20Support`;

export const WEB_METADATA = {
  title: `${APP_NAME} — ${APP_TAGLINE}`,
  description:
    "Connect intentionally with people through meaningful public thoughts. No likes and no algorithm—just posts, personal pages, and conversations you choose.",
  canonicalUrl: `${PUBLIC_SITE_URL}/`,
  imageUrl: OG_IMAGE_URL,
} as const;

export const SAFETY_URLS = {
  cybertip: "https://www.cybertip.ca/en/report/",
  canadianCriminalCode:
    "https://laws-lois.justice.gc.ca/eng/acts/c-46/section-163.1.html",
} as const;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST_INPUT_LIMITS = {
  description: 181,
  who: 24,
} as const;

export const DEFAULT_POST_STYLE = {
  backgroundColor: "#EAEAEA",
  backgroundOpacity: 1,
  fontColor: "#111111",
  backgroundRadius: "rounded",
} as const;

export const POST_FONT_COLORS = ["#111111", "#FFFFFF", "#8E8E93"] as const;
export const POST_RADIUS_OPTIONS = [
  "rectangle",
  "rounded",
  "circle",
  "wavy",
] as const;

export const BILLING_PLAN_DAILY_POST_LIMITS = {
  free: 2,
  starter: 6,
  pro: 31,
} as const;

export const REVENUECAT_OFFERING_ID = "alwright.v1";

export const DEFAULT_POST_LAYOUT_MODE_VALUE = "top_70";
export const POST_LAYOUT_OPTIONS_CONFIG = [
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
] as const;

export const DEFAULT_PROFILE_ICON_TYPE = "unknown";
export const PROFILE_ICON_OPTIONS_CONFIG = [
  { type: "unknown", label: "?" },
  { type: "female", label: "👩" },
  { type: "male", label: "👨" },
] as const;

export const PAGINATION = {
  homePosts: 30,
  publicUserPosts: 30,
  myPosts: 5,
} as const;

export const FEED_COUNTRY_SELECTION_LIMIT = 5;
export const HOME_MEMORY_POST_LIMIT = 30;

export const STORAGE_KEYS = {
  auth: {
    accessToken: "auth.accessToken",
    refreshToken: "auth.refreshToken",
    userId: "auth.userId",
  },
  homePosts: "home_posts_memory_v4",
} as const;

export const UI_CONSTANTS = {
  countryListItemHeight: 62,
  countryIndexLetters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  postLayoutOptionSize: 38,
  splashWebLogoSize: 110,
  minimumBackgroundOpacity: 0.2,
} as const;
