// use_home_posts_vm.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Platform, Share } from "react-native";
import { useAuthState } from "../../../app/auth/useAuthState";

import { usePostsLiveSubscription } from "./use_posts_live_subscription";
import {
  apiGetCountryPostsPage,
  apiGetRandomCountryPostsPage,
} from "@/network/post/postsApi";
import {
  apiGetMyCountryPreferences,
  apiUpdateMyFeedCountries,
} from "@/network/profile/profileApi";
import { mapPostRowToUI, type PostUI } from "@/network/post/postMappers";
import type { PostsPageCursor } from "@/network/post/postTypes";

import {
  readHomePostsMemory,
  writeHomePostsMemory,
  type HomeSinglePostSource,
} from "@/memory";
import { withPostDefaultsList } from "./home_posts_defaults";
import { useHomeLayoutVM } from "./vm/use_home_layout_vm";
import { useHomeSettingsVM } from "./vm/use_home_settings_vm";
import {
  getMainPostRatio,
  isListOnlyLayout,
} from "@/features/posts/post_layout";
import { getPreparedHomePosts } from "./prepare_home_posts";
import { GOOGLE_PLAY_URL, PAGINATION } from "@/config";

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
  const auth = useAuthState();
  const showCountryPreference = Platform.OS !== "web";
  const countryFeatureAvailable = Platform.OS !== "web" && !!auth.user;
  const prepared = countryFeatureAvailable ? null : getPreparedHomePosts();
  const layout = useHomeLayoutVM();
  const settings = useHomeSettingsVM();

  const {
    listRef,
    currentOffsetRef,
    setCurrentPage,
    goToPage: goToLayoutPage,
  } = layout;
  const {
    setSinglePostSource: persistSinglePostSource,
    setFeedCountryCodes: persistFeedCountryCodes,
  } = settings;

  const [initialLoading, setInitialLoading] = useState(!prepared);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [posts, setPosts] = useState<PostUI[]>(prepared?.posts ?? []);
  const [cursor, setCursor] = useState<PostsPageCursor>(prepared?.cursor ?? null);
  const [hasMore, setHasMore] = useState(prepared?.hasMore ?? true);

  const [pendingPosts, setPendingPosts] = useState<PostUI[] | null>(
    prepared?.pendingPosts ?? null,
  );
  const [pendingCursor, setPendingCursor] = useState<PostsPageCursor>(
    prepared?.pendingCursor ?? null,
  );
  const [pendingHasMore, setPendingHasMore] = useState(
    prepared?.pendingHasMore ?? true,
  );

  const [checkingNewPosts, setCheckingNewPosts] = useState(false);
  const [randomPost, setRandomPost] = useState<PostUI | null>(
    prepared?.randomPost ?? null
  );
  const [randomLoading, setRandomLoading] = useState(false);
  const [countryPreferencesReady, setCountryPreferencesReady] = useState(
    !countryFeatureAvailable
  );

  const postsRef = useRef<PostUI[]>([]);
  const cursorRef = useRef<PostsPageCursor>(null);
  const hasMoreRef = useRef(true);
  const settingsRef = useRef(settings.homeSettings);
  const randomRequestIdRef = useRef(0);
  const randomInitializedRef = useRef(!!prepared?.randomPost);

  const selectedCountryCodes = countryFeatureAvailable
    ? settings.homeSettings.feedCountryCodes
    : [];
  const selectedCountryKey = selectedCountryCodes.join(",");

  const getPostsPage = useCallback(
    (pageSize: number, pageCursor: PostsPageCursor) =>
      apiGetCountryPostsPage(selectedCountryCodes, pageSize, pageCursor),
    // The key is stable when the selected country list has not changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCountryKey]
  );

  const getRandomPostsPage = useCallback(
    (pageSize: number) =>
      apiGetRandomCountryPostsPage(selectedCountryCodes, pageSize, null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCountryKey]
  );

  useEffect(() => {
    if (!auth.ready) return;

    if (!countryFeatureAvailable) {
      persistFeedCountryCodes([]);
      setCountryPreferencesReady(true);
      return;
    }

    let active = true;
    setCountryPreferencesReady(false);

    apiGetMyCountryPreferences()
      .then((preferences) => {
        if (!active) return;
        persistFeedCountryCodes(preferences.feedCountryCodes);
      })
      .catch((error) => {
        console.error("Country preferences load failed", error);
      })
      .finally(() => {
        if (active) setCountryPreferencesReady(true);
      });

    return () => {
      active = false;
    };
  }, [
    auth.ready,
    auth.user?.id,
    countryFeatureAvailable,
    persistFeedCountryCodes,
  ]);

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
  const randomSinglePost =
    singlePostLayout && settings.homeSettings.singlePostSource === "random";
  const listOnlyLayout = !singlePostLayout && isListOnlyLayout(layoutMode);
  const mainPost = randomSinglePost
    ? randomPost
    : listOnlyLayout
    ? null
    : posts[0] ?? null;
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

  const loadRandomPost = useCallback(async () => {
    const requestId = ++randomRequestIdRef.current;
    setRandomLoading(true);

    try {
      const response = await getRandomPostsPage(1);
      const nextPost = response.rows[0]
        ? withPostDefaultsList([mapPostRowToUI(response.rows[0])])[0]
        : null;

      if (requestId === randomRequestIdRef.current) {
        setRandomPost(nextPost);
      }
    } catch (error) {
      console.error("loadRandomPost failed", error);
    } finally {
      if (requestId === randomRequestIdRef.current) {
        setRandomLoading(false);
      }
    }
  }, [getRandomPostsPage]);

  useEffect(() => {
    randomInitializedRef.current = false;
    setRandomPost(null);
  }, [selectedCountryKey]);

  const setSinglePostSource = useCallback(
    (value: HomeSinglePostSource) => {
      persistSinglePostSource(value);

      if (value === "random") {
        randomInitializedRef.current = true;
        void loadRandomPost();
      }
    },
    [loadRandomPost, persistSinglePostSource]
  );

  useEffect(() => {
    if (!randomSinglePost || randomInitializedRef.current) return;
    randomInitializedRef.current = true;
    void loadRandomPost();
  }, [loadRandomPost, randomSinglePost]);

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
    if (!countryPreferencesReady) return;

    if (
      !countryFeatureAvailable &&
      selectedCountryCodes.length === 0 &&
      getPreparedHomePosts()
    ) {
      setInitialLoading(false);
      return;
    }

    setInitialLoading(true);
    setErrorMessage(null);

    try {
      const memory = readHomePostsMemory();
      const memoryMatchesCountries =
        memory.settings.feedCountryCodes.join(",") === selectedCountryKey;

      if (memory.posts.length > 0 && memoryMatchesCountries) {
        setPosts(withPostDefaultsList(memory.posts));
        setCursor(memory.cursor);
        setHasMore(memory.hasMore);
        setInitialLoading(false);
      }

      if (!memoryMatchesCountries) {
        setPosts([]);
        setCursor(null);
        setHasMore(true);
      }

      const res = await getPostsPage(PAGINATION.homePosts, null);
      const fetched = withPostDefaultsList(res.rows.map(mapPostRowToUI));
      const nextHasMore = !!res.nextCursor && fetched.length > 0;

      if (memory.posts.length === 0 || !memoryMatchesCountries) {
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
  }, [
    countryPreferencesReady,
    countryFeatureAvailable,
    getPostsPage,
    resetListPosition,
    saveSnapshot,
    selectedCountryCodes.length,
    selectedCountryKey,
  ]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const checkForNewPosts = useCallback(async () => {
    if (checkingNewPosts) return;

    setCheckingNewPosts(true);

    try {
      const res = await getPostsPage(PAGINATION.homePosts, null);
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
  }, [checkingNewPosts, getPostsPage, saveSnapshot, resetListPosition]);

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
      const res = await getPostsPage(PAGINATION.homePosts, cursor);
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
    getPostsPage,
    saveSnapshot,
  ]);

  const refreshPosts = useCallback(async () => {
    if (refreshing) return;

    setRefreshing(true);

    try {
      if (randomSinglePost) {
        await loadRandomPost();
        return;
      }

      const res = await getPostsPage(PAGINATION.homePosts, null);
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
  }, [
    loadRandomPost,
    getPostsPage,
    randomSinglePost,
    refreshing,
    saveSnapshot,
    resetListPosition,
  ]);

  const goToPage = useCallback(
    (page: number) => {
      goToLayoutPage(page, listPosts.length);
    },
    [goToLayoutPage, listPosts.length]
  );

  usePostsLiveSubscription({
    enabled: true,
    countryCodes: selectedCountryCodes,
    onNewPost: handleIncomingLivePost,
  });

  const setFeedCountryCodes = useCallback(
    async (countryCodes: string[]) => {
      const previous = settingsRef.current.feedCountryCodes;
      settingsRef.current = {
        ...settingsRef.current,
        feedCountryCodes: countryCodes,
      };
      persistFeedCountryCodes(countryCodes);

      try {
        const updated = await apiUpdateMyFeedCountries(countryCodes);
        settingsRef.current = {
          ...settingsRef.current,
          feedCountryCodes: updated.feedCountryCodes,
        };
        persistFeedCountryCodes(updated.feedCountryCodes);
      } catch (error: any) {
        settingsRef.current = {
          ...settingsRef.current,
          feedCountryCodes: previous,
        };
        persistFeedCountryCodes(previous);
        Alert.alert(
          "Couldn’t update countries",
          error?.message ?? "Please try again."
        );
      }
    },
    [persistFeedCountryCodes]
  );

  const inviteForeignFriend = useCallback(async () => {
    const referralPhone = auth.user?.phone;
    if (!referralPhone) return;

    try {
      await Share.share({
        message:
          `Join me on Alwright and share what is happening where you are. ` +
          `Download the app, then enter ${referralPhone} under “Referred by?” ` +
          `when you sign up so I can receive one month of Pro. ` +
          GOOGLE_PLAY_URL,
      });
    } catch (error) {
      console.error("Invite share failed", error);
    }
  }, [auth.user?.phone]);

  return {
    ...layout,
    ...settings,

    initialLoading: initialLoading || (randomSinglePost && randomLoading),
    loadingMore,
    refreshing,
    errorMessage,

    mainPost,
    listPosts,
    hasMore,

    hasPendingNewPosts: randomSinglePost ? false : hasPendingNewPosts,
    pendingNewPostCount,
    applyPendingPosts,
    checkForNewPosts,

    loadMore,
    goToPage,
    refreshPosts,
    checkingNewPosts,
    setSinglePostSource,
    setFeedCountryCodes,
    selectedCountryCodes,
    showCountryPreference,
    countryFeatureAvailable,
    inviteForeignFriend,

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
