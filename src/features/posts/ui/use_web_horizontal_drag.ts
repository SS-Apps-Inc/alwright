import { useCallback, useMemo, useRef } from "react";
import { Platform } from "react-native";

type Args = {
  getOffset: () => number;
  scrollToOffset: (x: number, animated?: boolean) => void;
  snapTo: number;
};

export function useWebHorizontalDrag({
  getOffset,
  scrollToOffset,
  snapTo,
}: Args) {
  const dragRef = useRef({
    active: false,
    startX: 0,
    startOffset: 0,
  });

  const snapCurrent = useCallback(() => {
    const current = getOffset();
    const snapped = Math.max(0, Math.round(current / snapTo) * snapTo);
    scrollToOffset(snapped, true);
  }, [getOffset, scrollToOffset, snapTo]);

  return useMemo(() => {
    if (Platform.OS !== "web") {
      return {};
    }

    return {
      onStartShouldSetResponder: () => true,
      onMoveShouldSetResponder: () => true,
      onResponderGrant: (e: any) => {
        dragRef.current.active = true;
        dragRef.current.startX = e.nativeEvent.pageX ?? 0;
        dragRef.current.startOffset = getOffset();
      },
      onResponderMove: (e: any) => {
        if (!dragRef.current.active) return;

        const currentX = e.nativeEvent.pageX ?? 0;
        const delta = currentX - dragRef.current.startX;
        const nextOffset = Math.max(0, dragRef.current.startOffset - delta);

        scrollToOffset(nextOffset, false);
      },
      onResponderRelease: () => {
        dragRef.current.active = false;
        snapCurrent();
      },
      onResponderTerminate: () => {
        dragRef.current.active = false;
        snapCurrent();
      },
    };
  }, [getOffset, scrollToOffset, snapCurrent]);
}
