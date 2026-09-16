import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { EmptyState, LoadingState } from "@/design-system";
import { useMyPostsLayoutVM } from "./edit/my_posts_layout_vm";
import { useUserPostsVM } from "@/features/user/use_user_posts_vm";
import { hexToRgba, PostsCarouselHeader } from "@/features/posts/ui";
import {
  getMainPostRatio,
  isListOnlyLayout,
} from "@/features/posts/post_layout";

export default function UserPostsScreen() {
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const router = useRouter();

  const safeUserId = userId ?? "";
  const layoutVM = useMyPostsLayoutVM();
  const dataVM = useUserPostsVM(safeUserId);

  if (!userId) {
    return <EmptyState message="404 - User not found" />;
  }

  const pageBg = dataVM.pageSettings.bgColor
    ? hexToRgba(dataVM.pageSettings.bgColor, dataVM.pageSettings.bgOpacity)
    : "#0B0B0C";

  const isWeb = Platform.OS === "web";
  const singlePostLayout = dataVM.pageSettings.showOnlyLast;
  const listOnlyLayout =
    !singlePostLayout && isListOnlyLayout(dataVM.pageSettings.layoutMode);
  const showMainPost = !listOnlyLayout;
  const showList = dataVM.showList && dataVM.listPosts.length > 0;
  const topContentPad = isWeb ? 16 : layoutVM.insets.top + 48;
  const bottomContentPad = isWeb ? 16 : Math.max(layoutVM.insets.bottom, 8);
  const availableHeight = Math.max(
    0,
    layoutVM.containerHeight - topContentPad - bottomContentPad
  );
  const displaySectionGap = showMainPost && showList ? layoutVM.sectionGap : 0;
  const splitHeight = Math.max(0, availableHeight - displaySectionGap);
  const mainRatio = getMainPostRatio(dataVM.pageSettings.layoutMode);
  const displayListHeight = showList
    ? listOnlyLayout
      ? availableHeight
      : Math.max(90, Math.floor(splitHeight * (1 - mainRatio)))
    : 0;

  const mainCardHeight = singlePostLayout
    ? Math.max(220, availableHeight)
    : showList
    ? showMainPost
      ? Math.max(160, splitHeight - displayListHeight)
      : Math.max(220, availableHeight)
    : Math.max(220, availableHeight);

  const mainCardWidth = showMainPost && showList
    ? layoutVM.mainCardWidth
    : layoutVM.fullMainCardWidth;

  const sidePad = showMainPost ? layoutVM.sidePad : 0;

  const isEmpty =
    !dataVM.initialLoading &&
    !dataVM.mainPost &&
    dataVM.listPosts.length === 0;

  return (
    <View
      style={[styles.root, { backgroundColor: pageBg }]}
      onLayout={layoutVM.onContainerLayout}
    >
      {!isWeb ? (
        <View style={[styles.topBar, { paddingTop: layoutVM.insets.top }]}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </Pressable>
        </View>
      ) : null}

      {dataVM.initialLoading ? (
        <LoadingState backgroundColor={pageBg} />
      ) : isEmpty ? (
        <EmptyState message="No posts found" backgroundColor={pageBg} />
      ) : (
        <View
          style={[
            styles.fixedContent,
            {
              backgroundColor: pageBg,
              paddingBottom: bottomContentPad,
              paddingTop: topContentPad,
            },
          ]}
        >
          <PostsCarouselHeader
            insetsTop={0}
            topPad={0}
            contentHeight={availableHeight + (isWeb ? 8 : 0)}
            displaySidePad={sidePad}
            displaySectionGap={displaySectionGap}
            displayListHeight={displayListHeight}
            displayMainCardHeight={mainCardHeight}
            displayMainCardWidth={mainCardWidth}
            listItemWidth={layoutVM.listItemWidth}
            listItemGap={layoutVM.listItemGap}
            railInset={layoutVM.railInset}
            snapTo={layoutVM.snapTo}
            initialLoading={dataVM.initialLoading}
            loadingMore={dataVM.loadingMore}
            mainPost={dataVM.mainPost}
            listPosts={dataVM.listPosts}
            hasMore={dataVM.hasMore}
            currentPage={layoutVM.currentPage}
            listRef={layoutVM.listRef}
            showMainPost={showMainPost}
            showList={showList}
            showSettingsButton={false}
            loadMore={dataVM.loadMore}
            goToPage={(page) =>
              layoutVM.goToPage(page, dataVM.listPosts.length)
            }
            onListScroll={layoutVM.onListScroll}
            onListMomentumEnd={layoutVM.onListMomentumEnd}
            scrollListToOffset={layoutVM.scrollListToOffset}
            getCurrentOffset={layoutVM.getCurrentOffset}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fixedContent: {
    flex: 1,
    overflow: "hidden",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    minHeight: 48,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(20,20,20,0.54)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
