import { ActivityIndicator, StyleSheet, View } from "react-native";

import { colors } from "../tokens";

type Props = {
  backgroundColor?: string;
};

export function LoadingState({ backgroundColor = colors.background }: Props) {
  return (
    <View style={[styles.root, { backgroundColor }]}>
      <ActivityIndicator color={colors.white} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
