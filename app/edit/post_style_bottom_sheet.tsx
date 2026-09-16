// post_style_bottom_sheet.tsx
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import Slider from "@react-native-community/slider";
import { PostCard } from "@/features/posts/ui";
import type { PostUI } from "@/network/post/postMappers";
import { RadiusSegmentControl } from "./radius_segment_control";
import {
  EditablePostStyle,
  getEditableStyleFromPost,
  MyPostsUpdatePayload,
} from "./my_posts_types";

type Props = {
  post: PostUI | null;
  visible: boolean;
  updating: boolean;
  onCancel: () => void;
  onUpdate: (payload: MyPostsUpdatePayload) => Promise<void>;
};

const BG_COLORS = [
  "#E40303",
  "#FF8C00",
  "#FFED00",
  "#008026",
  "#004DFF",
  "#750787",
  "#F4A261",
  "#FFD166",
  "#A8DADC",
  "#B8F2E6",
  "#CDB4DB",
  "#EAEAEA",
];

const FONT_COLORS = ["#111111", "#FFFFFF", "#8E8E93"];

const MIN_OPACITY = 0.2;

export function PostStyleBottomSheet({
  post,
  visible,
  updating,
  onCancel,
  onUpdate,
}: Props) {
  const initial = useMemo(() => {
    return post ? getEditableStyleFromPost(post) : null;
  }, [post]);

  const [draft, setDraft] = useState<EditablePostStyle | null>(initial);

  React.useEffect(() => {
    if (!initial) return;
    setDraft({
      ...initial,
      bgOpacity: Math.max(MIN_OPACITY, initial.bgOpacity ?? 1),
    });
  }, [initial]);

  const previewPost = useMemo(() => {
    if (!post || !draft) return null;

    return {
      ...post,
      bgColor: draft.bgColor,
      bgOpacity: draft.bgOpacity,
      bgRadius: draft.bgRadius,
      fontColor: draft.fontColor,
    };
  }, [post, draft]);

  if (!post || !draft || !previewPost) return null;

  async function handleUpdate() {
    if (!post || !draft || updating) return;

    await onUpdate({
      postId: post.id,
      style: {
        ...draft,
        bgOpacity: Math.max(MIN_OPACITY, draft.bgOpacity),
      },
    });
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onCancel} />
        <View style={styles.previewWrap}>
          <PostCard
            post={previewPost}
            showDate={true}
            showActions={false}
            height={220}
          />
        </View>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>Post settings</Text>

          {/* BACKGROUND COLORS */}
          <View style={styles.field}>
            <Text style={styles.label}>Background color</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rowColors}
            >
              {BG_COLORS.map((hex) => {
                const selected =
                  draft.bgColor?.toLowerCase() === hex.toLowerCase();

                return (
                  <Pressable
                    key={hex}
                    onPress={() =>
                      setDraft((prev) =>
                        prev ? { ...prev, bgColor: hex } : prev
                      )
                    }
                    style={styles.colorWrapper}
                  >
                    <View
                      style={[
                        styles.circle,
                        {
                          backgroundColor: hex,
                          borderColor: selected ? "#FFFFFF" : "transparent",
                          borderWidth: selected ? 3 : 0,
                        },
                      ]}
                    />

                    {selected && <Text style={styles.check}>✓</Text>}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* OPACITY */}
          <View style={styles.field}>
            <View style={styles.row}>
              <Text style={styles.label}>Opacity</Text>
              <Text style={styles.value}>
                {Math.round(draft.bgOpacity * 100)}%
              </Text>
            </View>

            <Slider
              value={draft.bgOpacity}
              minimumValue={MIN_OPACITY}
              maximumValue={1}
              step={0.01}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#444"
              thumbTintColor="#FFFFFF"
              onValueChange={(value) =>
                setDraft((prev) =>
                  prev
                    ? { ...prev, bgOpacity: Math.max(MIN_OPACITY, value) }
                    : prev
                )
              }
            />
          </View>

          {/* RADIUS */}
          <View style={styles.field}>
            <Text style={styles.label}>Background radius</Text>
            <RadiusSegmentControl
              value={draft.bgRadius}
              onChange={(value) =>
                setDraft((prev) =>
                  prev ? { ...prev, bgRadius: value } : prev
                )
              }
            />
          </View>

          {/* FONT COLORS */}
          <View style={styles.field}>
            <Text style={styles.label}>Font color</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rowColors}
            >
              {FONT_COLORS.map((hex) => {
                const selected =
                  draft.fontColor?.toLowerCase() === hex.toLowerCase();

                return (
                  <Pressable
                    key={hex}
                    onPress={() =>
                      setDraft((prev) =>
                        prev ? { ...prev, fontColor: hex } : prev
                      )
                    }
                    style={styles.colorWrapper}
                  >
                    <View
                      style={[
                        styles.circle,
                        {
                          backgroundColor: hex,
                          borderColor: selected ? "#FFFFFF" : "#444",
                          borderWidth: 2,
                        },
                      ]}
                    />

                    {selected && <Text style={styles.check}>✓</Text>}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* ACTIONS */}
          <View style={styles.actions}>
            <Pressable style={styles.cancel} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable style={styles.update} onPress={handleUpdate}>
              {updating ? (
                <ActivityIndicator color="#111" />
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
  overlay: { flex: 1, justifyContent: "flex-end" },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  sheet: {
    backgroundColor: "#0B0B0C",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 30,
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
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 16,
  },

  field: {
    marginBottom: 16,
  },

  label: {
    color: "#fff",
    fontWeight: "800",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  value: {
    color: "#aaa",
  },

  rowColors: {
    gap: 12,
  },

  colorWrapper: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },

  previewWrap: {
  marginBottom: 18,
  marginHorizontal: 18,
  alignItems: "center",
},

  circle: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },

  check: {
    position: "absolute",
    color: "#fff",
    fontWeight: "900",
    fontSize: 18,
  },

  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },

  cancel: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  update: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  cancelText: {
    color: "#fff",
    fontWeight: "800",
  },

  updateText: {
    color: "#111",
    fontWeight: "900",
  },
});
