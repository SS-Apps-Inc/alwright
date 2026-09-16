// MyPostsPageSettingsSheet.tsx
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
} from "react-native";
import Slider from "@react-native-community/slider";
import type { MyPostsPageSettings } from "./my_posts_types";
import {
  getProfileIconLabel,
  PROFILE_ICON_OPTIONS,
} from "@/features/profile/profile_icon";
import { PostLayoutPicker } from "@/features/posts/PostLayoutPicker";

type Props = {
  visible: boolean;
  updating: boolean;
  value: MyPostsPageSettings;
  onCancel: () => void;
  onUpdate: (next: MyPostsPageSettings) => Promise<void>;
};

const BG_COLORS = [
  "#0B0B0C",
  "#111111",
  "#1C1C1E",
  "#E40303",
  "#FF8C00",
  "#004DFF",
  "#750787",
  "#A8DADC",
  "#CDB4DB",
  "#EAEAEA",
];

const MIN_OPACITY = 0.2;

export function MyPostsPageSettingsSheet({
  visible,
  updating,
  value,
  onCancel,
  onUpdate,
}: Props) {
  const [draft, setDraft] = useState<MyPostsPageSettings>(value);

  useEffect(() => {
    if (visible) {
      setDraft({
        ...value,
        autoLatest: true,
        bgOpacity: Math.max(MIN_OPACITY, value.bgOpacity ?? 1),
      });
    }
  }, [visible, value]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onCancel} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>Page settings</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Post layout</Text>

            <PostLayoutPicker
              showOnlyLast={draft.showOnlyLast}
              layoutMode={draft.layoutMode}
              onChange={(next) =>
                setDraft((prev) => ({
                  ...prev,
                  showOnlyLast: next.showOnlyLast,
                  layoutMode: next.layoutMode,
                }))
              }
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Profile icon</Text>

            <View style={styles.iconOptionsRow}>
              {PROFILE_ICON_OPTIONS.map((option) => {
                const selected = draft.profileIconType === option.type;

                return (
                  <Pressable
                    key={option.type}
                    onPress={() =>
                      setDraft((prev) => ({
                        ...prev,
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

          <View style={styles.row}>
            <View style={styles.textWrap}>
              <Text style={styles.label}>Others can find my page from posts</Text>
              <Text style={styles.subtitle}>
                Show your profile icon on posts and link it to your public page.
              </Text>
            </View>

            <Switch
              value={draft.profileLinksEnabled}
              onValueChange={(v) =>
                setDraft((prev) => ({ ...prev, profileLinksEnabled: v }))
              }
            />
          </View>

          <View style={styles.row}>
            <View style={styles.textWrap}>
              <Text style={styles.label}>Others can copy post text</Text>
              <Text style={styles.subtitle}>
                Show a copy button on your public posts.
              </Text>
            </View>

            <Switch
              value={draft.postCopyEnabled}
              onValueChange={(v) =>
                setDraft((prev) => ({ ...prev, postCopyEnabled: v }))
              }
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Background color</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.colorsRow}
            >
              <Pressable
                onPress={() =>
                  setDraft((prev) => ({ ...prev, bgColor: null }))
                }
                style={styles.colorButton}
              >
                <View
                  style={[
                    styles.colorCircle,
                    styles.clearCircle,
                    {
                      borderColor: draft.bgColor === null ? "#FFFFFF" : "#333333",
                      borderWidth: draft.bgColor === null ? 3 : 1,
                    },
                  ]}
                >
                  <Text style={styles.clearText}>Clear</Text>
                </View>

                {draft.bgColor === null ? <Text style={styles.check}>✓</Text> : null}
              </Pressable>

              {BG_COLORS.map((hex) => {
                const selected =
                  draft.bgColor?.toLowerCase() === hex.toLowerCase();

                return (
                  <Pressable
                    key={hex}
                    onPress={() =>
                      setDraft((prev) => ({ ...prev, bgColor: hex }))
                    }
                    style={styles.colorButton}
                  >
                    <View
                      style={[
                        styles.colorCircle,
                        {
                          backgroundColor: hex,
                          borderColor: selected ? "#FFFFFF" : "#333333",
                          borderWidth: selected ? 3 : 1,
                        },
                      ]}
                    />

                    {selected ? <Text style={styles.check}>✓</Text> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.field}>
            <View style={styles.valueRow}>
              <Text style={styles.label}>Background opacity</Text>
              <Text style={styles.valueText}>
                {Math.round(draft.bgOpacity * 100)}%
              </Text>
            </View>

            <Slider
              value={draft.bgOpacity}
              minimumValue={MIN_OPACITY}
              maximumValue={1}
              step={0.01}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#444444"
              thumbTintColor="#FFFFFF"
              onValueChange={(v) =>
                setDraft((prev) => ({
                  ...prev,
                  bgOpacity: Math.max(MIN_OPACITY, v),
                }))
              }
            />
          </View>

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
                <ActivityIndicator color="#111111" />
              ) : (
                <Text style={styles.updateText}>Update</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  sheet: {
    backgroundColor: "#0B0B0C",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 32,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#3A3A3C",
    alignSelf: "center",
    marginBottom: 18,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 12,
  },
  row: {
    minHeight: 72,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#2A2A2A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    paddingVertical: 14,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  subtitle: {
    color: "#AFAFAF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  field: {
    marginTop: 14,
  },
  iconOptionsRow: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 12,
  },
  iconOption: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#333333",
    alignItems: "center",
    justifyContent: "center",
  },
  iconOptionSelected: {
    borderColor: "#FFFFFF",
    borderWidth: 3,
  },
  iconOptionText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },
  colorsRow: {
    gap: 12,
    paddingTop: 12,
  },
  colorButton: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  colorCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  clearCircle: {
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  clearText: {
    color: "#AFAFAF",
    fontSize: 9,
    fontWeight: "900",
  },
  check: {
    position: "absolute",
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  valueText: {
    color: "#AFAFAF",
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 22,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  updateButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  cancelText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  updateText: {
    color: "#111111",
    fontWeight: "900",
  },
});
