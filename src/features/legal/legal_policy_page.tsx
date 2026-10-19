import React from "react";
import {
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Link, type Href } from "expo-router";

import { PublicSiteLinks } from "@/features/marketing/public_site_links";
import { SUPPORT_EMAIL, media } from "@/config";

export { SUPPORT_EMAIL } from "@/config";

export function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Text
      accessibilityRole="link"
      onPress={() => void Linking.openURL(href)}
      style={styles.link}
    >
      {children}
    </Text>
  );
}

export function PolicyLink({
  href,
  children,
}: {
  href: Href;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} style={styles.link}>
      {children}
    </Link>
  );
}

export function LegalSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionNumber}>{number}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export function LegalBullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

export function ContactCard({
  label,
  subject,
}: {
  label: string;
  subject: string;
}) {
  const href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;

  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => void Linking.openURL(href)}
      style={({ pressed }) => [
        styles.contactCard,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.contactLabel}>{label}</Text>
      <Text style={styles.contactEmail}>{SUPPORT_EMAIL}</Text>
    </Pressable>
  );
}

export function LegalPolicyPage({
  kicker,
  eyebrow,
  title,
  intro,
  scope,
  effectiveDate,
  footerPrompt,
  emailSubject,
  children,
}: {
  kicker: string;
  eyebrow: string;
  title: string;
  intro: string;
  scope: string;
  effectiveDate: string;
  footerPrompt: string;
  emailSubject: string;
  children: React.ReactNode;
}) {
  const contactHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    emailSubject
  )}`;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.page}>
        <View style={styles.header}>
          <Link href="/" asChild>
            <Pressable
              accessibilityLabel="Go to Alwright home page"
              accessibilityRole="link"
              style={({ pressed }) => [
                styles.headerBrand,
                pressed && styles.pressed,
              ]}
            >
              <Image
                accessibilityLabel="Alwright"
                source={media.appIcon}
                style={styles.logo}
              />
              <View style={styles.brandText}>
                <Text style={styles.brand}>ALWRIGHT</Text>
                <Text style={styles.kicker}>{kicker}</Text>
              </View>
            </Pressable>
          </Link>
          <View style={styles.regionBadge}>
            <Text style={styles.regionBadgeText}>CANADA</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.intro}>{intro}</Text>
          <Text style={styles.scope}>{scope}</Text>
        </View>

        {children}

        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Text style={styles.footerStrong}>SS Apps Inc.</Text>
            <Text style={styles.footerText}>{effectiveDate}</Text>
            <Text style={styles.footerText}>
              {footerPrompt}{" "}
              <ExternalLink href={contactHref}>{SUPPORT_EMAIL}</ExternalLink>
            </Text>
          </View>
          <View style={styles.footerLinks}>
            <PublicSiteLinks />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0B0B0C",
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: Platform.OS === "web" ? 24 : 16,
    paddingTop: Platform.OS === "web" ? 48 : 24,
    paddingBottom: 56,
  },
  page: {
    width: "100%",
    maxWidth: 840,
  },
  header: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#303033",
  },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 13,
  },
  headerBrand: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  brandText: {
    marginLeft: 12,
  },
  brand: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1.6,
  },
  kicker: {
    color: "#8B8B91",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginTop: 3,
  },
  regionBadge: {
    borderWidth: 1,
    borderColor: "#F26A21",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  regionBadgeText: {
    color: "#FF8A4C",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  hero: {
    paddingVertical: 48,
  },
  eyebrow: {
    color: "#F26A21",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.7,
    marginBottom: 14,
  },
  title: {
    maxWidth: 700,
    color: "#FFFFFF",
    fontSize: Platform.OS === "web" ? 50 : 36,
    lineHeight: Platform.OS === "web" ? 56 : 42,
    fontWeight: "900",
    letterSpacing: -1.2,
  },
  intro: {
    maxWidth: 720,
    color: "#D4D4D8",
    fontSize: 18,
    lineHeight: 29,
    marginTop: 22,
  },
  scope: {
    maxWidth: 720,
    color: "#9B9BA1",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 16,
  },
  section: {
    paddingVertical: 30,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#303033",
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  sectionNumber: {
    width: 42,
    color: "#F26A21",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  sectionTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
  },
  sectionBody: {
    paddingLeft: Platform.OS === "web" ? 42 : 0,
    gap: 12,
  },
  body: {
    flex: 1,
    color: "#C9C9CE",
    fontSize: 15,
    lineHeight: 24,
  },
  emphasized: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bullet: {
    width: 24,
    color: "#F26A21",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
  },
  link: {
    color: "#FF8A4C",
    textDecorationLine: "underline",
  },
  contactCard: {
    borderWidth: 1,
    borderColor: "#353539",
    borderRadius: 18,
    backgroundColor: "#171719",
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginVertical: 4,
  },
  contactLabel: {
    color: "#8B8B91",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  contactEmail: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 7,
  },
  pressed: {
    opacity: 0.76,
  },
  footer: {
    paddingTop: 34,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#303033",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 24,
  },
  footerInfo: {
    flexGrow: 1,
    gap: 7,
  },
  footerLinks: {
    flexGrow: 1,
    alignItems: "flex-end",
  },
  footerStrong: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  footerText: {
    color: "#77777E",
    fontSize: 12,
    lineHeight: 19,
  },
});

export const legalStyles = styles;
