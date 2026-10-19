import {
  DEFAULT_POST_LAYOUT_MODE,
  normalizePostLayoutMode,
  type PostLayoutMode,
} from "@/features/posts/post_layout";
import type { PostUI } from "@/network/post/postMappers";
import type { PostsPageCursor } from "@/network/post/postTypes";
import {
  FEED_COUNTRY_SELECTION_LIMIT,
  HOME_MEMORY_POST_LIMIT,
  STORAGE_KEYS,
} from "@/config";
import { publicMemory } from "./persistentStorage";

export type HomeSinglePostSource = "latest" | "random";

export type HomeSettingsMemory = {
  showOnlyLastPost: boolean;
  autoApplyLatestPosts: boolean;
  layoutMode: PostLayoutMode;
  singlePostSource: HomeSinglePostSource;
  feedCountryCodes: string[];
};

export type HomePostsMemory = {
  posts: PostUI[];
  cursor: PostsPageCursor;
  hasMore: boolean;
  savedAt: number | null;
  settings: HomeSettingsMemory;
};

const DEFAULT_SETTINGS: HomeSettingsMemory = {
  showOnlyLastPost: false,
  autoApplyLatestPosts: false,
  layoutMode: DEFAULT_POST_LAYOUT_MODE,
  singlePostSource: "latest",
  feedCountryCodes: [],
};

const EMPTY_MEMORY: HomePostsMemory = {
  posts: [],
  cursor: null,
  hasMore: true,
  savedAt: null,
  settings: DEFAULT_SETTINGS,
};

let memoryStore: HomePostsMemory = EMPTY_MEMORY;

function sanitizeMemory(value: Partial<HomePostsMemory> | null | undefined): HomePostsMemory {
  return {
    posts: Array.isArray(value?.posts)
      ? value.posts.slice(0, HOME_MEMORY_POST_LIMIT)
      : [],
    cursor: value?.cursor ?? null,
    hasMore: value?.hasMore ?? true,
    savedAt: value?.savedAt ?? null,
    settings: {
      ...DEFAULT_SETTINGS,
      ...(value?.settings ?? {}),
      layoutMode: normalizePostLayoutMode(value?.settings?.layoutMode),
      singlePostSource:
        value?.settings?.singlePostSource === "random" ? "random" : "latest",
      feedCountryCodes: Array.isArray(value?.settings?.feedCountryCodes)
        ? value.settings.feedCountryCodes
            .filter((code): code is string =>
              typeof code === "string" && /^[A-Z]{2}$/.test(code)
            )
            .slice(0, FEED_COUNTRY_SELECTION_LIMIT)
        : [],
    },
  };
}

export function readHomePostsMemory(): HomePostsMemory {
  const raw = publicMemory.getItem(STORAGE_KEYS.homePosts);

  if (raw) {
    try {
      memoryStore = sanitizeMemory(JSON.parse(raw) as Partial<HomePostsMemory>);
    } catch {
      publicMemory.removeItem(STORAGE_KEYS.homePosts);
      memoryStore = EMPTY_MEMORY;
    }
  }

  return memoryStore;
}

export function writeHomePostsMemory(value: HomePostsMemory) {
  memoryStore = sanitizeMemory(value);
  publicMemory.setItem(STORAGE_KEYS.homePosts, JSON.stringify(memoryStore));
}

export function readHomeSettingsMemory(): HomeSettingsMemory {
  return readHomePostsMemory().settings;
}

export function writeHomeSettingsMemory(settings: HomeSettingsMemory) {
  writeHomePostsMemory({
    ...readHomePostsMemory(),
    settings,
  });
}
