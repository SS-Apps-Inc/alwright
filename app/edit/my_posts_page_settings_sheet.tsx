import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, postBackgroundColors } from "@/design-system/tokens";
import {
  getProfileIconLabel,
  PROFILE_ICON_OPTIONS,
} from "@/features/profile/profile_icon";
import { PostLayoutPicker } from "@/features/posts/PostLayoutPicker";
import {
  BackgroundStyleControls,
  MIN_BACKGROUND_OPACITY,
} from "./background_style_controls";
import type { MyPostsPageSettings } from "./my_posts_types";

type Props = {
  visible: boolean;
  updating: boolean;
  value: MyPostsPageSettings;
  onCancel: () => void;
  onUpdate: (next: MyPostsPageSettings) => Promise<void>;
};

const PAGE_BACKGROUND_COLORS = [
  "#0B0B0C",
  ...postBackgroundColors,
  "#EAEAEA",
] as const;
export function MyPostsPageSettingsSheet({
  visible,
  updating,
  value,
  onCancel,
  onUpdate,
}: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [draft, setDraft] = useState<MyPostsPageSettings>(value);

  useEffect(() => {
    if (!visible) return;

    setDraft({
      ...value,
      autoLatest: true,
      bgOpacity: Math.max(MIN_BACKGROUND_OPACITY, value.bgOpacity ?? 1),
    });
  }, [visible, value]);

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        presentationStyle="overFullScreen"
        onRequestClose={onCancel}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={onCancel} />

          <View
            style={[
              styles.sheet,
              {
                height: windowHeight * 0.8,
                paddingBottom: Math.max(insets.bottom, 20),
              },
            ]}
          >
            <View style={styles.handle} />

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Page&apos;s posts layout</Text>
                <PostLayoutPicker
                  showOnlyLast={draft.showOnlyLast}
                  layoutMode={draft.layoutMode}
                  onChange={(next) =>
                    setDraft((previous) => ({
                      ...previous,
                      showOnlyLast: next.showOnlyLast,
                      layoutMode: next.layoutMode,
                    }))
                  }
                />
              </View>

              <View style={styles.switchSection}>
                <View style={styles.textWrap}>
                  <Text style={styles.rowLabel}>Others can find my page from posts</Text>
                  <Text style={styles.subtitle}>
                    Show your profile icon on posts and link it to your public page.
                  </Text>
                </View>
                <Switch
                  value={draft.profileLinksEnabled}
                  onValueChange={(profileLinksEnabled) =>
                    setDraft((previous) => ({ ...previous, profileLinksEnabled }))
                  }
                />
              </View>

              {draft.profileLinksEnabled ? (
                <View style={styles.profileIconSection}>
                  <Text style={styles.sectionLabel}>Profile picture</Text>
                  <View style={styles.iconOptionsRow}>
                    {PROFILE_ICON_OPTIONS.map((option) => {
                      const selected = draft.profileIconType === option.type;
                      return (
                        <Pressable
                          key={option.type}
                          onPress={() =>
                            setDraft((previous) => ({
                              ...previous,
                              profileIconType: option.type,
                            }))
                          }
                          style={[
                            styles.iconOption,
                            selected && styles.iconOptionSelected,
                          ]}
                        >
                          <Text style={styles.iconOptionText}>
                            {getProfileIconLabel(option.type)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}

              <View style={styles.switchSection}>
                <View style={styles.textWrap}>
                  <Text style={styles.rowLabel}>Others can find my posts by country</Text>
                  <Text style={styles.subtitle}>
                    {draft.phoneCountryFlag
                      ? `Show your public posts in the ${draft.phoneCountryFlag} ${draft.phoneCountryCode} country feed. Your phone number stays private.`
                      : "Show your public posts in your country’s feed. Your phone number stays private."}
                  </Text>
                </View>
                <Switch
                  value={draft.countryDiscoveryEnabled}
                  onValueChange={(countryDiscoveryEnabled) =>
                    setDraft((previous) => ({
                      ...previous,
                      countryDiscoveryEnabled,
                    }))
                  }
                />
              </View>

              <View style={styles.switchSection}>
                <View style={styles.textWrap}>
                  <Text style={styles.rowLabel}>Others can copy post text</Text>
                  <Text style={styles.subtitle}>
                    Show a copy button on your public posts.
                  </Text>
                </View>
                <Switch
                  value={draft.postCopyEnabled}
                  onValueChange={(postCopyEnabled) =>
                    setDraft((previous) => ({ ...previous, postCopyEnabled }))
                  }
                />
              </View>

              <BackgroundStyleControls
                active={visible}
                allowClear
                color={draft.bgColor}
                opacity={draft.bgOpacity}
                palette={PAGE_BACKGROUND_COLORS}
                sectionSpacing={32}
                onChangeColor={(bgColor) =>
                  setDraft((previous) => ({ ...previous, bgColor }))
                }
                onChangeOpacity={(bgOpacity) =>
                  setDraft((previous) => ({ ...previous, bgOpacity }))
                }
              />
            </ScrollView>

            <View style={styles.actions}>
              <Pressable
                disabled={updating}
                onPress={onCancel}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                disabled={updating}
                onPress={() => onUpdate({ ...draft, autoLatest: true })}
                style={styles.updateButton}
              >
                {updating ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <Text style={styles.updateText}>Update</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.surfaceBorder,
    alignSelf: "center",
    marginBottom: 18,
  },
  scroll: { flex: 1, marginHorizontal: -20 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 8 },
  section: { marginBottom: 32 },
  sectionLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 14,
  },
  switchSection: {
    minHeight: 86,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surfaceBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    paddingVertical: 20,
  },
  profileIconSection: {
    paddingTop: 6,
    paddingBottom: 32,
  },
  textWrap: { flex: 1 },
  rowLabel: { color: colors.text, fontSize: 15, fontWeight: "800" },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    marginTop: 5,
  },
  iconOptionsRow: { flexDirection: "row", gap: 12 },
  iconOption: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  iconOptionSelected: { borderColor: colors.text, borderWidth: 3 },
  iconOptionText: { color: colors.text, fontSize: 24, fontWeight: "900" },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surfaceBorder,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  updateButton: {
    flex: 1,
    backgroundColor: colors.text,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  cancelText: { color: colors.text, fontWeight: "800" },
  updateText: { color: colors.textInverse, fontWeight: "900" },
});
