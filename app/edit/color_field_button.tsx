// color_field_button.tsx
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  value: string | null;
  onPress: () => void;
};

export function ColorFieldButton({ title, value, onPress }: Props) {
  const color = value ?? "#111111";

  return (
    <Pressable style={styles.root} onPress={onPress}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{color}</Text>
      </View>

      <View style={[styles.swatch, { backgroundColor: color }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  value: {
    color: "#AFAFAF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
});