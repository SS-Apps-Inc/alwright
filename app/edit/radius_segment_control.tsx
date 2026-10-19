import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { PostUIRadius } from "@/network/post/postMappers";
import { POST_RADIUS_OPTIONS } from "@/config";

type Props = {
  value: PostUIRadius;
  onChange: (value: PostUIRadius) => void;
};

export function RadiusSegmentControl({ value, onChange }: Props) {
  return (
    <View style={styles.root}>
      {POST_RADIUS_OPTIONS.map((item) => {
        const selected = item === value;

        return (
          <Pressable
            key={item}
            onPress={() => onChange(item)}
            style={[styles.item, selected && styles.itemSelected]}
          >
            <Text style={[styles.text, selected && styles.textSelected]}>
              {item}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E",
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  item: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  itemSelected: {
    backgroundColor: "#FFFFFF",
  },
  text: {
    color: "#AFAFAF",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  textSelected: {
    color: "#111111",
  },
});
