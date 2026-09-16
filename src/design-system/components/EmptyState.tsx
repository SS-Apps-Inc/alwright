import { StyleSheet, Text, View } from "react-native";

import { colors, typography } from "../tokens";

type Props = {
  message: string;
  backgroundColor?: string;
};

export function EmptyState({ message, backgroundColor = colors.background }: Props) {
  return (
    <View style={[styles.root, { backgroundColor }]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.text,
    fontSize: 18,
    fontWeight: typography.weight.heavy,
  },
});
