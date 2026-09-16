import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export function CanadaPhoneField({
  value,
  onChangeText,
}: {
  value: string; // formatted local: (xxx) xxx-xxxx
  onChangeText: (t: string) => void; // user types; VM will sanitize digits
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.prefix}>
        <Text style={styles.flag}>🇨🇦</Text>
        <Text style={styles.code}>+1</Text>
      </View>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="(123) 456-7890"
        placeholderTextColor="rgba(255,255,255,0.35)"
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        autoComplete="tel"
        returnKeyType="done"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 12,
    height: 54,
  },
  prefix: { flexDirection: "row", alignItems: "center", gap: 8, paddingRight: 10 },
  flag: { fontSize: 18 },
  code: { color: "#fff", fontWeight: "700" },
  input: { flex: 1, color: "#fff", fontSize: 16 },
});