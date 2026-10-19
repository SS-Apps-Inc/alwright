import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/design-system/tokens";
import type { PostUI } from "@/network/post/postMappers";
import { showDeletePostConfirm } from "./delete_post_confirm";

type Props = {
  post: PostUI;
  visible: boolean;
  onChangeVisible: (visible: boolean) => void;
  onSettings: (post: PostUI) => void;
  onDelete: (post: PostUI) => void;
};

export function MyPostCardActions({
  post,
  visible,
  onChangeVisible,
  onSettings,
  onDelete,
}: Props) {
  const progress = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(progress, {
      toValue: visible ? 1 : 0,
      damping: 18,
      stiffness: 240,
      mass: 0.7,
      useNativeDriver: true,
    }).start();
  }, [progress, visible]);

  const close = React.useCallback(() => onChangeVisible(false), [onChangeVisible]);

  const edit = React.useCallback(() => {
    close();
    onSettings(post);
  }, [close, onSettings, post]);

  const remove = React.useCallback(() => {
    close();
    showDeletePostConfirm({
      post,
      onConfirm: () => onDelete(post),
    });
  }, [close, onDelete, post]);

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {visible ? (
        <Pressable
          accessibilityLabel="Close post menu"
          onPress={close}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Post options"
        hitSlop={8}
        onPress={() => onChangeVisible(!visible)}
        style={({ pressed }) => [
          styles.trigger,
          pressed && styles.triggerPressed,
        ]}
      >
        <Ionicons name="ellipsis-horizontal" size={13} color={colors.text} />
      </Pressable>

      <Animated.View
        pointerEvents={visible ? "auto" : "none"}
        style={[
          styles.menu,
          {
            opacity: progress,
            transform: [
              {
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-8, 0],
                }),
              },
              {
                scale: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.94, 1],
                }),
              },
            ],
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          onPress={edit}
          style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
        >
          <Ionicons name="pencil-outline" size={18} color={colors.text} />
          <Text style={styles.menuText}>Stylize post</Text>
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          accessibilityRole="button"
          onPress={remove}
          style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={[styles.menuText, styles.deleteText]}>Delete post</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 32,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.darkControl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.faintBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  triggerPressed: { opacity: 0.72, transform: [{ scale: 0.96 }] },
  menu: {
    position: "absolute",
    top: 52,
    right: 10,
    zIndex: 31,
    width: 164,
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.faintBorder,
    shadowColor: colors.overlay,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  menuItem: {
    minHeight: 48,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  menuItemPressed: { backgroundColor: colors.fieldBackground },
  menuText: { color: colors.text, fontSize: 15, fontWeight: "700" },
  deleteText: { color: colors.error },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.surfaceBorder },
});
