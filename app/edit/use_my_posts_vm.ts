// use_my_posts_vm.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PostUI } from "@/network/post/postMappers";
import { mapPostRowToUI } from "@/network/post/postMappers";
import type { PostsPageCursor } from "@/network/post/postTypes";
import {
  apiDeletePost,
  apiGetMyPostsPage,
  apiUpdatePostStyle,
  apiGetMyPostsPageSettings,
  apiUpdateMyPostsPageSettings,
  mapMyPostsPageSettingsRow,
} from "@/network/post/postsApi";
import {
  DEFAULT_MY_POSTS_PAGE_SETTINGS,
  type MyPostsPageSettings,
  type MyPostsUpdatePayload,
} from "./my_posts_types";
import { applyPostStyleToList } from "./my_posts_style_helpers";
import { useFocusEffect } from "expo-router";
import { isListOnlyLayout } from "@/features/posts/post_layout";
import {
  canUsePaidPostFeatures,
  syncBillingPlanFromRevenueCat,
} from "@/features/billing/billing_plan";
import {
  isPaidPaywallResult,
  presentUpgradePaywall,
  showUpgradeAlert,
} from "@/features/paywall/revenuecat_paywall";

const PAGE_SIZE = 5;

export function useMyPostsVM() {
  const [posts, setPosts] = useState<PostUI[]>([]);
  const [cursor, setCursor] = useState<PostsPageCursor>(null);
  const [hasMore, setHasMore] = useState(true);

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedPost, setSelectedPost] = useState<PostUI | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [pageSettings, setPageSettings] =
    useState<MyPostsPageSettings>(DEFAULT_MY_POSTS_PAGE_SETTINGS);

  const [pageSettingsVisible, setPageSettingsVisible] = useState(false);
  const [updatingPageSettings, setUpdatingPageSettings] = useState(false);

  const singlePostLayout = pageSettings.showOnlyLast;
  const listOnlyLayout = !singlePostLayout && isListOnlyLayout(pageSettings.layoutMode);
  const mainPost = listOnlyLayout ? null : posts[0] ?? null;

  const listPosts = useMemo(
    () => (singlePostLayout ? [] : listOnlyLayout ? posts : posts.slice(1)),
    [listOnlyLayout, posts, singlePostLayout]
  );

  const loadPageSettings = useCallback(async () => {
    try {
      const row = await apiGetMyPostsPageSettings();
      const next = {
        ...mapMyPostsPageSettingsRow(row),
        autoLatest: true,
      };

      console.log("loaded my posts settings:", next);

      setPageSettings(next);
    } catch (error) {
      console.error("loadPageSettings failed", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadPageSettings();
    }, [loadPageSettings])
  );

  const loadInitial = useCallback(async () => {
    setInitialLoading(true);

    try {
      const res = await apiGetMyPostsPage(PAGE_SIZE, null);
      const nextPosts = res.rows.map(mapPostRowToUI);

      setPosts(nextPosts);
      setCursor(res.nextCursor);
      setHasMore(!!res.nextCursor && nextPosts.length > 0);
    } finally {
      setInitialLoading(false);
    }
    await loadPageSettings();
  }, [loadPageSettings]);

  const openPageSettings = useCallback(() => {
    setPageSettingsVisible(true);
  }, []);

  const closePageSettings = useCallback(() => {
    if (updatingPageSettings) return;
    setPageSettingsVisible(false);
  }, [updatingPageSettings]);

  const updatePageSettings = useCallback(
    async (next: MyPostsPageSettings) => {
      setUpdatingPageSettings(true);

      try {
        const cleanNext = {
          showOnlyLast: next.showOnlyLast,
          autoLatest: true,
          bgColor: next.bgColor,
          bgOpacity: Math.max(0.2, next.bgOpacity ?? 1),
          layoutMode: next.layoutMode,
          profileIconType: next.profileIconType,
          profileLinksEnabled: next.profileLinksEnabled,
          postCopyEnabled: next.postCopyEnabled,
        };

        const updatedRow = await apiUpdateMyPostsPageSettings(cleanNext);

        const mapped = {
          ...mapMyPostsPageSettingsRow(updatedRow),
          autoLatest: true,
        };

        setPageSettings(mapped);
        setPageSettingsVisible(false);
      } catch (error) {
        console.error("updatePageSettings failed", error);
      } finally {
        setUpdatingPageSettings(false);
      }
    },
    []
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || initialLoading || !hasMore || !cursor) return;

    setLoadingMore(true);

    try {
      const res = await apiGetMyPostsPage(PAGE_SIZE, cursor);
      const nextPosts = res.rows.map(mapPostRowToUI);

      if (nextPosts.length === 0) {
        setHasMore(false);
        setCursor(null);
        return;
      }

      setPosts((prev) => [...prev, ...nextPosts]);
      setCursor(res.nextCursor);
      setHasMore(!!res.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, hasMore, initialLoading, loadingMore]);

  const openSettings = useCallback((post: PostUI) => {
    setSelectedPost(post);
    setSettingsVisible(true);
  }, []);

  const closeSettings = useCallback(() => {
    if (updating) return;
    setSettingsVisible(false);
    setSelectedPost(null);
  }, [updating]);

  const updatePostStyle = useCallback(async (payload: MyPostsUpdatePayload) => {
    setUpdating(true);

    try {
      const plan = await syncBillingPlanFromRevenueCat();

      if (!canUsePaidPostFeatures(plan)) {
        showUpgradeAlert(
          "Post style editing is available on Starter and Pro plans.",
          () => {
            void presentUpgradePaywall().then(async (result) => {
              if (isPaidPaywallResult(result)) {
                try {
                  await syncBillingPlanFromRevenueCat();
                } catch (error) {
                  console.log("Billing plan sync after paywall failed:", error);
                }
              }
            });
          }
        );
        return;
      }

      await apiUpdatePostStyle({
        postId: payload.postId,
        bgColor: payload.style.bgColor,
        bgOpacity: payload.style.bgOpacity,
        radius: payload.style.bgRadius,
        fontColor: payload.style.fontColor,
      });

      setPosts((prev) =>
        applyPostStyleToList(prev, payload.postId, payload.style)
      );

      setSettingsVisible(false);
      setSelectedPost(null);
    } finally {
      setUpdating(false);
    }
  }, []);

  const deletePost = useCallback(async (postId: string) => {
    setDeletingId(postId);

    try {
      await apiDeletePost(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } finally {
      setDeletingId(null);
    }
  }, []);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  return {
    posts,
    mainPost,
    listPosts,

    cursor,
    hasMore,
    initialLoading,
    loadingMore,
    deletingId,

    selectedPost,
    settingsVisible,
    updating,

    loadMore,
    openSettings,
    closeSettings,
    updatePostStyle,
    deletePost,

    pageSettings,
    showMainPost: !listOnlyLayout,
    pageSettingsVisible,
    updatingPageSettings,
    openPageSettings,
    closePageSettings,
    updatePageSettings,
  };
}
