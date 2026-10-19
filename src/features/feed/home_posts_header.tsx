import React from "react";
import { PostsCarouselHeader } from "@/features/posts/ui";
import type { useHomePostsVM } from "./use_home_posts_vm";

type VM = ReturnType<typeof useHomePostsVM>;

export function HomePostsHeader(vm: VM) {
  return (
    <PostsCarouselHeader
      insetsTop={vm.insets.top}
      topPad={vm.topPad}
      contentHeight={vm.contentHeight}
      displaySidePad={vm.displaySidePad}
      displaySectionGap={vm.displaySectionGap}
      displayListHeight={vm.displayListHeight}
      displayMainCardHeight={vm.displayMainCardHeight}
      displayMainCardWidth={vm.displayMainCardWidth}
      listItemWidth={vm.listItemWidth}
      listItemGap={vm.listItemGap}
      railInset={vm.railInset}
      snapTo={vm.snapTo}
      initialLoading={vm.initialLoading}
      loadingMore={vm.loadingMore}
      mainPost={vm.mainPost}
      listPosts={vm.listPosts}
      hasMore={vm.hasMore}
      currentPage={vm.currentPage}
      listRef={vm.listRef}
      showMainPost={vm.showMainPost}
      showMainPublicControls={!vm.homeSettings.showOnlyLastPost}
      showList={vm.showList}
      hasPendingNewPosts={vm.hasPendingNewPosts}
      pendingNewPostCount={vm.pendingNewPostCount}
      onApplyPendingPosts={vm.applyPendingPosts}
      showSettingsButton
      emptyTitle="There are no posts here yet"
      emptyMessage={
        vm.countryFeatureAvailable
          ? "Invite a friend abroad to bring a new perspective into your feed. Ask them to enter your phone number under “Referred by?” when they join, and you’ll receive one month of Pro."
          : undefined
      }
      emptyActionLabel={vm.countryFeatureAvailable ? "Invite a friend" : undefined}
      onEmptyAction={
        vm.countryFeatureAvailable ? vm.inviteForeignFriend : undefined
      }
      loadMore={vm.loadMore}
      goToPage={vm.goToPage}
      onListScroll={vm.onListScroll}
      onListMomentumEnd={vm.onListMomentumEnd}
      scrollListToOffset={vm.scrollListToOffset}
      getCurrentOffset={vm.getCurrentOffset}
    />
  );
}
