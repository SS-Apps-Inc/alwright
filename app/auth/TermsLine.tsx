import React from "react";
import { Linking, StyleSheet, Text } from "react-native";

export function TermsLine({
  privacyUrl,
  termsUrl,
}: {
  privacyUrl: string;
  termsUrl: string;
}) {
  return (
    <Text style={styles.text}>
      By continuing, you accept Alwright&apos;s{" "}
      <Text style={styles.link} onPress={() => Linking.openURL(privacyUrl)}>
        Privacy Policy
      </Text>{" "}
      and{" "}
      <Text style={styles.link} onPress={() => Linking.openURL(termsUrl)}>
        Terms of Use
      </Text>
      .
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { marginTop: 10, color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: 16 },
  link: { color: "#fff", fontWeight: "700", textDecorationLine: "underline" },
});
