import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { PostUI } from "@/network/post/postMappers";
import { colors, radii, typography } from "@/design-system";
import { PostCard } from "./post_card";
import { useWebHorizontalDrag } from "./use_web_horizontal_drag";

type Props = {
  insetsTop: number;
  topPad: number;
  contentHeight: number;

  displaySidePad: number;
  displaySectionGap: number;
  displayListHeight: number;
  displayMainCardHeight: number;
  displayMainCardWidth: number;

  listItemWidth: number;
  listItemGap: number;
  railInset: number;
  snapTo: number;

  initialLoading: boolean;
  loadingMore: boolean;
  mainPost: PostUI | null;
  listPosts: PostUI[];
  hasMore: boolean;

  currentPage: number;
  listRef: React.RefObject<FlatList<PostUI> | null>;

  showMainPost?: boolean;
  showMainPublicControls?: boolean;
  showList: boolean;

  hasPendingNewPosts?: boolean;
  pendingNewPostCount?: number;
  onApplyPendingPosts?: () => void;

  showSettingsButton?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;

  loadMore: () => void;
  goToPage: (page: number) => void;
  onListScroll: any;
  onListMomentumEnd: any;
  scrollListToOffset: (offset: number, animated?: boolean) => void;
  getCurrentOffset: () => number;
};

export function PostsCarouselHeader({
  insetsTop,
  topPad,
  contentHeight,
  displaySidePad,
  displaySectionGap,
  displayListHeight,
  displayMainCardHeight,
  displayMainCardWidth,
  listItemWidth,
  listItemGap,
  railInset,
  snapTo,
  initialLoading,
  loadingMore,
  mainPost,
  listPosts,
  hasMore,
  currentPage,
  listRef,
  showMainPost = true,
  showMainPublicControls = true,
  showList,
  hasPendingNewPosts = false,
  pendingNewPostCount = 0,
  onApplyPendingPosts,
  showSettingsButton = false,
  emptyTitle = "No posts yet",
  emptyMessage,
  emptyActionLabel,
  onEmptyAction,
  loadMore,
  goToPage,
  onListScroll,
  onListMomentumEnd,
  scrollListToOffset,
  getCurrentOffset,
}: Props) {
  const finalShowList = showList && listPosts.length > 0;
  const showMainSection = showMainPost || initialLoading || !finalShowList;

  const canGoPrev = finalShowList && currentPage > 0;
  const canGoNext = finalShowList && currentPage < listPosts.length - 1;

  const webDragHandlers = useWebHorizontalDrag({
    getOffset: getCurrentOffset,
    scrollToOffset: scrollListToOffset,
    snapTo,
  });

  useEffect(() => {
    if (Platform.OS !== "web" || !finalShowList) return;

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isTyping =
        tagName === "input" ||
        tagName === "textarea" ||
        target?.isContentEditable;

      if (isTyping) return;

      if (event.key === "ArrowLeft" && canGoPrev) {
        event.preventDefault();
        goToPage(currentPage - 1);
      }

      if (event.key === "ArrowRight" && canGoNext) {
        event.preventDefault();
        goToPage(currentPage + 1);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [canGoNext, canGoPrev, currentPage, finalShowList, goToPage]);

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insetsTop + topPad,
          height:
            insetsTop +
            topPad +
            contentHeight -
            (Platform.OS === "web" ? 8 : 0),
        },
      ]}
    >

      {showMainSection ? (
        <View
          style={[
            styles.mainWrap,
            {
              paddingHorizontal: displaySidePad,
              height: displayMainCardHeight,
            },
          ]}
        >
          {initialLoading ? (
            <View
              style={[
                styles.mainLoadingCard,
                {
                  height: displayMainCardHeight,
                  width: displayMainCardWidth,
                },
              ]}
            >
              <ActivityIndicator color={colors.white} />
            </View>
          ) : mainPost && showMainPost ? (
            <View style={{ width: displayMainCardWidth, alignSelf: "center" }}>
              {hasPendingNewPosts && onApplyPendingPosts ? (
                <Pressable
                  accessibilityLabel="Load newer posts"
                  style={styles.newPostsPill}
                  onPress={onApplyPendingPosts}
                >
                  <Text style={styles.newPostsPillText}>
                    {pendingNewPostCount > 1
                      ? `${pendingNewPostCount} new posts`
                      : "New post"}
                  </Text>
                  <Text style={styles.newPostsPillSubtext}>Tap to load</Text>
                </Pressable>
              ) : null}

              <PostCard
                post={mainPost}
                showDate={false}
                showActions={false}
                showPublicControls={showMainPublicControls}
                height={displayMainCardHeight}
                style={{
                  width: displayMainCardWidth,
                  alignSelf: "center",
                }}
              />
            </View>
          ) : (
            <View
              style={[
                styles.mainLoadingCard,
                {
                  height: displayMainCardHeight,
                  width: displayMainCardWidth,
                },
              ]}
            >
              <Text style={styles.emptyText}>{emptyTitle}</Text>
              {emptyMessage ? (
                <Text style={styles.emptyMessage}>{emptyMessage}</Text>
              ) : null}
              {emptyActionLabel && onEmptyAction ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={onEmptyAction}
                  style={({ pressed }) => [
                    styles.emptyAction,
                    pressed && styles.emptyActionPressed,
                  ]}
                >
                  <Text style={styles.emptyActionText}>{emptyActionLabel}</Text>
                </Pressable>
              ) : null}
            </View>
          )}
        </View>
      ) : null}

      {finalShowList ? (
        <View
          style={[
            styles.listOuter,
            {
              marginTop: displaySectionGap,
              height: displayListHeight,
              paddingBottom: Platform.OS === "web" ? 18 : 0,
            },
          ]}
        >
          <View
            style={[
              styles.listSection,
              Platform.OS === "web" && styles.webDragSurface,
              {
                height: displayListHeight,
                width: "100%",
              },
            ]}
            {...webDragHandlers}
          >
            <FlatList
              ref={listRef}
              data={listPosts}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled={false}
              showsHorizontalScrollIndicator={false}
              bounces={false}
              decelerationRate="fast"
              snapToInterval={snapTo}
              snapToAlignment="start"
              disableIntervalMomentum
              style={styles.listRail}
              contentContainerStyle={{
                paddingLeft: railInset,
                paddingRight: railInset,
                alignItems: "stretch",
              }}
              ItemSeparatorComponent={() => <View style={{ width: listItemGap }} />}
              onScroll={onListScroll}
              scrollEventThrottle={16}
              onMomentumScrollEnd={onListMomentumEnd}
              onEndReached={() => {
                if (hasMore) loadMore();
              }}
              onEndReachedThreshold={0.6}
              renderItem={({ item }) => (
                <PostCard
                  post={item}
                  showDate={true}
                  showActions={false}
                  showPublicControls
                  height={displayListHeight}
                  style={{ width: listItemWidth }}
                />
              )}
              ListFooterComponent={
                loadingMore ? (
                  <View style={styles.footerLoading}>
                    <ActivityIndicator color={colors.white} />
                  </View>
                ) : (
                  <View style={{ width: 2 }} />
                )
              }
            />

            {Platform.OS === "web" && canGoPrev ? (
              <Pressable
                onPress={() => goToPage(currentPage - 1)}
                style={[styles.arrowButton, styles.arrowLeft]}
              >
                <Text style={styles.arrowText}>‹</Text>
              </Pressable>
            ) : null}

            {Platform.OS === "web" && canGoNext ? (
              <Pressable
                onPress={() => goToPage(currentPage + 1)}
                style={[styles.arrowButton, styles.arrowRight]}
              >
                <Text style={styles.arrowText}>›</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexShrink: 0,
  },
  mainWrap: {
    width: "100%",
    justifyContent: "center",
  },
  mainLoadingCard: {
    alignSelf: "center",
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: typography.weight.heavy,
  },
  emptyMessage: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    maxWidth: 290,
    marginTop: 9,
    paddingHorizontal: 18,
  },
  emptyAction: {
    minHeight: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 18,
  },
  emptyActionPressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  emptyActionText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: typography.weight.black,
  },
  listOuter: {
    width: "100%",
    paddingBottom: Platform.OS === "web" ? 18 : 0,
  },
  listSection: {
    position: "relative",
  },
  listRail: {
    flexGrow: 0,
  },
  webDragSurface:
    Platform.OS === "web"
      ? ({
        userSelect: "none",
        cursor: "grab",
      } as any)
      : null,
  newPostsPill: {
    position: "absolute",
    left: -2,
    top: 12,
    zIndex: 20,
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: "center",
  },
  newPostsPillText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: typography.weight.heavy,
  },
  newPostsPillSubtext: {
    color: "rgba(0,0,0,0.58)",
    fontSize: 9,
    fontWeight: typography.weight.bold,
    marginTop: 1,
  },
  footerLoading: {
    width: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowButton: {
    position: "absolute",
    bottom: 8,
    width: 16,
    height: 16,
    borderRadius: 17,
    backgroundColor: colors.darkControl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    zIndex: 20,
  },

  arrowLeft: {
    left: 8,
  },

  arrowRight: {
    right: 8,
  },

  arrowText: {
    color: colors.white,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: typography.weight.black,
    ...(Platform.OS === "web"
      ? ({ userSelect: "none" } as any)
      : null),
  },
  settingsButton: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(117,117,117,0.2)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  settingsIcon: {
    width: 12,
    height: 12,
    tintColor: "#6d3108",
  },
});
