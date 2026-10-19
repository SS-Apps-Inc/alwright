import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "@/design-system";

export function PostTextField({
  label,
  optionalLabel,
  value,
  onChangeText,
  placeholder,
  maxLength,
  counterText,
  multiline,
  inputHeight,
}: {
  label: string;
  optionalLabel?: string;
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
        <View style={styles.labelRow}>
          {label ? <Text style={styles.label}>{label}</Text> : null}
          {optionalLabel ? (
            <Text style={styles.optionalLabel}>{optionalLabel}</Text>
          ) : null}
        </View>
        <Text style={styles.counter}>{counterText}</Text>
      </View>

      <View style={[styles.wrap, multiline && { height: inputHeight ?? 150 }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
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
  labelRow: { flexDirection: "row", alignItems: "baseline", gap: 5 },
  label: { color: colors.textStrongMuted, fontSize: 14, fontWeight: "800" },
  optionalLabel: { color: colors.placeholder, fontSize: 11, fontWeight: "600" },
  counter: { color: colors.textFaint, fontSize: 12, fontWeight: "700" },

  wrap: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.subtleBorder,
    backgroundColor: colors.fieldBackground,
    paddingHorizontal: 12,
    height: 54,
    justifyContent: "center",
  },
  input: { color: colors.text, fontSize: 16 },
  inputMultiline: { paddingTop: 12, paddingBottom: 12, height: "100%" },
});
