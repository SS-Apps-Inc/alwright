import { useEffect, useState, useCallback, useMemo } from "react";
import {
  apiGetPostsByUserPage,
  apiGetPublicMyPostsPageSettings,
  mapMyPostsPageSettingsRow,
} from "@/network/post/postsApi";
import { mapPostRowToUI, type PostUI } from "@/network/post/postMappers";
import type { PostsPageCursor } from "@/network/post/postTypes";
import { withPostDefaultsList } from "@/features/feed/home_posts_defaults";
import { DEFAULT_MY_POSTS_PAGE_SETTINGS, type MyPostsPageSettings } from "../../../app/edit/my_posts_types";
import { isListOnlyLayout } from "@/features/posts/post_layout";

 
const PAGE_SIZE = 30;

export function useUserPostsVM(userId: string) {
  const [posts, setPosts] = useState<PostUI[]>([]);
  const [cursor, setCursor] = useState<PostsPageCursor>(null);
  const [hasMore, setHasMore] = useState(true);

  const [pageSettings, setPageSettings] =
    useState<MyPostsPageSettings>(DEFAULT_MY_POSTS_PAGE_SETTINGS);

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const singlePostLayout = pageSettings.showOnlyLast;
  const listOnlyLayout = !singlePostLayout && isListOnlyLayout(pageSettings.layoutMode);
  const mainPost = listOnlyLayout ? null : posts[0] ?? null;

  const listPosts = useMemo(
    () => (singlePostLayout ? [] : listOnlyLayout ? posts : posts.slice(1)),
    [listOnlyLayout, posts, singlePostLayout]
  );

  const loadPageSettings = useCallback(async () => {
    try {
      const settingsRow = await apiGetPublicMyPostsPageSettings(userId);

      setPageSettings(mapMyPostsPageSettingsRow(settingsRow));
    } catch (error) {
      console.error("load public page settings failed", error);
    }
  }, [userId]);

  const loadInitial = useCallback(async () => {
    setInitialLoading(true);

    try {
      const [postsRes] = await Promise.all([
        apiGetPostsByUserPage(userId, PAGE_SIZE, null),
        loadPageSettings(),
      ]);

      const mapped = withPostDefaultsList(postsRes.rows.map(mapPostRowToUI));

      setPosts(mapped);
      setCursor(postsRes.nextCursor);
      setHasMore(!!postsRes.nextCursor);
    } finally {
      setInitialLoading(false);
    }
  }, [userId, loadPageSettings]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !cursor) return;

    setLoadingMore(true);

    try {
      const res = await apiGetPostsByUserPage(userId, PAGE_SIZE, cursor);
      const mapped = withPostDefaultsList(res.rows.map(mapPostRowToUI));

      setPosts((prev) => [...prev, ...mapped]);
      setCursor(res.nextCursor);
      setHasMore(!!res.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, hasMore, loadingMore, userId]);

  return {
    initialLoading,
    loadingMore,
    hasMore,

    pageSettings,
    showMainPost: !listOnlyLayout,
    showList: !singlePostLayout && (listOnlyLayout || listPosts.length > 0),

    mainPost,
    listPosts,

    loadMore,
  };
}
