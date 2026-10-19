// post_card.tsx
import React, { useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Clipboard,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import type { PostUI } from "@/network/post/postMappers";
import { colors, typography } from "@/design-system";
import { getProfileIconLabel } from "@/features/profile/profile_icon";
import {
  getContainerRadius,
  getDateFontSize,
  getMaxDescriptionFontSize,
  getMinDescriptionFontSize,
  getShapeInsets,
  getTextDirection,
  getWhoFontSize,
  getPostTextColors,
  hexToRgba,
  normalizeMixedText,
} from "./post_card_helpers";
import { usePostDescriptionFit } from "./use_post_description_fit";
import { formatPostDate } from "./post_date";

type Props = {
  post: PostUI;
  showDate?: boolean;
  showActions?: boolean;
  onEdit?: (post: PostUI) => void;
  onDelete?: (post: PostUI) => void;
  onLongPress?: (post: PostUI) => void;
  width?: number | string;
  height?: number | string;
  minFontSize?: number;
  maxFontSize?: number;
  showPublicControls?: boolean;
  showProfileControl?: boolean;
  showCopyControl?: boolean;
  style?: any;

  onPressIn?: () => void;
  onPressOut?: () => void;

};

function getWavyRectPath(width: number, height: number) {
  if (width <= 0 || height <= 0) return "";

  const inset = Math.min(12, Math.max(7, Math.min(width, height) * 0.065));
  const amplitude = inset * 0.9;
  const corner = Math.min(22, width * 0.16, height * 0.16);
  const left = inset;
  const right = width - inset;
  const top = inset;
  const bottom = height - inset;
  let path = `M ${left + corner} ${top}`;

  const horizontal = (from: number, to: number, y: number, outward: number) => {
    const count = Math.max(1, Math.round(Math.abs(to - from) / 24));
    const step = (to - from) / count;
    for (let index = 0; index < count; index += 1) {
      const x = from + step * index;
      path += ` C ${x + step * 0.25} ${y + amplitude * outward}`;
      path += ` ${x + step * 0.75} ${y - amplitude * outward}`;
      path += ` ${x + step} ${y}`;
    }
  };

  const vertical = (from: number, to: number, x: number, outward: number) => {
    const count = Math.max(1, Math.round(Math.abs(to - from) / 24));
    const step = (to - from) / count;
    for (let index = 0; index < count; index += 1) {
      const y = from + step * index;
      path += ` C ${x + amplitude * outward} ${y + step * 0.25}`;
      path += ` ${x - amplitude * outward} ${y + step * 0.75}`;
      path += ` ${x} ${y + step}`;
    }
  };

  horizontal(left + corner, right - corner, top, -1);
  path += ` Q ${right} ${top} ${right} ${top + corner}`;
  vertical(top + corner, bottom - corner, right, 1);
  path += ` Q ${right} ${bottom} ${right - corner} ${bottom}`;
  horizontal(right - corner, left + corner, bottom, 1);
  path += ` Q ${left} ${bottom} ${left} ${bottom - corner}`;
  vertical(bottom - corner, top + corner, left, -1);
  path += ` Q ${left} ${top} ${left + corner} ${top} Z`;
  return path;
}

function WavyBackground({
  width,
  height,
  fill,
}: {
  width: number;
  height: number;
  fill: string;
}) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path d={getWavyRectPath(width, height)} fill={fill} />
      </Svg>
    </View>
  );
}

export function PostCard({
  post,
  showDate = true,
  showActions = false,
  onEdit,
  onDelete,
  onLongPress,
  width = "100%",
  height = 360,
  minFontSize = getMinDescriptionFontSize(),
  maxFontSize = getMaxDescriptionFontSize(),
  showPublicControls = false,
  showProfileControl = true,
  showCopyControl = true,
  style,
  onPressIn,
  onPressOut,
}: Props) {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [boxWidth, setBoxWidth] = useState(320);
  const [boxHeight, setBoxHeight] = useState(
    typeof height === "number" ? height : 360
  );

  const [descAreaHeight, setDescAreaHeight] = useState(0);

  const [scrollY, setScrollY] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [copied, setCopied] = useState(false);

  const bg = useMemo(
    () => hexToRgba(post.bgColor, post.bgOpacity),
    [post.bgColor, post.bgOpacity]
  );

  const borderRadius = useMemo(() => {
    const size = Math.min(boxWidth, boxHeight);
    return getContainerRadius(size, post.bgRadius);
  }, [boxWidth, boxHeight, post.bgRadius]);

  const shapeInsets = useMemo(() => {
    return getShapeInsets(boxWidth, boxHeight, post.bgRadius);
  }, [boxWidth, boxHeight, post.bgRadius]);

  const contentWidth = useMemo(() => {
    return Math.max(boxWidth - shapeInsets.left - shapeInsets.right, 1);
  }, [boxWidth, shapeInsets.left, shapeInsets.right]);

  const direction = useMemo(() => {
    return getTextDirection(post.description);
  }, [post.description]);

  const displayText = useMemo(() => {
    return normalizeMixedText(post.description, direction);
  }, [post.description, direction]);

  const textColors = useMemo(() => {
    return getPostTextColors(post.fontColor);
  }, [post.fontColor]);

  const dateFontSize = useMemo(() => {
    return getDateFontSize(contentWidth, showDate);
  }, [contentWidth, showDate]);

  const whoFontSize = useMemo(() => {
    return getWhoFontSize(contentWidth, post.who);
  }, [contentWidth, post.who]);

  const textAlign = direction === "rtl" ? "right" : "left";
  const hasWho = !!post.who?.trim();
  const showProfileIcon =
    showPublicControls && showProfileControl && post.profileLinksEnabled;
  const showCopyIcon = showPublicControls && showCopyControl && post.postCopyEnabled;
  const descriptionTopPadding = 10;
  const descriptionBottomPadding = hasWho ? 8 : 12;

  const actualTextHeight = useMemo(() => {
    return Math.max(
      descAreaHeight - descriptionTopPadding - descriptionBottomPadding,
      1
    );
  }, [descAreaHeight, descriptionBottomPadding, descriptionTopPadding]);

  const fit = usePostDescriptionFit({
    text: displayText,
    actualHeight: actualTextHeight,
    minFontSize,
    maxFontSize,
  });

  const showTopHint = fit.shouldScroll && scrollY > 10;
  const showBottomHint =
    fit.shouldScroll && scrollY < contentHeight - descAreaHeight - 10;

  function onCardLayout(e: LayoutChangeEvent) {
    const { width: w, height: h } = e.nativeEvent.layout;
    if (w > 0) setBoxWidth(w);
    if (h > 0) setBoxHeight(h);
  }

  function scrollDown() {
    if (!fit.shouldScroll) return;
    scrollRef.current?.scrollTo({
      y: scrollY + descAreaHeight * 0.8,
      animated: true,
    });
  }

  function scrollUp() {
    if (!fit.shouldScroll) return;
    scrollRef.current?.scrollTo({
      y: Math.max(0, scrollY - descAreaHeight * 0.8),
      animated: true,
    });
  }

  function copyPostText() {
    Clipboard.setString(post.description);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  function openProfile() {
    if (!post.profileLinksEnabled) return;
    router.push(`/${post.userId}`);
  }

  return (
    <Pressable
      onLayout={onCardLayout}
      onLongPress={onLongPress ? () => onLongPress(post) : undefined}
      delayLongPress={350}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[
        styles.card,
        {
          width,
          height,
          backgroundColor: post.bgRadius === "wavy" ? "transparent" : bg,
          borderRadius,
          paddingLeft: shapeInsets.left,
          paddingRight: shapeInsets.right,
          paddingTop: shapeInsets.top,
          paddingBottom: shapeInsets.bottom,
        },
        style,
      ]}
    >
      {post.bgRadius === "wavy" ? (
        <WavyBackground width={boxWidth} height={boxHeight} fill={bg} />
      ) : null}

      <View style={styles.topRow}>
        <View style={styles.topLeft}>

          {showProfileIcon ? (
            <Pressable
              onPress={openProfile}
              hitSlop={8}
              accessibilityRole="link"
              accessibilityLabel="Open author page"
              style={({ pressed }) => [
                styles.profileButton,
                pressed && styles.iconButtonPressed,
              ]}
            >
              <Text style={styles.profileButtonText}>
                {getProfileIconLabel(post.profileIconType)}
              </Text>
            </Pressable>
          ) : null}

          {showDate ? (
            <Text
              numberOfLines={1}
              style={[
                styles.dateText,
                {
                  fontSize: dateFontSize,
                  color: textColors.date,
                },
              ]}
            >
              {formatPostDate(post.createdAtMs)}
            </Text>
          ) : null}
        </View>

        <View style={styles.topRight}>
          {showActions ? (
            <View style={styles.actionsRow}>
              <Pressable
                onPress={() => onEdit?.(post)}
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.actionButtonPressed,
                ]}
              >
                <Text
                  style={[styles.actionText, { color: textColors.actionText }]}
                >
                  Edit
                </Text>
              </Pressable>

              <Pressable
                onPress={() => onDelete?.(post)}
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.actionButtonPressed,
                ]}
              >
                <Text
                  style={[styles.actionText, { color: textColors.actionText }]}
                >
                  Delete
                </Text>
              </Pressable>
            </View>
          ) : null}

          {showCopyIcon ? (
            <Pressable
              onPress={copyPostText}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Copy post text"
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}
            >
              <Text style={styles.iconButtonText}>{copied ? "✓" : "⧉"}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View
        style={styles.descriptionArea}
        onLayout={(e) => setDescAreaHeight(e.nativeEvent.layout.height)}
      >
        {!fit.ready && descAreaHeight > 0 ? (
          <View pointerEvents="none" style={styles.hiddenMeasureWrap}>
            <Text
              key={`${fit.measurePhase}-${fit.measureFontSize}-${contentWidth}-${displayText}`}
              onLayout={(e) => fit.onMeasuredHeight(e.nativeEvent.layout.height)}
              textBreakStrategy="simple"
              android_hyphenationFrequency="none"
              lineBreakStrategyIOS="standard"
              style={[
                styles.descriptionText,
                {
                  width: contentWidth,
                  maxWidth: contentWidth,
                  fontSize: fit.measureFontSize,
                  lineHeight: Math.ceil(fit.measureFontSize * 1.22),
                  writingDirection: direction,
                  textAlign,
                  color: textColors.main,
                },
              ]}
            >
              {displayText}
            </Text>
          </View>
        ) : null}

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          scrollEnabled={fit.shouldScroll}
          onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
          scrollEventThrottle={16}
          onContentSizeChange={(_, h) => setContentHeight(h)}
          contentContainerStyle={[
            styles.descriptionScrollContent,
            {
              paddingTop: descriptionTopPadding,
              paddingBottom: descriptionBottomPadding,
            },
            fit.shouldScroll
              ? styles.descriptionScrollTop
              : styles.descriptionScrollCentered,
          ]}
        >
          <Text
            textBreakStrategy="simple"
            android_hyphenationFrequency="none"
            lineBreakStrategyIOS="standard"
            style={[
              styles.descriptionText,
              {
                width: contentWidth,
                maxWidth: contentWidth,
                fontSize: fit.fittedFontSize,
                lineHeight: fit.lineHeight,
                writingDirection: direction,
                textAlign,
                color: textColors.main,
              },
            ]}
          >
            {displayText}
          </Text>
        </ScrollView>
      </View>

      {hasWho ? (
        <View style={styles.footer}>
          <Text
            numberOfLines={1}
            style={[
              styles.whoText,
              {
                fontSize: whoFontSize,
                textAlign: direction === "rtl" ? "left" : "right",
                color: textColors.who,
              },
            ]}
          >
            - {post.who} -
          </Text>
        </View>
      ) : null}

      {showTopHint ? (
        <Pressable
          onPress={scrollUp}
          style={[styles.cardScrollHint, styles.cardTopHint]}
        >
          <Text style={styles.hintArrow}>↑</Text>
        </Pressable>
      ) : null}

      {showBottomHint ? (
        <Pressable
          onPress={scrollDown}
          style={[styles.cardScrollHint, styles.cardBottomHint]}
        >
          <Text style={styles.hintArrow}>↓</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    justifyContent: "space-between",
    position: "relative",
  },

  iconButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.76)",
    alignItems: "center",
    justifyContent: "center",
  },

  iconButtonPressed: {
    opacity: 0.7,
  },

  iconButtonText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: typography.weight.black,
    lineHeight: 16,
  },

  profileButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(20,20,20,0.72)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  profileButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: typography.weight.black,
    lineHeight: 16,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 0,
  },

  topLeft: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },

  dateText: {
    fontWeight: "600",
    flexShrink: 1,
  },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
    marginLeft: 8,
  },

  actionButton: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 4,
    flexShrink: 1,
  },

  actionButtonPressed: {
    opacity: 0.7,
  },

  actionText: {
    fontSize: 11,
    fontWeight: "700",
  },

  descriptionArea: {
    flex: 1,
    marginTop: 0,
    position: "relative",
    overflow: "hidden",
  },

  hiddenMeasureWrap: {
    position: "absolute",
    opacity: 0,
    left: -10000,
    top: -10000,
  },

  descriptionScrollContent: {
    flexGrow: 1,
    alignItems: "stretch",
  },

  descriptionScrollTop: {
    justifyContent: "flex-start",
  },

  descriptionScrollCentered: {
    justifyContent: "flex-start",
  },

  descriptionText: {
    fontWeight: Platform.OS === "web" ? "700" : "600",
  },

  footer: {
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },

  whoText: {
    fontWeight: "700",
    maxWidth: "100%",
  },

  cardScrollHint: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.20)",
    zIndex: 10,
  },

  cardTopHint: {
    top: 28,
  },

  cardBottomHint: {
    bottom: 24,
  },

  hintArrow: {
    fontSize: 22,
    fontWeight: "600",
    color: "#111",
  },
});
