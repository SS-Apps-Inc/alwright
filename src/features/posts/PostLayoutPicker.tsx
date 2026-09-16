import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { colors } from "@/design-system";
import {
  POST_LAYOUT_OPTIONS,
  type PostLayoutMode,
} from "@/features/posts/post_layout";

type Props = {
  showOnlyLast: boolean;
  layoutMode: PostLayoutMode;
  onChange: (next: { showOnlyLast: boolean; layoutMode: PostLayoutMode }) => void;
};

const OPTION_SIZE = 38;

export function PostLayoutPicker({ showOnlyLast, layoutMode, onChange }: Props) {
  return (
    <View style={styles.row}>
      <LayoutOption
        selected={showOnlyLast}
        accessibilityLabel="Show only last post"
        onPress={() => onChange({ showOnlyLast: true, layoutMode })}
      >
        <View style={styles.singleBlock} />
      </LayoutOption>

      {POST_LAYOUT_OPTIONS.map((option) => (
        <LayoutOption
          key={option.mode}
          selected={!showOnlyLast && layoutMode === option.mode}
          accessibilityLabel={option.title}
          onPress={() =>
            onChange({ showOnlyLast: false, layoutMode: option.mode })
          }
        >
          <LayoutIcon mode={option.mode} />
        </LayoutOption>
      ))}
    </View>
  );
}

function LayoutOption({
  selected,
  accessibilityLabel,
  onPress,
  children,
}: {
  selected: boolean;
  accessibilityLabel: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[styles.option, selected && styles.optionSelected]}
    >
      {children}
    </Pressable>
  );
}

function LayoutIcon({ mode }: { mode: PostLayoutMode }) {
  if (mode === "list") {
    return (
      <View style={styles.listIcon}>
        <View style={styles.sidePeek} />
        <View style={styles.listBlock} />
        <View style={styles.sidePeek} />
      </View>
    );
  }

  const mainFlex = mode === "top_30" ? 3 : mode === "top_50" ? 5 : 7;
  const listFlex = 10 - mainFlex;

  return (
    <View style={styles.stackIcon}>
      <View style={[styles.stackMain, { flex: mainFlex }]} />
      <View style={styles.stackGap} />
      <View style={[styles.stackList, { flex: listFlex }]}>
        <View style={styles.sidePeek} />
        <View style={styles.stackListCenter} />
        <View style={styles.sidePeek} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 6,
    marginTop: 12,
  },
  option: {
    width: OPTION_SIZE,
    height: OPTION_SIZE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  optionSelected: {
    borderColor: colors.white,
    borderWidth: 3,
  },
  singleBlock: {
    width: "78%",
    height: "82%",
    backgroundColor: "#F0B9A5",
  },
  listIcon: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    alignItems: "stretch",
    gap: 4,
  },
  listBlock: {
    flex: 1,
    backgroundColor: "#F0B9A5",
  },
  sidePeek: {
    width: 4,
    backgroundColor: "#F0B9A5",
  },
  stackIcon: {
    flex: 1,
    width: "100%",
  },
  stackMain: {
    backgroundColor: "#F0B9A5",
  },
  stackGap: {
    height: 3,
  },
  stackList: {
    flexDirection: "row",
    gap: 3,
  },
  stackListCenter: {
    flex: 1,
    backgroundColor: "#F0B9A5",
  },
});
