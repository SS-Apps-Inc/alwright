import React, { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Animated,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import {
  getEmojiFlag,
  type CountryCode,
} from "react-native-country-picker-modal";
import { colors, spacing, typography } from "@/design-system";
import type { PostLayoutMode } from "@/features/posts/post_layout";
import { PostLayoutPicker } from "@/features/posts/PostLayoutPicker";
import type { HomeSinglePostSource } from "@/memory";

type Props = {
  visible: boolean;
  width: number;
  showOnlyLastPost: boolean;
  singlePostSource: HomeSinglePostSource;
  layoutMode: PostLayoutMode;
  autoApplyLatestPosts: boolean;
  showCountryPreference: boolean;
  feedCountryCodes: string[];
  onClose: () => void;
  onChangeShowOnlyLastPost: (value: boolean) => void;
  onChangeSinglePostSource: (value: HomeSinglePostSource) => void;
  onChangeLayoutMode: (value: PostLayoutMode) => void;
  onChangeAutoApplyLatestPosts: (value: boolean) => void;
  onOpenCountryPicker: () => void;
};

export function HomeSettingsSheet({
  visible,
  width,
  showOnlyLastPost,
  singlePostSource,
  layoutMode,
  autoApplyLatestPosts,
  showCountryPreference,
  feedCountryCodes,
  onClose,
  onChangeShowOnlyLastPost,
  onChangeSinglePostSource,
  onChangeLayoutMode,
  onChangeAutoApplyLatestPosts,
  onOpenCountryPicker,
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

        {showCountryPreference ? (
          <Pressable
            accessibilityRole="button"
            onPress={onOpenCountryPicker}
            style={({ pressed }) => [styles.countryRow, pressed && styles.rowPressed]}
          >
            <View style={styles.textWrap}>
              <Text style={styles.label}>Country</Text>
              <Text style={styles.countryValue} numberOfLines={1}>
                {feedCountryCodes.length === 0
                  ? "🌎  Everywhere"
                  : feedCountryCodes
                      .map(
                        (code) =>
                          `${getEmojiFlag(code as CountryCode)} ${code}`
                      )
                      .join("  ·  ")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>Post layout</Text>
          <PostLayoutPicker
            showOnlyLast={showOnlyLastPost}
            layoutMode={layoutMode}
            onChange={(next) => {
              if (next.showOnlyLast) {
                onChangeShowOnlyLastPost(true);
                onClose();
                return;
              }

              onChangeLayoutMode(next.layoutMode);
              onClose();
            }}
          />

          {showOnlyLastPost ? (
            <View style={styles.singleSourceWrap}>
              <Text style={styles.sourceLabel}>Which post?</Text>
              <View style={styles.sourceRow}>
                {(["latest", "random"] as const).map((source) => {
                  const selected = singlePostSource === source;
                  return (
                    <Pressable
                      key={source}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => {
                        onChangeSinglePostSource(source);
                        onClose();
                      }}
                      style={({ pressed }) => [
                        styles.sourceButton,
                        selected && styles.sourceButtonSelected,
                        pressed && styles.sourceButtonPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.sourceButtonText,
                          selected && styles.sourceButtonTextSelected,
                        ]}
                      >
                        {source === "latest" ? "Latest" : "Random"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}
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
  countryRow: {
    minHeight: 76,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surfaceBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    paddingVertical: 14,
  },
  countryValue: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: typography.weight.semibold,
    marginTop: 6,
  },
  rowPressed: { opacity: 0.66 },
  field: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surfaceBorder,
    paddingTop: 14,
    paddingBottom: 14,
  },
  singleSourceWrap: {
    marginTop: 18,
  },
  sourceLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: typography.weight.semibold,
    marginBottom: 9,
  },
  sourceRow: {
    flexDirection: "row",
    gap: 8,
  },
  sourceButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  sourceButtonSelected: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  sourceButtonPressed: {
    opacity: 0.72,
  },
  sourceButtonText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: typography.weight.heavy,
  },
  sourceButtonTextSelected: {
    color: colors.textInverse,
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
