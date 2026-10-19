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
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, postBackgroundColors } from "@/design-system/tokens";
import { PostCard } from "@/features/posts/ui";
import type { PostUI } from "@/network/post/postMappers";
import { RadiusSegmentControl } from "./radius_segment_control";
import {
  BackgroundStyleControls,
  MIN_BACKGROUND_OPACITY,
} from "./background_style_controls";
import {
  EditablePostStyle,
  getEditableStyleFromPost,
  MyPostsUpdatePayload,
} from "./my_posts_types";
import { POST_FONT_COLORS } from "@/config";

type Props = {
  post: PostUI | null;
  visible: boolean;
  updating: boolean;
  pageBackgroundColor: string;
  onCancel: () => void;
  onUpdate: (payload: MyPostsUpdatePayload) => Promise<void>;
};

export function PostStyleBottomSheet({
  post,
  visible,
  updating,
  pageBackgroundColor,
  onCancel,
  onUpdate,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const paletteGap = 8;
  const paletteItemSize = Math.max(
    46,
    (windowWidth - 20 - paletteGap * 6) / 6.5
  );
  const paletteCircleSize = 34;
  const previewTop = Math.max(0, insets.top - 20);
  const initial = useMemo(() => {
    return post ? getEditableStyleFromPost(post) : null;
  }, [post]);

  const [draft, setDraft] = useState<EditablePostStyle | null>(initial);
  React.useEffect(() => {
    if (!initial) return;
    setDraft({
      ...initial,
      bgOpacity: Math.max(MIN_BACKGROUND_OPACITY, initial.bgOpacity ?? 1),
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
        bgOpacity: Math.max(MIN_BACKGROUND_OPACITY, draft.bgOpacity),
      },
    });
  }

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={onCancel}
      >
        <View
          style={[
            styles.overlay,
            {
              paddingTop: previewTop,
              backgroundColor: pageBackgroundColor,
            },
          ]}
        >
          <Pressable style={styles.backdrop} onPress={onCancel} />
          <View
            style={[
              styles.previewStage,
              {
                backgroundColor: pageBackgroundColor,
                height: Math.max(160, windowHeight * 0.4 - previewTop),
              },
            ]}
          >
            <View style={styles.previewWrap}>
              <PostCard
                post={previewPost}
                showDate={true}
                showActions={false}
                height="100%"
                style={{ width: "100%" }}
              />
            </View>
          </View>
          <View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 20) },
            ]}
          >
            <View style={styles.handle} />
            <ScrollView
              style={styles.settingsScroll}
              contentContainerStyle={styles.settingsContent}
              showsVerticalScrollIndicator={false}
            >
              <BackgroundStyleControls
                active={visible}
                color={draft.bgColor}
                opacity={draft.bgOpacity}
                palette={postBackgroundColors}
                onChangeColor={(bgColor) =>
                  setDraft((previous) =>
                    previous ? { ...previous, bgColor } : previous
                  )
                }
                onChangeOpacity={(bgOpacity) =>
                  setDraft((previous) =>
                    previous ? { ...previous, bgOpacity } : previous
                  )
                }
              />

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

              <View style={styles.field}>
                <Text style={styles.label}>Font color</Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.edgeToEdgePalette}
                  contentContainerStyle={styles.rowColors}
                >
                  {POST_FONT_COLORS.map((hex) => {
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
                        style={[
                          styles.colorWrapper,
                          { width: paletteItemSize, height: paletteItemSize },
                        ]}
                      >
                        <View
                          style={[
                            styles.circle,
                            {
                              width: paletteCircleSize,
                              height: paletteCircleSize,
                              borderRadius: paletteCircleSize / 2,
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
            </ScrollView>

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
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },

  sheet: {
    flex: 1,
    backgroundColor: "#0B0B0C",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 0,
  },

  handle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#3A3A3C",
    alignSelf: "center",
    marginBottom: 18,
  },

  settingsScroll: { flex: 1, marginHorizontal: -20 },
  settingsContent: { paddingHorizontal: 20, paddingBottom: 8 },

  field: {
    marginBottom: 24,
  },

  label: {
    color: "#fff",
    fontWeight: "800",
    marginBottom: 10,
  },

  rowColors: {
    gap: 8,
    paddingHorizontal: 20,
  },

  edgeToEdgePalette: { marginHorizontal: -20 },

  colorWrapper: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },

  previewStage: {
    flexShrink: 0,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
  },

  previewWrap: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "flex-end",
    minHeight: 120,
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
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surfaceBorder,
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
