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
import { SAFETY_URLS, SUPPORT_EMAIL, media } from "@/config";

function ExternalLink({
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

function PolicySection({
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

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

export default function ChildSafetyStandardsScreen() {
  const contactHref =
    `mailto:${SUPPORT_EMAIL}?subject=Alwright%20Child%20Safety%20Concern`;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.page}>
        <View style={styles.header}>
          <Image
            accessibilityLabel="Alwright"
            source={media.appIcon}
            style={styles.logo}
          />
          <View style={styles.brandText}>
            <Text style={styles.brand}>ALWRIGHT</Text>
            <Text style={styles.kicker}>TRUST & SAFETY</Text>
          </View>
          <View style={styles.regionBadge}>
            <Text style={styles.regionBadgeText}>CANADA</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>PUBLISHED SAFETY STANDARDS</Text>
          <Text style={styles.title}>Child safety is non-negotiable.</Text>
          <Text style={styles.intro}>
            Alwright has zero tolerance for child sexual abuse and exploitation
            (CSAE), including child sexual abuse material (CSAM), grooming,
            sextortion, trafficking, or any attempt to sexualize or endanger a
            child.
          </Text>
          <Text style={styles.scope}>
            These standards are publicly available worldwide. Alwright is
            operated by a Canadian company, serves an international audience,
            and follows applicable Canadian requirements.
          </Text>
        </View>

        <PolicySection number="01" title="Prohibited conduct">
          <Text style={styles.body}>
            Users must not create, upload, share, request, promote, store, or
            link to content that sexually exploits or abuses anyone under 18.
            This prohibition applies to real, altered, computer-generated, and
            AI-generated content, as well as attempts to groom, lure, extort, or
            facilitate contact with a child for a sexual purpose.
          </Text>
        </PolicySection>

        <PolicySection number="02" title="Reporting in Alwright">
          <Text style={styles.body}>
            If you encounter content or behaviour that may endanger a child,
            open Settings, select Child Safety Standards, and contact our
            designated safety representative using the email action below.
            Include the public page link and any relevant account or post
            details:
          </Text>
          <Pressable
            accessibilityRole="link"
            onPress={() => void Linking.openURL(contactHref)}
            style={({ pressed }) => [
              styles.contactCard,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.contactLabel}>CHILD SAFETY CONTACT</Text>
            <Text style={styles.contactEmail}>{SUPPORT_EMAIL}</Text>
          </Pressable>
          <Text style={styles.body}>
            Do not email or forward suspected CSAM. Report the location of the
            content and any relevant account or post details instead.
          </Text>
        </PolicySection>

        <PolicySection number="03" title="Review and enforcement">
          <Text style={styles.body}>
            We review child-safety reports as a priority. When we identify a
            violation, we may remove or restrict content, preserve relevant
            records, suspend or terminate accounts, and prevent repeat abuse.
            We may also report apparent offences to appropriate authorities and
            cooperate with lawful investigations.
          </Text>
        </PolicySection>

        <PolicySection number="04" title="Emergency and official reporting">
          <Bullet>
            If a child is in immediate danger, call 9-1-1 or your local police.
          </Bullet>
          <Bullet>
            In Canada, suspected online sexual exploitation of a child can be
            reported to{" "}
            <ExternalLink href={SAFETY_URLS.cybertip}>Cybertip.ca</ExternalLink>,
            Canada&apos;s national tipline.
          </Bullet>
          <Bullet>
            Alwright acts in accordance with applicable Canadian law, including
            the{" "}
            <ExternalLink href={SAFETY_URLS.canadianCriminalCode}>
              Criminal Code provisions concerning child sexual abuse and
              exploitation material
            </ExternalLink>
            .
          </Bullet>
        </PolicySection>

        <PolicySection number="05" title="Our safety practices">
          <Bullet>
            Clear rules prohibiting CSAE, CSAM, grooming, sextortion, and related
            exploitation.
          </Bullet>
          <Bullet>
            A reporting channel for users and a designated child-safety contact.
          </Bullet>
          <Bullet>
            Prompt review, proportionate enforcement, record preservation, and
            escalation to appropriate Canadian authorities where required.
          </Bullet>
          <Bullet>
            Periodic review of these standards as the service, risks, and legal
            requirements change.
          </Bullet>
        </PolicySection>

        <View style={styles.footer}>
          <Text style={styles.footerStrong}>SS Apps Inc.</Text>
          <Text style={styles.footerText}>
            Effective August 4, 2026 · Last updated August 4, 2026
          </Text>
          <Text style={styles.footerText}>
            Questions about these standards?{" "}
            <ExternalLink href={contactHref}>{SUPPORT_EMAIL}</ExternalLink>
          </Text>
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
  brandText: {
    flex: 1,
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
    gap: 7,
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
