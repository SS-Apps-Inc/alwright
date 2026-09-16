import { Link, type Href, useRouter } from "expo-router";
import Head from "expo-router/head";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { PublicSiteLinks } from "@/features/marketing/public_site_links";

const mobileLinks: { label: string; href: Href }[] = [
  { label: "Home", href: "/" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

function Point({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <View style={styles.point}>
      <Text style={styles.pointMark}>↗</Text>
      <View style={styles.pointCopy}>
        <Text style={styles.pointTitle}>{title}</Text>
        <Text style={styles.pointText}>{text}</Text>
      </View>
    </View>
  );
}

function ControlPoint({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <View style={styles.controlPoint}>
      <Text style={styles.controlPointTitle}>{title}</Text>
      <Text style={styles.controlPointText}>{text}</Text>
    </View>
  );
}

function StoreScreenshot({
  source,
  label,
}: {
  source: number;
  label: string;
}) {
  return (
    <View style={styles.deviceFrame}>
      <View style={styles.deviceTop}>
        <View style={styles.camera} />
      </View>
      <Image
        accessibilityLabel={label}
        source={source}
        style={styles.storeScreenshot}
        resizeMode="cover"
      />
    </View>
  );
}

function StoreBadge({
  store,
  label,
}: {
  store: "Google Play" | "App Store";
  label: string;
}) {
  return (
    <Pressable
      accessibilityLabel={`Download on ${store}`}
      disabled
      style={styles.storeBadge}
    >
      <View style={styles.storeIcon}>
        <Text style={styles.storeIconText}>
          {store === "Google Play" ? "▶" : "●"}
        </Text>
      </View>
      <View>
        <Text style={styles.storeSmall}>{label}</Text>
        <Text style={styles.storeName}>{store}</Text>
      </View>
    </Pressable>
  );
}

export default function MarketingHome() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const compact = width < 780;
  const scrollRef = useRef<ScrollView>(null);
  const [downloadY, setDownloadY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToDownload = () => {
    setMenuOpen(false);
    scrollRef.current?.scrollTo({ y: downloadY, animated: true });
  };

  useEffect(() => {
    if (!compact) setMenuOpen(false);
  }, [compact]);

  return (
    <>
      <Head>
        <title>Alwright — Where your thoughts land</title>
        <meta
          name="description"
          content="Keep track of your thoughts, design your page, and share a public link when you choose. No likes, no algorithm, no AI."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Alwright — Where your thoughts land"
        />
        <meta
          property="og:description"
          content="A place to keep your thoughts, design your page, and share a public link when you choose."
        />
        <meta property="og:url" content="https://alwright.cc/" />
        <meta property="og:image" content="https://alwright.cc/og.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Alwright — Where your thoughts land"
        />
        <meta
          name="twitter:description"
          content="A place to keep your thoughts, design your page, and share a public link when you choose."
        />
        <meta name="twitter:image" content="https://alwright.cc/og.png" />
      </Head>

      <ScrollView
        ref={scrollRef}
        style={styles.root}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.page}>
          <View style={[styles.header, compact && styles.headerCompact]}>
            <Link href="/" asChild>
              <Pressable style={styles.brandLink}>
                <Image
                  accessibilityLabel="Alwright"
                  source={require("../../../assets/images/icon.png")}
                  style={styles.logo}
                />
                <View>
                  <Text style={styles.brand}>ALWRIGHT</Text>
                  <Text style={styles.brandTag}>WHERE YOUR THOUGHTS LAND</Text>
                </View>
              </Pressable>
            </Link>
            {compact ? (
              <View style={styles.mobileNavWrap}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={menuOpen ? "Close menu" : "Open menu"}
                  onPress={() => setMenuOpen((prev) => !prev)}
                  style={({ pressed }) => [
                    styles.menuButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.menuIcon}>{menuOpen ? "×" : "☰"}</Text>
                </Pressable>

                {menuOpen ? (
                  <View style={styles.mobileMenu}>
                    {mobileLinks.map((item) => (
                      <Link key={item.label} href={item.href} asChild>
                        <Pressable
                          accessibilityLabel={`Open ${item.label}`}
                          onPress={() => setMenuOpen(false)}
                          style={({ pressed }) => [
                            styles.mobileMenuItem,
                            pressed && styles.pressed,
                          ]}
                        >
                          <Text style={styles.mobileMenuText}>{item.label}</Text>
                        </Pressable>
                      </Link>
                    ))}
                    <Pressable
                      accessibilityLabel="Go to download section"
                      onPress={scrollToDownload}
                      style={({ pressed }) => [
                        styles.mobileMenuItem,
                        styles.mobileMenuDownload,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.mobileMenuText, styles.mobileMenuDownloadText]}>
                        Download
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ) : (
              <PublicSiteLinks onDownloadPress={scrollToDownload} />
            )}
          </View>

          <View style={[styles.hero, compact && styles.stack]}>
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>WHERE YOUR THOUGHTS LAND</Text>
              <Text style={[styles.heroTitle, compact && styles.heroTitleSmall]}>
                Somewhere to put what keeps going in circles.
              </Text>
              <Text style={styles.heroText}>
                Alwright is a place to write anonymously or as yourself, keep a
                running record, and open selected thoughts to others with one
                public link.
              </Text>
              <Text style={styles.noiseFree}>
                No likes. No algorithm. No AI. Just people and their thoughts.
              </Text>
            </View>

            <View style={styles.heroDevice}>
              <StoreScreenshot
                source={require("../../../assets/marketing/launch.png")}
                label="Alwright opening on a phone"
              />
            </View>
          </View>

          <View style={styles.promiseBar}>
            <Text style={styles.promise}>ANONYMOUS OR YOUR NAME</Text>
            <Text style={styles.promiseDot}>•</Text>
            <Text style={styles.promise}>PRIVATE OR PUBLIC</Text>
            <Text style={styles.promiseDot}>•</Text>
            <Text style={styles.promise}>YOUR PAGE, YOUR LAYOUT</Text>
          </View>

          <View style={[styles.feedCallout, compact && styles.feedCalloutCompact]}>
            <View style={styles.feedCalloutCopy}>
              <Text style={styles.sectionEyebrow}>PUBLIC FEED</Text>
              <Text
                style={[
                  styles.feedCalloutTitle,
                  compact && styles.feedCalloutTitleSmall,
                ]}
              >
                See where other thoughts have landed.
              </Text>
              <Text style={styles.feedCalloutText}>
                Browse thoughts people have chosen to make public. The web is
                for viewing the feed and public pages—posting and page
                management happen in the mobile app.
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Open public feed"
              onPress={() => router.push("/feed")}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.buttonText}>Open public feed</Text>
              <Text style={styles.buttonArrow}>→</Text>
            </Pressable>
          </View>

          <View style={[styles.section, compact && styles.stack]}>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionEyebrow}>ONE PUBLIC LINK</Text>
              <Text style={styles.sectionTitle}>
                Share a thought. They can read it anywhere.
              </Text>
              <Text style={styles.sectionText}>
                Your public Alwright link opens in any modern browser. People
                can see the thoughts you choose to share without installing the
                app or creating an account.
              </Text>
              <View style={styles.points}>
                <Point
                  title="Share only what you choose"
                  text="Keep the rest as your own quiet running record."
                />
                <Point
                  title="A page that feels like yours"
                  text="Your posts, visual choices, and preferred page layout travel with the link."
                />
                <Point
                  title="Open on phone, tablet, or computer"
                  text="The same public page works wherever someone receives it."
                />
              </View>
            </View>
            <View style={styles.sectionDevice}>
              <StoreScreenshot
                source={require("../../../assets/marketing/public-link.png")}
                label="An Alwright public page opened in a web browser"
              />
            </View>
          </View>

          <View style={[styles.controlPanel, compact && styles.controlPanelCompact]}>
            <View style={styles.controlIntro}>
              <Text style={styles.controlEyebrow}>PRIVACY &amp; CONNECTION</Text>
              <Text
                style={[
                  styles.controlTitle,
                  compact && styles.controlTitleSmall,
                ]}
              >
                You decide what opens—and what stays yours.
              </Text>
            </View>
            <View style={styles.controlGrid}>
              <ControlPoint
                title="Post anonymously or as yourself"
                text="Choose the identity that fits each thought."
              />
              <ControlPoint
                title="Set who can see you"
                text="Manage visibility and what appears on your public page."
              />
              <ControlPoint
                title="Keep a private thought record"
                text="Use Alwright like a quiet notebook you can return to."
              />
              <ControlPoint
                title="Conversation by request"
                text="When a thought connects, someone can request a conversation—and you decide whether it starts."
              />
            </View>
          </View>

          <View
            style={styles.downloadSection}
            onLayout={(event) => setDownloadY(event.nativeEvent.layout.y)}
          >
            <Text style={styles.finalEyebrow}>GET THE MOBILE APP</Text>
            <Text style={[styles.finalTitle, compact && styles.finalTitleSmall]}>
              Ready to post? Download Alwright.
            </Text>
            <Text style={styles.finalText}>
              Create thoughts, design your page, manage privacy, and respond to
              conversation requests in the app.
            </Text>
            <View style={styles.storeButtons}>
              <StoreBadge store="Google Play" label="GET IT ON" />
              <StoreBadge store="App Store" label="DOWNLOAD ON THE" />
            </View>
          </View>

          <View style={[styles.footer, compact && styles.footerCompact]}>
            <View>
              <Text style={styles.footerBrand}>ALWRIGHT</Text>
              <Text style={styles.footerMeta}>
                Where your thoughts land · Canada
              </Text>
              <Text style={styles.footerMeta}>support@alwright.cc</Text>
            </View>
            <PublicSiteLinks onDownloadPress={scrollToDownload} />
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0B0B0C",
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: Platform.OS === "web" ? 24 : 16,
  },
  page: {
    width: "100%",
    maxWidth: 1160,
  },
  header: {
    minHeight: 92,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#303033",
    position: "relative",
    zIndex: 20,
  },
  headerCompact: {
    minHeight: 82,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  brandLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 13,
  },
  brand: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1.6,
  },
  brandTag: {
    color: "#73737A",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginTop: 3,
  },
  mobileNavWrap: {
    position: "relative",
    alignItems: "flex-end",
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3C3C41",
    backgroundColor: "#151517",
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 24,
  },
  mobileMenu: {
    position: "absolute",
    top: 52,
    right: 0,
    width: 188,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#343438",
    backgroundColor: "#151517",
    paddingHorizontal: 14,
    paddingVertical: 18,
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    zIndex: 50,
  },
  mobileMenuItem: {
    minHeight: 68,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    marginVertical: 10,
  },
  mobileMenuText: {
    color: "#D7D7DC",
    fontSize: 13,
    lineHeight: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  mobileMenuDownload: {
    width: "100%",
    alignSelf: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#F26A21",
  },
  mobileMenuDownloadText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  hero: {
    minHeight: 760,
    flexDirection: "row",
    alignItems: "center",
    gap: 86,
    paddingVertical: 70,
  },
  stack: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 48,
  },
  heroCopy: {
    flex: 1.25,
    alignItems: "flex-start",
  },
  eyebrow: {
    color: "#F26A21",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.8,
    marginBottom: 18,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 62,
    lineHeight: 67,
    fontWeight: "900",
    letterSpacing: -2.3,
  },
  heroTitleSmall: {
    fontSize: 43,
    lineHeight: 48,
    letterSpacing: -1.3,
  },
  heroText: {
    maxWidth: 620,
    color: "#C1C1C7",
    fontSize: 18,
    lineHeight: 29,
    marginTop: 26,
  },
  noiseFree: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "800",
    marginTop: 22,
  },
  button: {
    minHeight: 36,
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderRadius: 999,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#F26A21",
    columnGap: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 16,
    flexShrink: 0,
  },
  buttonArrow: {
    color: "#F26A21",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 16,
    flexShrink: 0,
  },
  pressed: {
    opacity: 0.72,
  },
  heroDevice: {
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
  },
  deviceFrame: {
    width: "100%",
    aspectRatio: 9 / 16,
    overflow: "hidden",
    borderRadius: 34,
    padding: 8,
    paddingTop: 22,
    backgroundColor: "#151517",
    borderWidth: 1,
    borderColor: "#3A3A3E",
    shadowColor: "#000000",
    shadowOpacity: 0.35,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
  },
  deviceTop: {
    position: "absolute",
    top: 8,
    left: 0,
    right: 0,
    zIndex: 2,
    alignItems: "center",
  },
  camera: {
    width: 64,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#050505",
  },
  storeScreenshot: {
    width: "106%",
    height: "106%",
    marginLeft: "-3%",
    marginTop: "-3%",
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
  },
  promiseBar: {
    minHeight: 116,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
    borderWidth: 1,
    borderColor: "#303033",
    borderRadius: 20,
    backgroundColor: "#141416",
    paddingHorizontal: 24,
    paddingVertical: 30,
    marginVertical: 28,
  },
  promise: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.1,
    textAlign: "center",
  },
  promiseDot: {
    color: "#F26A21",
    fontSize: 18,
  },
  feedCallout: {
    minHeight: 350,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 56,
    paddingHorizontal: 54,
    paddingVertical: 48,
    marginVertical: 70,
    borderRadius: 30,
    backgroundColor: "#171719",
    borderWidth: 1,
    borderColor: "#353539",
  },
  feedCalloutCompact: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingHorizontal: 26,
    paddingVertical: 36,
  },
  feedCalloutCopy: {
    flex: 1,
    maxWidth: 720,
  },
  feedCalloutTitle: {
    color: "#FFFFFF",
    fontSize: 43,
    lineHeight: 48,
    fontWeight: "900",
    letterSpacing: -1.3,
  },
  feedCalloutTitleSmall: {
    fontSize: 34,
    lineHeight: 39,
  },
  feedCalloutText: {
    color: "#A7A7AE",
    fontSize: 16,
    lineHeight: 26,
    marginTop: 18,
  },
  section: {
    minHeight: 780,
    flexDirection: "row",
    alignItems: "center",
    gap: 90,
    paddingVertical: 92,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#303033",
  },
  sectionReverse: {
    minHeight: 760,
  },
  sectionCopy: {
    flex: 1.25,
    alignItems: "flex-start",
  },
  sectionDevice: {
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
  },
  sectionEyebrow: {
    color: "#F26A21",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.7,
    marginBottom: 18,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 48,
    lineHeight: 53,
    fontWeight: "900",
    letterSpacing: -1.5,
  },
  sectionText: {
    color: "#ADADB4",
    fontSize: 17,
    lineHeight: 28,
    marginTop: 22,
  },
  points: {
    width: "100%",
    gap: 20,
    marginTop: 34,
  },
  point: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  pointMark: {
    color: "#F26A21",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 25,
  },
  pointCopy: {
    flex: 1,
  },
  pointTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  pointText: {
    color: "#8F8F96",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 4,
  },
  controlPanel: {
    minHeight: 590,
    borderRadius: 34,
    backgroundColor: "#EF6A21",
    padding: 62,
    marginVertical: 92,
  },
  controlPanelCompact: {
    padding: 28,
  },
  controlIntro: {
    maxWidth: 760,
  },
  controlEyebrow: {
    color: "#4A1B07",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.7,
    marginBottom: 18,
  },
  controlTitle: {
    color: "#FFFFFF",
    fontSize: 50,
    lineHeight: 55,
    fontWeight: "900",
    letterSpacing: -1.7,
  },
  controlTitleSmall: {
    fontSize: 38,
    lineHeight: 43,
  },
  controlGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 30,
    marginTop: 54,
  },
  controlPoint: {
    flexGrow: 1,
    flexBasis: 360,
    minHeight: 130,
    borderRadius: 20,
    backgroundColor: "rgba(44,16,4,0.16)",
    padding: 22,
  },
  controlPointTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  controlPointText: {
    color: "#4A1B07",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "600",
    marginTop: 8,
  },
  downloadSection: {
    alignItems: "center",
    paddingVertical: 120,
  },
  finalEyebrow: {
    color: "#F26A21",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.8,
    marginBottom: 18,
  },
  finalTitle: {
    maxWidth: 860,
    color: "#FFFFFF",
    fontSize: 56,
    lineHeight: 61,
    fontWeight: "900",
    letterSpacing: -1.9,
    textAlign: "center",
  },
  finalTitleSmall: {
    fontSize: 39,
    lineHeight: 44,
  },
  finalText: {
    maxWidth: 680,
    color: "#9999A0",
    fontSize: 17,
    lineHeight: 27,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  storeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  storeBadge: {
    minWidth: 190,
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#3B3B40",
    backgroundColor: "#171719",
    paddingHorizontal: 17,
    opacity: 0.72,
  },
  storeIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F26A21",
  },
  storeIconText: {
    color: "#111113",
    fontSize: 12,
    fontWeight: "900",
  },
  storeSmall: {
    color: "#8E8E95",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  storeName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 2,
  },
  footer: {
    minHeight: 150,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#303033",
    gap: 28,
  },
  footerCompact: {
    alignItems: "flex-start",
    flexDirection: "column",
    justifyContent: "center",
    paddingVertical: 34,
  },
  footerBrand: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.6,
  },
  footerMeta: {
    color: "#74747B",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 5,
  },
});
