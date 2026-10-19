// my_posts_header.tsx
import React from "react";
import {
  FlatList,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,

} from "react-native";

import type { PostUI } from "@/network/post/postMappers";
import { PostCard } from "@/features/posts/ui";
import { useWebHorizontalDrag } from "@/features/posts/ui/use_web_horizontal_drag";
import { MyPostCardActions } from "./my_post_card_actions";

type Props = {
  insetsTop: number;
  topPad: number;
  sectionGap: number;
  contentHeight: number;

  mainCardHeight: number;
  listHeight: number;
  mainCardWidth: number;

  sidePad: number;
  listRailWidth: number;
  listItemWidth: number;
  listItemGap: number;
  railInset: number;
  snapTo: number;
  showList: boolean;

  currentPage: number;
  listRef: React.RefObject<FlatList<PostUI>>;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;

  mainPost: PostUI | null;
  listPosts: PostUI[];

  showMainPost: boolean;
  onSettings: (post: PostUI) => void;
  onDelete: (post: PostUI) => void;

  goToPage: (page: number, itemCount: number) => void;
  onListScroll: any;
  onListMomentumEnd: any;
  scrollListToOffset: (offset: number, animated?: boolean) => void;
  getCurrentOffset: () => number;
};

function EditablePostCard({
  post,
  width,
  height,
  showDate,
  onSettings,
  onDelete,
}: {
  post: PostUI;
  width: number;
  height: number;
  showDate: boolean;
  onSettings: (post: PostUI) => void;
  onDelete: (post: PostUI) => void;
}) {
  const [menuVisible, setMenuVisible] = React.useState(false);
  const pressScale = React.useRef(new Animated.Value(1)).current;

  const animateScale = React.useCallback(
    (toValue: number) => {
      Animated.spring(pressScale, {
        toValue,
        damping: 18,
        stiffness: 320,
        mass: 0.6,
        useNativeDriver: true,
      }).start();
    },
    [pressScale]
  );

  return (
    <View style={{ width, height, alignSelf: "center" }}>
      <Animated.View
        style={{ width: "100%", height, transform: [{ scale: pressScale }] }}
      >
        <PostCard
          post={post}
          showDate={showDate}
          showActions={false}
          height={height}
          style={{ width: "100%" }}
          onPressIn={() => animateScale(0.975)}
          onPressOut={() => animateScale(1)}
          onLongPress={() => setMenuVisible(true)}
        />

        <MyPostCardActions
          post={post}
          visible={menuVisible}
          onChangeVisible={setMenuVisible}
          onSettings={onSettings}
          onDelete={onDelete}
        />
      </Animated.View>
    </View>
  );
}

export function MyPostsHeader({
  insetsTop,
  topPad,
  sectionGap,
  contentHeight,
  mainCardHeight,
  listHeight,
  mainCardWidth,
  sidePad,
  listRailWidth,
  listItemWidth,
  listItemGap,
  railInset,
  snapTo,
  showList,
  currentPage,
  hasMore,
  loadingMore,
  loadMore,
  listRef,
  mainPost,
  listPosts,
  showMainPost,
  onSettings,
  onDelete,
  goToPage,
  onListScroll,
  onListMomentumEnd,
  scrollListToOffset,
  getCurrentOffset,
}: Props) {
  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage < listPosts.length - 1;

  const webDragHandlers = useWebHorizontalDrag({
    getOffset: getCurrentOffset,
    scrollToOffset: scrollListToOffset,
    snapTo,
  });

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insetsTop + topPad,
          height: insetsTop + topPad + contentHeight,
        },
      ]}
    >
      {showMainPost || listPosts.length === 0 ? (
        <View
          style={[
            styles.mainWrap,
            {
              paddingHorizontal: sidePad,
              height: mainCardHeight,
            },
          ]}
        >
          {mainPost && showMainPost ? (
            <EditablePostCard
              post={mainPost}
              width={mainCardWidth}
              height={mainCardHeight}
              showDate={false}
              onSettings={onSettings}
              onDelete={onDelete}
            />
          ) : (
            <View
              style={[
                styles.emptyCard,
                { height: mainCardHeight, width: mainCardWidth },
              ]}
            >
              <Text style={styles.emptyText}>No posts yet</Text>
            </View>
          )}
        </View>
      ) : null}
      {showList && listPosts.length > 0 ? (
        <View
          style={[
            styles.listOuter,
            {
              marginTop: sectionGap,
              height: listHeight,
            },
          ]}
        >
          <View
            style={[
              styles.listSection,
              Platform.OS === "web" && styles.webDragSurface,
              {
                height: listHeight,
                width: "100%",
                alignSelf: "center",
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
              ListFooterComponent={
                loadingMore ? (
                  <View style={styles.footerLoading}>
                    <ActivityIndicator color="#ffffff" />
                  </View>
                ) : (
                  <View style={{ width: 2 }} />
                )
              }
              renderItem={({ item }) => (
                <EditablePostCard
                  post={item}
                  width={listItemWidth}
                  height={listHeight}
                  showDate
                  onSettings={onSettings}
                  onDelete={onDelete}
                />
              )}
            />

            {Platform.OS === "web" && canGoPrev ? (
              <Pressable
                onPress={() => goToPage(currentPage - 1, listPosts.length)}
                style={[styles.arrowButton, styles.arrowLeft]}
              >
                <Text style={styles.arrowText}>‹</Text>
              </Pressable>
            ) : null}

            {Platform.OS === "web" && canGoNext ? (
              <Pressable
                onPress={() => goToPage(currentPage + 1, listPosts.length)}
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

  emptyCard: {
    alignSelf: "center",
    borderRadius: 22,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },

  listOuter: {
    width: "100%",
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

  arrowButton: {
    position: "absolute",
    bottom: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(20,20,20,0.88)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    zIndex: 20,
  },

  arrowLeft: {
    left: 12,
  },

  arrowRight: {
    right: 12,
  },

  footerLoading: {
    width: 56,
    alignItems: "center",
    justifyContent: "center",
  },

  arrowText: {
    color: "#ffffff",
    fontSize: 28,
    lineHeight: 28,
    fontWeight: "900",
    ...(Platform.OS === "web" ? ({ userSelect: "none" } as any) : null),
  },
});
