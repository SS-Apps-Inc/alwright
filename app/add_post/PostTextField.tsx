import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export function PostTextField({
  label,
  value,
  onChangeText,
  placeholder,
  maxLength,
  counterText,
  multiline,
  inputHeight,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  maxLength: number;
  counterText: string;
  multiline?: boolean;
  inputHeight?: number;
}) {
  return (
    <View style={{ gap: 8 }}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.counter}>{counterText}</Text>
      </View>

      <View style={[styles.wrap, multiline && { height: inputHeight ?? 150 }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={[styles.input, multiline && styles.inputMultiline]}
          maxLength={maxLength}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          autoCorrect
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  label: { color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: "800" },
  counter: { color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: "700" },

  wrap: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 12,
    height: 54,
    justifyContent: "center",
  },
  input: { color: "#fff", fontSize: 16 },
  inputMultiline: { paddingTop: 12, paddingBottom: 12, height: "100%" },
});