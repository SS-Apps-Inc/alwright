export const media = {
  appIcon: require("../../assets/images/icon.png"),
  marketing: {
    founderQuote: require("../../assets/marketing/founder-quote.png"),
    vanHero: require("../../assets/marketing/van-hero.png"),
    writeItDownHero: require("../../assets/marketing/write-it-down-hero.png"),
  },
  tabs: {
    home: {
      active: require("../../assets/tab-icons/home.active.png"),
      inactive: require("../../assets/tab-icons/home.inactive.png"),
    },
    write: {
      active: require("../../assets/tab-icons/write.active.png"),
      inactive: require("../../assets/tab-icons/write.inactive.png"),
    },
    settings: {
      active: require("../../assets/tab-icons/setting.active.png"),
      inactive: require("../../assets/tab-icons/setting.inactive.png"),
    },
  },
} as const;

export function getMediaUri(source: { uri?: string } | string) {
  return typeof source === "string" ? source : source.uri ?? "";
}

export const logoVectorMedia = {
  viewBox: 1024,
  pathA:
    "M3115 5963 c-173 -21 -330 -84 -469 -187 -205 -152 -355 -413 -401 -699 -20 -126 -20 -358 0 -484 42 -263 168 -501 348 -661 183 -162 350 -229 597 -239 289 -11 507 72 698 265 l82 83 0 -160 0 -161 280 0 280 0 0 1105 0 1105 -280 0 -280 0 0 -157 0 -158 -51 58 c-97 110 -261 214 -404 256 -114 34 -287 48 -400 34z m400 -498 c219 -57 371 -213 431 -440 24 -94 25 -292 0 -390 -54 -219 -214 -389 -417 -441 -135 -35 -282 -18 -413 48 -89 45 -201 162 -249 260 -143 295 -72 685 156 858 63 47 168 97 228 109 72 14 201 12 264 -4z",
  pathL:
    "M5220 5200 l0 -1480 275 0 275 0 0 1480 0 1480 -275 0 -275 0 0 -1480z",
  pathChevron:
    "M6593 5909 c-43 -12 -177 -140 -202 -192 -25 -51 -27 -104 -6 -155 11 -25 131 -153 368 -389 l352 -353 -352 -352 c-237 -237 -357 -365 -368 -390 -37 -90 -10 -162 98 -265 95 -90 153 -110 234 -80 44 16 999 965 1019 1012 18 44 18 106 0 148 -21 49 -983 1002 -1025 1016 -39 13 -73 13 -118 0z",
  centers: {
    a: { x: 337, y: 540.5 },
    l: { x: 549, y: 503.5 },
    chevron: { x: 637, y: 541.5 },
  },
} as const;
