// use_home_posts_vm.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";

import { usePostsLiveSubscription } from "./use_posts_live_subscription";
import { apiGetPostsPage } from "@/network/post/postsApi";
import { mapPostRowToUI, type PostUI } from "@/network/post/postMappers";
import type { PostsPageCursor } from "@/network/post/postTypes";

import { readHomePostsMemory, writeHomePostsMemory } from "@/memory";
import { withPostDefaultsList } from "./home_posts_defaults";
import { useHomeLayoutVM } from "./vm/use_home_layout_vm";
import { useHomeSettingsVM } from "./vm/use_home_settings_vm";
import {
  getMainPostRatio,
  isListOnlyLayout,
} from "@/features/posts/post_layout";

const PAGE_SIZE = 30;

function getErrorMessage(error: unknown) {
  if (typeof error === "string") return error;

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as any).message === "string"
  ) {
    return (error as any).message;
  }

  return "Something went wrong while loading posts.";
}

export function useHomePostsVM() {
  const layout = useHomeLayoutVM();
  const settings = useHomeSettingsVM();

  const {
    listRef,
    currentOffsetRef,
    setCurrentPage,
  } = layout;

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [posts, setPosts] = useState<PostUI[]>([]);
  const [cursor, setCursor] = useState<PostsPageCursor>(null);
  const [hasMore, setHasMore] = useState(true);

  const [pendingPosts, setPendingPosts] = useState<PostUI[] | null>(null);
  const [pendingCursor, setPendingCursor] = useState<PostsPageCursor>(null);
  const [pendingHasMore, setPendingHasMore] = useState(true);

  const [checkingNewPosts, setCheckingNewPosts] = useState(false);

  const postsRef = useRef<PostUI[]>([]);
  const cursorRef = useRef<PostsPageCursor>(null);
  const hasMoreRef = useRef(true);
  const settingsRef = useRef(settings.homeSettings);

  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  useEffect(() => {
    cursorRef.current = cursor;
  }, [cursor]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    settingsRef.current = settings.homeSettings;
  }, [settings.homeSettings]);

  const layoutMode = settings.homeSettings.layoutMode;
  const singlePostLayout = settings.homeSettings.showOnlyLastPost;
  const listOnlyLayout = !singlePostLayout && isListOnlyLayout(layoutMode);
  const mainPost = listOnlyLayout ? null : posts[0] ?? null;
  const listPosts = useMemo(
    () => (singlePostLayout ? [] : listOnlyLayout ? posts : posts.slice(1)),
    [listOnlyLayout, posts, singlePostLayout]
  );

  const showMainPost = !listOnlyLayout;
  const showList = !singlePostLayout && (listOnlyLayout || listPosts.length > 0);
  const displaySidePad = showMainPost ? layout.sidePad : 0;

  const displaySectionGap = showMainPost && showList ? layout.sectionGap : 0;
  const splitHeight = Math.max(0, layout.contentHeight - displaySectionGap);
  const ratio = getMainPostRatio(layoutMode);

  const displayListHeight = showList
    ? listOnlyLayout
      ? layout.contentHeight
      : Math.max(90, Math.floor(splitHeight * (1 - ratio)))
    : 0;
  const displayMainCardHeight = showMainPost
    ? showList
      ? Math.max(160, splitHeight - displayListHeight)
      : Math.max(220, layout.contentHeight)
    : Math.max(220, layout.contentHeight);

  const displayMainCardWidth = showMainPost
    ? layout.mainCardWidth
    : Math.max(0, layout.mainCardWidth + layout.sidePad * 2);
  const webBottomPad = Platform.OS === "web" ? 8 : 0;

  const hasPendingNewPosts = useMemo(() => {
    if (!pendingPosts || pendingPosts.length === 0) return false;
    if (posts.length === 0) return true;
    return pendingPosts[0]?.id !== posts[0]?.id;
  }, [pendingPosts, posts]);

  const pendingNewPostCount = useMemo(() => {
    if (!pendingPosts || pendingPosts.length === 0) return 0;

    const existingIds = new Set(posts.map((p) => p.id));
    return pendingPosts.filter((p) => !existingIds.has(p.id)).length;
  }, [pendingPosts, posts]);

  const saveSnapshot = useCallback(
    (nextPosts: PostUI[], nextCursor: PostsPageCursor, nextHasMore: boolean) => {
      writeHomePostsMemory({
        posts: nextPosts,
        cursor: nextCursor,
        hasMore: nextHasMore,
        savedAt: Date.now(),
        settings: settingsRef.current,
      });
    },
    []
  );

  const resetListPosition = useCallback(
    (animated: boolean) => {
      setCurrentPage(0);

      requestAnimationFrame(() => {
        currentOffsetRef.current = 0;
        listRef.current?.scrollToOffset({
          offset: 0,
          animated,
        });
      });
    },
    [setCurrentPage, currentOffsetRef, listRef]
  );

  const loadInitial = useCallback(async () => {
    setInitialLoading(true);
    setErrorMessage(null);

    try {
      const memory = readHomePostsMemory();

      if (memory.posts.length > 0) {
        setPosts(withPostDefaultsList(memory.posts));
        setCursor(memory.cursor);
        setHasMore(memory.hasMore);
        setInitialLoading(false);
      }

      const res = await apiGetPostsPage(PAGE_SIZE, null);
      const fetched = withPostDefaultsList(res.rows.map(mapPostRowToUI));
      const nextHasMore = !!res.nextCursor && fetched.length > 0;

      if (memory.posts.length === 0) {
        setPosts(fetched);
        setCursor(res.nextCursor);
        setHasMore(nextHasMore);
        saveSnapshot(fetched, res.nextCursor, nextHasMore);
        return;
      }

      const currentTopId = memory.posts[0]?.id;
      const freshTopId = fetched[0]?.id;

      if (freshTopId && freshTopId !== currentTopId) {
        if (settingsRef.current.autoApplyLatestPosts) {
          setPosts(fetched);
          setCursor(res.nextCursor);
          setHasMore(nextHasMore);
          saveSnapshot(fetched, res.nextCursor, nextHasMore);
          resetListPosition(false);
        } else {
          setPendingPosts(fetched);
          setPendingCursor(res.nextCursor);
          setPendingHasMore(nextHasMore);
        }
      } else {
        setPosts(fetched);
        setCursor(res.nextCursor);
        setHasMore(nextHasMore);
        saveSnapshot(fetched, res.nextCursor, nextHasMore);
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      console.error("loadInitial failed", error);
    } finally {
      setInitialLoading(false);
    }
  }, [saveSnapshot, resetListPosition]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const checkForNewPosts = useCallback(async () => {
    if (checkingNewPosts) return;

    setCheckingNewPosts(true);

    try {
      const res = await apiGetPostsPage(PAGE_SIZE, null);
      const fetched = withPostDefaultsList(res.rows.map(mapPostRowToUI));
      const nextHasMore = !!res.nextCursor && fetched.length > 0;

      const currentTopId = postsRef.current[0]?.id;
      const freshTopId = fetched[0]?.id;

      if (!currentTopId) {
        setPosts(fetched);
        setCursor(res.nextCursor);
        setHasMore(nextHasMore);
        saveSnapshot(fetched, res.nextCursor, nextHasMore);
        return;
      }

      if (freshTopId && freshTopId !== currentTopId) {
        if (settingsRef.current.autoApplyLatestPosts) {
          setPosts(fetched);
          setCursor(res.nextCursor);
          setHasMore(nextHasMore);
          saveSnapshot(fetched, res.nextCursor, nextHasMore);
          resetListPosition(true);
        } else {
          setPendingPosts(fetched);
          setPendingCursor(res.nextCursor);
          setPendingHasMore(nextHasMore);
        }
      }
    } catch (error) {
      console.error("checkForNewPosts failed", error);
    } finally {
      setCheckingNewPosts(false);
    }
  }, [checkingNewPosts, saveSnapshot, resetListPosition]);

  const applyPendingPosts = useCallback(() => {
    if (!pendingPosts || pendingPosts.length === 0) return;

    const existingIds = new Set(posts.map((p) => p.id));
    const newUnique = pendingPosts.filter((p) => !existingIds.has(p.id));
    const merged = [...newUnique, ...posts];

    const nextCursor = pendingCursor ?? cursor;
    const nextHasMore = pendingHasMore;

    setPosts(merged);
    setCursor(nextCursor);
    setHasMore(nextHasMore);
    setPendingPosts(null);
    setPendingCursor(null);
    setPendingHasMore(true);

    saveSnapshot(merged, nextCursor, nextHasMore);
    resetListPosition(true);
  }, [
    pendingPosts,
    pendingCursor,
    pendingHasMore,
    posts,
    cursor,
    saveSnapshot,
    resetListPosition,
  ]);

  const handleIncomingLivePost = useCallback(
    (incoming: PostUI) => {
      const existsInCurrent = postsRef.current.some((p) => p.id === incoming.id);
      if (existsInCurrent) return;

      if (settingsRef.current.autoApplyLatestPosts) {
        setPosts((prev) => {
          const exists = prev.some((p) => p.id === incoming.id);
          if (exists) return prev;

          const merged = [incoming, ...prev];
          saveSnapshot(merged, cursorRef.current, hasMoreRef.current);
          return merged;
        });

        resetListPosition(true);
        return;
      }

      setPendingPosts((prev) => {
        const currentPending = prev ?? [];
        const existsInPending = currentPending.some((p) => p.id === incoming.id);
        if (existsInPending) return currentPending;
        return [incoming, ...currentPending];
      });
    },
    [saveSnapshot, resetListPosition]
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || initialLoading) return;
    if (!hasMore || !cursor) return;

    setLoadingMore(true);
    setErrorMessage(null);

    try {
      const res = await apiGetPostsPage(PAGE_SIZE, cursor);
      const fetched = withPostDefaultsList(res.rows.map(mapPostRowToUI));

      if (fetched.length === 0) {
        setHasMore(false);
        setCursor(null);
        saveSnapshot(posts, null, false);
        return;
      }

      const merged = [...posts, ...fetched];
      const nextHasMore = !!res.nextCursor;

      setPosts(merged);
      setCursor(res.nextCursor);
      setHasMore(nextHasMore);

      saveSnapshot(merged, res.nextCursor, nextHasMore);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      console.error("loadMore failed", error);
    } finally {
      setLoadingMore(false);
    }
  }, [
    cursor,
    hasMore,
    initialLoading,
    loadingMore,
    posts,
    saveSnapshot,
  ]);

  const refreshPosts = useCallback(async () => {
    if (refreshing) return;

    setRefreshing(true);

    try {
      const res = await apiGetPostsPage(PAGE_SIZE, null);
      const fetched = withPostDefaultsList(res.rows.map(mapPostRowToUI));
      const nextHasMore = !!res.nextCursor && fetched.length > 0;

      setPosts(fetched);
      setCursor(res.nextCursor);
      setHasMore(nextHasMore);
      setPendingPosts(null);
      setPendingCursor(null);
      setPendingHasMore(true);

      saveSnapshot(fetched, res.nextCursor, nextHasMore);
      resetListPosition(false);
    } catch (error) {
      console.error("refreshPosts failed", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, saveSnapshot, resetListPosition]);

  const goToPage = useCallback(
    (page: number) => {
      layout.goToPage(page, listPosts.length);
    },
    [layout.goToPage, listPosts.length]
  );

  usePostsLiveSubscription({
    enabled: true,
    onNewPost: handleIncomingLivePost,
  });

  return {
    ...layout,
    ...settings,

    initialLoading,
    loadingMore,
    refreshing,
    errorMessage,

    mainPost,
    listPosts,
    hasMore,

    hasPendingNewPosts,
    pendingNewPostCount,
    applyPendingPosts,
    checkForNewPosts,

    loadMore,
    goToPage,
    refreshPosts,
    checkingNewPosts,

    showList,
    showMainPost,
    displaySidePad,

    displaySectionGap,
    displayListHeight,
    displayMainCardHeight,
    displayMainCardWidth,
    webBottomPad,
  };
}
