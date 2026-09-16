import { Link, type Href } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const links: { label: string; href: Href }[] = [
  { label: "Home", href: "/" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function PublicSiteLinks({
  onDownloadPress,
}: {
  onDownloadPress?: () => void;
}) {
  return (
    <View accessibilityLabel="Public site navigation" style={styles.links}>
      {links.map((item) => (
        <Link key={item.label} href={item.href} asChild>
          <Pressable
            accessibilityLabel={`Open ${item.label}`}
            style={({ pressed }) => [
              styles.linkButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.linkText}>{item.label}</Text>
          </Pressable>
        </Link>
      ))}
      {onDownloadPress ? (
        <Pressable
          accessibilityLabel="Go to download section"
          onPress={onDownloadPress}
          style={({ pressed }) => [
            styles.linkButton,
            styles.downloadButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.linkText, styles.downloadText]}>Download</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "center",
    columnGap: 30,
    rowGap: 8,
  },
  linkButton: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  downloadButton: {
    borderWidth: 1,
    borderColor: "#F26A21",
    paddingHorizontal: 18,
  },
  linkText: {
    color: "#A7A7AD",
    fontSize: 12,
    fontWeight: "700",
  },
  downloadText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.65,
  },
});
