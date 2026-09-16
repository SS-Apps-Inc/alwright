// my_posts_screen.tsx
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { useMyPostsVM } from "./use_my_posts_vm";
import { useMyPostsLayoutVM } from "./my_posts_layout_vm";
import { MyPostsHeader } from "./my_posts_header";
import { PostStyleBottomSheet } from "./post_style_bottom_sheet";
import { Image } from "react-native";
import { hexToRgba } from "@/features/posts/ui";
import { MyPostsPageSettingsSheet } from "./my_posts_page_settings_sheet";
import {
  getMainPostRatio,
  isListOnlyLayout,
} from "@/features/posts/post_layout";

export function MyPostsScreen() {
  const dataVM = useMyPostsVM();
  const layoutVM = useMyPostsLayoutVM();
  const router = useRouter();
  const exactHeight =
    layoutVM.insets.top +
    layoutVM.topPad +
    layoutVM.contentHeight +
    layoutVM.bottomPad;
  const pageBg = dataVM.pageSettings.bgColor
    ? hexToRgba(dataVM.pageSettings.bgColor, dataVM.pageSettings.bgOpacity)
    : "#0B0B0C";

  const singlePostLayout = dataVM.pageSettings.showOnlyLast;
  const listOnlyLayout =
    !singlePostLayout && isListOnlyLayout(dataVM.pageSettings.layoutMode);
  const showList = dataVM.listPosts.length > 0;
  const showMainPost = !listOnlyLayout;
  const displaySectionGap = showMainPost && showList ? layoutVM.sectionGap : 0;
  const splitHeight = Math.max(
    0,
    layoutVM.contentHeight - displaySectionGap
  );
  const ratio = getMainPostRatio(dataVM.pageSettings.layoutMode);
  const displayListHeight = showList
    ? listOnlyLayout
      ? layoutVM.contentHeight
      : Math.max(90, Math.floor(splitHeight * (1 - ratio)))
    : 0;

  const displayMainCardHeight = singlePostLayout
    ? Math.max(220, layoutVM.contentHeight - 48)
    : showMainPost
    ? showList
      ? Math.max(160, splitHeight - displayListHeight)
      : Math.max(220, layoutVM.contentHeight - 48)
    : Math.max(220, layoutVM.contentHeight);

  const displayMainCardWidth = showMainPost
    ? layoutVM.mainCardWidth
    : layoutVM.fullMainCardWidth;

  const displaySidePad = showMainPost ? layoutVM.sidePad : 0;
  return (
    <View
      style={[styles.root, { backgroundColor: pageBg }]}
      onLayout={layoutVM.onContainerLayout}
    >

      {/* BACK BUTTON */}
      <View style={[styles.topActions, { top: layoutVM.insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            console.log("page settings before:", dataVM.pageSettingsVisible);
            dataVM.openPageSettings();
          }}
          style={styles.dotsButton}>
          <Image
            source={require("../../assets/dots.png")}
            style={styles.dotsIcon}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      {dataVM.initialLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#ffffff" />
        </View>
      ) : (
        <ScrollView
          style={[styles.root, { backgroundColor: pageBg }]}
          contentContainerStyle={{
            minHeight: exactHeight,
            paddingBottom: layoutVM.insets.bottom + layoutVM.bottomPad,
            paddingTop: layoutVM.insets.top,
            backgroundColor: pageBg,
          }}
          bounces
          alwaysBounceVertical={false}
        >
          <MyPostsHeader
            insetsTop={layoutVM.insets.top}
            topPad={layoutVM.topPad}
            sectionGap={displaySectionGap}
            contentHeight={layoutVM.contentHeight}
            mainCardHeight={displayMainCardHeight}
            listHeight={displayListHeight}
            mainCardWidth={displayMainCardWidth}
            sidePad={displaySidePad}
            listRailWidth={layoutVM.listRailWidth}
            listItemWidth={layoutVM.listItemWidth}
            listItemGap={layoutVM.listItemGap}
            railInset={layoutVM.railInset}
            snapTo={layoutVM.snapTo}
            showList={showList}
            showMainPost={dataVM.showMainPost}
            currentPage={layoutVM.currentPage}
            listRef={layoutVM.listRef}
            mainPost={dataVM.mainPost}
            listPosts={dataVM.listPosts}
            onSettings={dataVM.openSettings}
            onDelete={(post) => dataVM.deletePost(post.id)}
            goToPage={layoutVM.goToPage}
            onListScroll={layoutVM.onListScroll}
            onListMomentumEnd={layoutVM.onListMomentumEnd}
            scrollListToOffset={layoutVM.scrollListToOffset}
            getCurrentOffset={layoutVM.getCurrentOffset}
            hasMore={dataVM.hasMore}
            loadingMore={dataVM.loadingMore}
            loadMore={dataVM.loadMore}
          />
        </ScrollView>

      )
      }
      <PostStyleBottomSheet
        post={dataVM.selectedPost}
        visible={dataVM.settingsVisible}
        updating={dataVM.updating}
        onCancel={dataVM.closeSettings}
        onUpdate={dataVM.updatePostStyle}
      />

      <MyPostsPageSettingsSheet
        visible={dataVM.pageSettingsVisible}
        updating={dataVM.updatingPageSettings}
        value={dataVM.pageSettings}
        onCancel={dataVM.closePageSettings}
        onUpdate={dataVM.updatePageSettings}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0B0B0C",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  backText: {
    color: "#fff",
    fontWeight: "800",
  },
  topActions: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dotsButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  dotsIcon: {
    width: 15,
    height: 15,
  },
});
