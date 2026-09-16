// my_posts_layout_vm.ts
import { useCallback, useMemo, useRef, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { PostUI } from "@/network/post/postMappers";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

export function useMyPostsLayoutVM() {
  const insets = useSafeAreaInsets();

  const listRef = useRef<FlatList<PostUI>>(null!);
  const currentOffsetRef = useRef(0);

  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerWidth(width);
    setContainerHeight(height);
  }, []);

  const sidePad = clamp(containerWidth * 0.04, 12, 28);
  const topPad = 12;
  const sectionGap = 14;
  const bottomPad = 20;

  const usableHeight = Math.max(
    0,
    containerHeight - insets.top - insets.bottom
  );
  const contentHeight = Math.max(0, usableHeight - topPad - bottomPad);

  const mainCardHeight = Math.floor((contentHeight - sectionGap) * (2 / 3));
  const listHeight = Math.max(110, contentHeight - sectionGap - mainCardHeight);

  const mainCardWidth = Math.max(0, containerWidth - sidePad * 2);
  const listRailWidth = mainCardWidth;

  const railPeek = 16;
  const listItemGap = 12;
  const listItemWidth = Math.max(220, listRailWidth - railPeek * 2);
  const railInset = railPeek;
  const snapTo = listItemWidth + listItemGap;

  const displaySidePad = sidePad;
  const displaySectionGap = sectionGap;
  const displayListHeight = listHeight;
  const displayMainCardWidth = Math.max(0, containerWidth - displaySidePad * 2);
  const displayMainCardHeight = Math.max(220, contentHeight);

  const fullMainSidePad = 16;
  const fullMainCardWidth = Math.max(0, containerWidth - fullMainSidePad * 2);
  const fullMainCardHeight = Math.max(220, contentHeight);

  const goToPage = useCallback(
    (page: number, itemCount: number) => {
      const nextPage = clamp(page, 0, Math.max(0, itemCount - 1));
      setCurrentPage(nextPage);

      const offset = nextPage * snapTo;
      currentOffsetRef.current = offset;

      listRef.current?.scrollToOffset({
        offset,
        animated: true,
      });
    },
    [snapTo]
  );

  const onListScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    currentOffsetRef.current = e.nativeEvent.contentOffset.x;
  }, []);

  const onListMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      currentOffsetRef.current = x;
      setCurrentPage(Math.round(x / snapTo));
    },
    [snapTo]
  );

  const scrollListToOffset = useCallback((offset: number, animated = false) => {
    currentOffsetRef.current = offset;
    listRef.current?.scrollToOffset({
      offset,
      animated,
    });
  }, []);

  const getCurrentOffset = useCallback(() => currentOffsetRef.current, []);

  return {
    insets,
    onContainerLayout,

    containerHeight,

    sidePad,
    topPad,
    sectionGap,
    bottomPad,
    contentHeight,

    mainCardHeight,
    listHeight,
    mainCardWidth,

    listRailWidth,
    listItemWidth,
    listItemGap,
    railInset,
    snapTo,

    displaySidePad,
    displaySectionGap,
    displayListHeight,
    displayMainCardHeight,
    displayMainCardWidth,

    currentPage,
    listRef,

    goToPage,
    onListScroll,
    onListMomentumEnd,
    scrollListToOffset,
    getCurrentOffset,

    fullMainSidePad,
    fullMainCardWidth,
    fullMainCardHeight,
  };
}
