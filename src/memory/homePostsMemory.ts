import {
  DEFAULT_POST_LAYOUT_MODE,
  normalizePostLayoutMode,
  type PostLayoutMode,
} from "@/features/posts/post_layout";
import type { PostUI } from "@/network/post/postMappers";
import type { PostsPageCursor } from "@/network/post/postTypes";
import { publicMemory } from "./persistentStorage";

export type HomeSettingsMemory = {
  showOnlyLastPost: boolean;
  autoApplyLatestPosts: boolean;
  layoutMode: PostLayoutMode;
};

export type HomePostsMemory = {
  posts: PostUI[];
  cursor: PostsPageCursor;
  hasMore: boolean;
  savedAt: number | null;
  settings: HomeSettingsMemory;
};

const STORAGE_KEY = "home_posts_memory_v4";
const MAX_MEMORY_POSTS = 30;

const DEFAULT_SETTINGS: HomeSettingsMemory = {
  showOnlyLastPost: false,
  autoApplyLatestPosts: false,
  layoutMode: DEFAULT_POST_LAYOUT_MODE,
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
      ? value.posts.slice(0, MAX_MEMORY_POSTS)
      : [],
    cursor: value?.cursor ?? null,
    hasMore: value?.hasMore ?? true,
    savedAt: value?.savedAt ?? null,
    settings: {
      ...DEFAULT_SETTINGS,
      ...(value?.settings ?? {}),
      layoutMode: normalizePostLayoutMode(value?.settings?.layoutMode),
    },
  };
}

export function readHomePostsMemory(): HomePostsMemory {
  const raw = publicMemory.getItem(STORAGE_KEY);

  if (raw) {
    try {
      memoryStore = sanitizeMemory(JSON.parse(raw) as Partial<HomePostsMemory>);
    } catch {
      publicMemory.removeItem(STORAGE_KEY);
      memoryStore = EMPTY_MEMORY;
    }
  }

  return memoryStore;
}

export function writeHomePostsMemory(value: HomePostsMemory) {
  memoryStore = sanitizeMemory(value);
  publicMemory.setItem(STORAGE_KEY, JSON.stringify(memoryStore));
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
