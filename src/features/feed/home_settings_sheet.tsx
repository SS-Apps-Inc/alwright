import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { colors, spacing, typography } from "@/design-system";
import type { PostLayoutMode } from "@/features/posts/post_layout";
import { PostLayoutPicker } from "@/features/posts/PostLayoutPicker";

type Props = {
  visible: boolean;
  width: number;
  showOnlyLastPost: boolean;
  layoutMode: PostLayoutMode;
  autoApplyLatestPosts: boolean;
  onClose: () => void;
  onChangeShowOnlyLastPost: (value: boolean) => void;
  onChangeLayoutMode: (value: PostLayoutMode) => void;
  onChangeAutoApplyLatestPosts: (value: boolean) => void;
};

export function HomeSettingsSheet({
  visible,
  width,
  showOnlyLastPost,
  layoutMode,
  autoApplyLatestPosts,
  onClose,
  onChangeShowOnlyLastPost,
  onChangeLayoutMode,
  onChangeAutoApplyLatestPosts,
}: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const drawerWidth = Math.max(260, width || 0);

  useEffect(() => {
    Animated.spring(progress, {
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
      tension: 70,
      friction: 12,
    }).start();
  }, [visible, progress]);

  const drawerTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-drawerWidth, 0],
  });

  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.32],
  });

  return (
    <View
      pointerEvents={visible ? "auto" : "none"}
      style={StyleSheet.absoluteFill}
    >
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropOpacity,
          },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          {
            width: drawerWidth,
            transform: [{ translateX: drawerTranslateX }],
          },
        ]}
      >
        <Text style={styles.title}>Home preferences</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Post layout</Text>
          <PostLayoutPicker
            showOnlyLast={showOnlyLastPost}
            layoutMode={layoutMode}
            onChange={(next) => {
              if (next.showOnlyLast) {
                onChangeShowOnlyLastPost(true);
                return;
              }

              onChangeLayoutMode(next.layoutMode);
            }}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.textWrap}>
            <Text style={styles.label}>Always load latest post automatically</Text>
            <Text style={styles.subtitle}>
              New posts appear automatically instead of showing the load new posts button.
            </Text>
          </View>

          <Switch
            value={autoApplyLatestPosts}
            onValueChange={onChangeAutoApplyLatestPosts}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.background,
    paddingTop: 70,
    paddingHorizontal: spacing.xl,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.surfaceBorder,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: typography.weight.black,
    marginBottom: 18,
  },
  row: {
    minHeight: 76,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surfaceBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    paddingVertical: 14,
  },
  field: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surfaceBorder,
    paddingTop: 14,
    paddingBottom: 14,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: typography.weight.heavy,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: typography.weight.semibold,
    marginTop: 4,
  },
});
