import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

import { colors } from "../tokens";

type Props = {
  children?: ReactNode;
  backgroundColor?: string;
  centered?: boolean;
  style?: ViewStyle | ViewStyle[];
};

export function AppScreen({
  children,
  backgroundColor = colors.background,
  centered = false,
  style,
}: Props) {
  return (
    <View
      style={[
        styles.root,
        centered && styles.centered,
        { backgroundColor },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
});
