import { Link, useRouter, type Href } from "expo-router";
import Head from "expo-router/head";
import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Linking,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { PublicSiteLinks } from "@/features/marketing/public_site_links";
import { apiJoinIosWaitlist } from "@/network/marketing/iosWaitlistApi";
import {
  APP_NAME,
  APP_TAGLINE,
  EMAIL_PATTERN,
  GITHUB_REPOSITORY_URL,
  GOOGLE_PLAY_URL,
  WEB_METADATA,
  getMediaUri,
  media,
} from "@/config";

const mobileLinks: { label: string; href: Href }[] = [
  { label: "Home", href: "/" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

const VAN_HERO_URL = getMediaUri(media.marketing.vanHero);
const WRITE_HERO_URL = getMediaUri(media.marketing.writeItDownHero);

function webHeroImage(uri: string) {
  if (Platform.OS !== "web") return null;

  return {
    backgroundImage: `url("${uri}")`,
    backgroundPosition: "right center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  } as any;
}

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

function StoreBadge({
  store,
  label,
  onPress,
}: {
  store: "Google Play" | "App Store";
  label: string;
  onPress?: () => void;
}) {
  const storeUrl = store === "Google Play" ? GOOGLE_PLAY_URL : null;
  const enabled = !!storeUrl || !!onPress;

  return (
    <Pressable
      accessibilityLabel={
        storeUrl ? `Download on ${store}` : "Join the iOS availability waitlist"
      }
      accessibilityRole={storeUrl ? "link" : "button"}
      disabled={!enabled}
      onPress={() => {
        if (storeUrl) {
          void Linking.openURL(storeUrl);
        } else {
          onPress?.();
        }
      }}
      style={({ pressed }) => [
        styles.storeBadge,
        !enabled && styles.storeBadgeDisabled,
        pressed && styles.pressed,
      ]}
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

function isValidEmail(email: string) {
  return EMAIL_PATTERN.test(email) && email.length <= 254;
}

function normalizeWaitlistPhone(phone: string) {
  const trimmed = phone.trim();
  if (!trimmed) return null;
  const parsed = parsePhoneNumberFromString(trimmed);
  return trimmed.startsWith("+") && parsed?.isValid() ? parsed.number : null;
}

function IosWaitlistModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "already"
  >("idle");

  useEffect(() => {
    if (!visible) return;
    setName("");
    setEmail("");
    setPhone("");
    setFormError(null);
    setStatus("idle");
  }, [visible]);

  const submit = async () => {
    const normalizedName = name.trim().replace(/\s+/g, " ");
    const normalizedEmail = email.trim();
    const enteredPhone = phone.trim();
    const normalizedPhone = normalizeWaitlistPhone(enteredPhone);

    if (!normalizedName || normalizedName.length > 100) {
      setFormError("Enter your name.");
      return;
    }

    if (!normalizedEmail && !enteredPhone) {
      setFormError("Enter an email address, a phone number, or both.");
      return;
    }

    if (normalizedEmail && !isValidEmail(normalizedEmail)) {
      setFormError("Enter a valid email address.");
      return;
    }

    if (enteredPhone && !normalizedPhone) {
      setFormError("Enter a valid phone number with its country code.");
      return;
    }

    setFormError(null);
    setStatus("submitting");

    try {
      const result = await apiJoinIosWaitlist({
        name: normalizedName,
        email: normalizedEmail || null,
        phone: normalizedPhone,
      });
      setName(result.name);
      setEmail(result.email ?? "");
      setPhone(result.phone ?? "");
      setStatus(result.alreadyRegistered ? "already" : "success");
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "";
      setFormError(
        message.includes("valid email")
          ? "Enter a valid email address."
          : message.includes("valid phone")
            ? "Enter a valid phone number with its country code."
            : message.includes("name")
              ? "Enter your name."
              : "We couldn’t save your details. Please try again."
      );
      setStatus("idle");
    }
  };

  const complete = status === "success" || status === "already";
  const savedContacts = [email, phone].filter(Boolean).join(" and ");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.waitlistOverlay}>
        <Pressable
          accessibilityLabel="Close iOS waitlist"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View style={styles.waitlistCard}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={10}
            onPress={onClose}
            style={({ pressed }) => [
              styles.waitlistClose,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.waitlistCloseText}>×</Text>
          </Pressable>

          <ScrollView
            contentContainerStyle={styles.waitlistCardContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
          {complete ? (
            <>
              <View style={styles.waitlistSuccessIcon}>
                <Text style={styles.waitlistSuccessIconText}>✓</Text>
              </View>
              <Text style={styles.waitlistEyebrow}>IOS WAITLIST</Text>
              <Text style={styles.waitlistTitle}>
                {status === "already"
                  ? "You’re already on the list."
                  : "You’re on the list."}
              </Text>
              <Text style={styles.waitlistBody}>
                Thanks, {name}. We’ll notify you at {savedContacts} as soon as
                Alwright is available on the App Store.
              </Text>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.waitlistPrimaryButton,
                  styles.waitlistDoneButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.waitlistPrimaryButtonText}>Done</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.waitlistEyebrow}>COMING TO IOS</Text>
              <Text style={styles.waitlistTitle}>We’re working on it.</Text>
              <Text style={styles.waitlistBody}>
                Alwright for iPhone is in progress. Leave your name and an
                email address, phone number, or both, and we’ll notify you as
                soon as it becomes available.
              </Text>

              <Text style={styles.waitlistInputLabel}>Name</Text>
              <TextInput
                autoFocus
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="name"
                textContentType="name"
                returnKeyType="next"
                value={name}
                editable={status !== "submitting"}
                placeholder="Your name"
                placeholderTextColor="#696970"
                onChangeText={(value) => {
                  setName(value);
                  if (formError) setFormError(null);
                }}
                style={styles.waitlistInput}
              />

              <Text style={styles.waitlistInputLabelSpaced}>Email address</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                keyboardType="email-address"
                returnKeyType="send"
                value={email}
                editable={status !== "submitting"}
                placeholder="you@example.com"
                placeholderTextColor="#696970"
                onChangeText={(value) => {
                  setEmail(value);
                  if (formError) setFormError(null);
                }}
                style={styles.waitlistInput}
              />

              <Text style={styles.waitlistInputLabelSpaced}>Phone number</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="tel"
                textContentType="telephoneNumber"
                keyboardType="phone-pad"
                returnKeyType="send"
                value={phone}
                editable={status !== "submitting"}
                placeholder="+1 416 555 0123"
                placeholderTextColor="#696970"
                onChangeText={(value) => {
                  setPhone(value);
                  if (formError) setFormError(null);
                }}
                onSubmitEditing={() => void submit()}
                style={styles.waitlistInput}
              />
              <View style={styles.waitlistMessageRow}>
                <Text style={styles.waitlistError}>{formError ?? " "}</Text>
              </View>

              <View style={styles.waitlistActions}>
                <Pressable
                  disabled={status === "submitting"}
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.waitlistCancelButton,
                    styles.waitlistActionButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.waitlistCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  disabled={status === "submitting"}
                  onPress={() => void submit()}
                  style={({ pressed }) => [
                    styles.waitlistPrimaryButton,
                    styles.waitlistActionButton,
                    status === "submitting" && styles.waitlistButtonDisabled,
                    pressed && styles.pressed,
                  ]}
                >
                  {status === "submitting" ? (
                    <ActivityIndicator color="#111113" />
                  ) : (
                    <Text style={styles.waitlistPrimaryButtonText}>
                      Notify me
                    </Text>
                  )}
                </Pressable>
              </View>
              <Text style={styles.waitlistPrivacy}>
                At least one contact method is required. Only availability
                updates—no marketing or spam.
              </Text>
            </>
          )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function MarketingHome() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const compact = width < 780;
  const heroHeight = Math.max(height, compact ? 680 : 640);
  const scrollRef = useRef<ScrollView>(null);
  const headerProgress = useRef(new Animated.Value(0)).current;
  const headerVisibleRef = useRef(false);
  const [downloadY, setDownloadY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [iosWaitlistVisible, setIosWaitlistVisible] = useState(false);

  const reloadHome = () => {
    setMenuOpen(false);
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.location.reload();
      return;
    }
    router.replace("/");
  };

  const scrollToDownload = () => {
    setMenuOpen(false);
    scrollRef.current?.scrollTo({ y: downloadY, animated: true });
  };

  useEffect(() => {
    if (!compact) setMenuOpen(false);
  }, [compact]);

  useEffect(() => {
    if (!headerVisible) setMenuOpen(false);

    Animated.timing(headerProgress, {
      toValue: headerVisible ? 1 : 0,
      duration: headerVisible ? 320 : 220,
      easing: headerVisible
        ? Easing.out(Easing.cubic)
        : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [headerProgress, headerVisible]);

  const headerTranslateY = headerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-105, 0],
  });

  const handlePageScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;

    if (offsetY > 32 && !headerVisibleRef.current) {
      headerVisibleRef.current = true;
      setHeaderVisible(true);
    } else if (offsetY <= 2 && headerVisibleRef.current) {
      headerVisibleRef.current = false;
      setHeaderVisible(false);
    }
  };

  return (
    <>
      <Head>
        <title>{WEB_METADATA.title}</title>
        <meta
          name="description"
          content={WEB_METADATA.description}
        />
        <link rel="canonical" href={WEB_METADATA.canonicalUrl} />
        <meta name="application-name" content={APP_NAME} />
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={APP_NAME} />
        <meta
          property="og:title"
          content={WEB_METADATA.title}
        />
        <meta property="og:description" content={WEB_METADATA.description} />
        <meta property="og:url" content={WEB_METADATA.canonicalUrl} />
        <meta property="og:image" content={WEB_METADATA.imageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={WEB_METADATA.title}
        />
        <meta
          name="twitter:description"
          content={WEB_METADATA.description}
        />
        <meta name="twitter:image" content={WEB_METADATA.imageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: APP_NAME,
            slogan: APP_TAGLINE,
            url: WEB_METADATA.canonicalUrl,
            description: WEB_METADATA.description,
            applicationCategory: "SocialNetworkingApplication",
            operatingSystem: "Android, Web",
          })}
        </script>
      </Head>

      <Animated.View
        pointerEvents={headerVisible ? "auto" : "none"}
        style={[
          styles.floatingHeader,
          {
            opacity: headerProgress,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <View style={[styles.header, compact && styles.headerCompact]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reload Alwright home page"
            onPress={reloadHome}
            style={({ pressed }) => [
              styles.brandLink,
              pressed && styles.pressed,
            ]}
          >
            <Image
              accessibilityLabel="Alwright"
              source={media.appIcon}
              style={styles.logo}
            />
            <View>
              <Text style={styles.brand}>ALWRIGHT</Text>
              <Text style={styles.brandTag}>CONNECT INTENTIONALLY</Text>
            </View>
          </Pressable>
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
                    <Text
                      style={[
                        styles.mobileMenuText,
                        styles.mobileMenuDownloadText,
                      ]}
                    >
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
      </Animated.View>

      <ScrollView
        ref={scrollRef}
        style={styles.root}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handlePageScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.page}>
          <View
            accessible
            accessibilityLabel="A camper van displaying an Alwright post in the mountains"
            style={[
              styles.hero,
              webHeroImage(VAN_HERO_URL),
              {
                width: Platform.OS === "web" ? ("100vw" as any) : width,
                height: heroHeight,
              },
            ]}
          >
            <View pointerEvents="none" style={styles.heroShade} />

            <View
              style={[
                styles.heroContent,
                compact && styles.heroContentCompact,
              ]}
            >
              <View style={styles.heroCopy}>
                <Text style={styles.eyebrow}>WHERE YOU CONNECT INTENTIONALLY</Text>
                <Text
                  style={[styles.heroTitle, compact && styles.heroTitleSmall]}
                >
                  No Likes.{"\n"}No Algorithm.{"\n"}Connect with like-minded.
                </Text>
                <Text style={styles.heroText}>
                  Share what’s on your mind — anonymously or as yourself.{"\n"}
                  Request to start conversation with like-minded people.
                </Text>
                <Pressable
                  accessibilityLabel="Download the app"
                  onPress={scrollToDownload}
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.buttonText}>Download the app</Text>
                  <Text style={styles.buttonArrow}>→</Text>
                </Pressable>
              </View>
            </View>
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
                Checkout the public feed on the web.
              </Text>
              <Text style={styles.feedCalloutText}>
                Browse people&apos;s contents have chosen to make public. The web is
                for viewing the feed and public posts—posting and page
                management happen in the mobile app.
              </Text>
            </View>
            <View style={styles.feedButtons}>
              <Pressable
                accessibilityLabel="Open public feed"
                onPress={() => router.push("/feed")}
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.buttonText}>Open feed</Text>
                <Text style={styles.buttonArrow}>→</Text>
              </Pressable>

            </View>
          </View>
          <View
            accessible
            accessibilityLabel="A person writing an Alwright post beside a snowy mountain view"
            style={[
              styles.hero,
              webHeroImage(WRITE_HERO_URL),
              {
                width: Platform.OS === "web" ? ("100vw" as any) : width,
                height: heroHeight,
              },
            ]}
          >
            <View pointerEvents="none" style={styles.writeSectionShade} />

            <View
              style={[
                styles.heroContent,
                compact && styles.heroContentCompact,
              ]}
            >
              <View style={styles.writeSectionCopy}>
                <Text style={styles.sectionEyebrow}>ONE PUBLIC LINK</Text>
                <Text style={[styles.sectionTitle, styles.immersiveTextShadow]}>
                  Write it down. They can read it online.
                </Text>
                <Text style={[styles.sectionText, styles.writeSectionText]}>
                  Your public Alwright link opens in any browser. People
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
              Ready to share? Download Alwright.
            </Text>
            <Text style={styles.finalText}>
              Create content, personalize your page, manage privacy, and respond to
              conversation requests in the app.
            </Text>
            <View style={styles.storeButtons}>
              <StoreBadge store="Google Play" label="GET IT ON" />
              <StoreBadge
                store="App Store"
                label="COMING SOON ON THE"
                onPress={() => setIosWaitlistVisible(true)}
              />
            </View>
          </View>

          <View
            style={[
              styles.founderQuote,
              compact && styles.founderQuoteCompact,
            ]}
          >
            <Image
              accessibilityLabel="Quotation mark"
              source={media.marketing.founderQuote}
              style={styles.founderQuoteIcon}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.founderQuoteText,
                compact && styles.founderQuoteTextCompact,
              ]}
            >
              I believe that after AI and the way we can communicate with the
              world, there is no more luck offline. Luck is now distributed
              online, so we emphasize “No likes, no algorithm” — because your
              time is your luck.
            </Text>
            <Text style={styles.founderQuoteAuthor}>— Founder</Text>
          </View>

          <View style={[styles.footer, compact && styles.footerCompact]}>
            <View>
              <Text style={styles.footerBrand}>ALWRIGHT</Text>
              <Text style={styles.footerMeta}>
                Connect Intentionally
              </Text>
              <Text style={styles.footerMeta}>©2026 SS Apps Inc. Canada. All rights reserved.</Text>
              <View style={styles.developerCallout}>
                <Text style={styles.developerQuestion}>
                  Are you a software developer?
                </Text>
                <Pressable
                  accessibilityLabel="Open Alwright GitHub repository"
                  onPress={() =>
                    Linking.openURL(GITHUB_REPOSITORY_URL)
                  }
                  style={({ pressed }) => [
                    styles.developerLink,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.developerLinkText}>
                    github.com/SS-Apps-Inc/alwright
                  </Text>
                </Pressable>
              </View>
            </View>
            <PublicSiteLinks onDownloadPress={scrollToDownload} />
          </View>
        </View>
      </ScrollView>

      <IosWaitlistModal
        visible={iosWaitlistVisible}
        onClose={() => setIosWaitlistVisible(false)}
      />
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
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: "center",
    paddingHorizontal: Platform.OS === "web" ? 24 : 16,
    backgroundColor: "rgba(11,11,12,0.96)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#303033",
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  header: {
    width: "100%",
    maxWidth: 1160,
    minHeight: 92,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
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
    marginTop: 8,
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
    position: "relative",
    alignSelf: "center",
    overflow: "hidden",
    justifyContent: "center",
    backgroundColor: "#111113",
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.42)",
  },
  writeSectionShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  writeSectionCopy: {
    width: "100%",
    maxWidth: 680,
    flexShrink: 0,
    alignItems: "flex-start",
    zIndex: 2,
  },
  writeSectionText: {
    color: "#D3D3D8",
    textShadowColor: "rgba(0,0,0,0.78)",
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 2 },
  },
  immersiveTextShadow: {
    textShadowColor: "rgba(0,0,0,0.62)",
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 4 },
  },
  heroContent: {
    width: "100%",
    maxWidth: 1160,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Platform.OS === "web" ? 24 : 16,
    paddingVertical: 72,
    zIndex: 2,
  },
  heroContentCompact: {
    alignItems: "flex-end",
    paddingVertical: 52,
  },
  heroCopy: {
    width: "100%",
    maxWidth: 730,
    alignItems: "flex-start",
    gap: 20,
  },
  eyebrow: {
    color: "#F26A21",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.8,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 60,
    lineHeight: 67,
    fontWeight: "900",
    letterSpacing: -2.3,
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 4 },
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
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 2 },
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
  feedCallout: {
    minHeight: 350,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 54,
    paddingVertical: 48,
    marginVertical: 70,
    borderRadius: 30,
    gap: 72,
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
  feedButtons: {
    flexDirection: "column",
    flex: 1,
    maxWidth: 220,
    maxHeight: 100,
    gap: 12,

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
    marginBottom: 32,
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
    flexBasis: 300,
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
  },
  storeBadgeDisabled: { opacity: 0.72 },
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
  waitlistOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.68)",
  },
  waitlistCard: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "92%",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#38383D",
    backgroundColor: "#151517",
    paddingHorizontal: 28,
    paddingVertical: 30,
    shadowColor: "#000000",
    shadowOpacity: 0.38,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 16 },
  },
  waitlistCardContent: {
    flexGrow: 1,
  },
  waitlistClose: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222225",
    zIndex: 2,
  },
  waitlistCloseText: {
    color: "#B9B9C0",
    fontSize: 23,
    lineHeight: 25,
    fontWeight: "700",
  },
  waitlistEyebrow: {
    color: "#F26A21",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.7,
    marginBottom: 12,
    paddingRight: 46,
  },
  waitlistTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    letterSpacing: -0.7,
    paddingRight: 38,
  },
  waitlistBody: {
    color: "#AFAFB6",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 13,
    marginBottom: 24,
  },
  waitlistInputLabel: {
    color: "#E4E4E8",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
  },
  waitlistInputLabelSpaced: {
    color: "#E4E4E8",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 8,
  },
  waitlistInput: {
    width: "100%",
    minHeight: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#414147",
    backgroundColor: "#0F0F11",
    color: "#FFFFFF",
    fontSize: 16,
    paddingHorizontal: 15,
    outlineStyle: "none",
  } as any,
  waitlistMessageRow: {
    minHeight: 28,
    justifyContent: "center",
  },
  waitlistError: {
    color: "#FF8A8A",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  waitlistActions: {
    flexDirection: "row",
    gap: 10,
  },
  waitlistActionButton: {
    flex: 1,
  },
  waitlistCancelButton: {
    minHeight: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#3B3B40",
    backgroundColor: "#202023",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  waitlistCancelText: {
    color: "#D0D0D5",
    fontSize: 13,
    fontWeight: "800",
  },
  waitlistPrimaryButton: {
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  waitlistDoneButton: {
    alignSelf: "stretch",
  },
  waitlistPrimaryButtonText: {
    color: "#111113",
    fontSize: 13,
    fontWeight: "900",
  },
  waitlistButtonDisabled: {
    opacity: 0.66,
  },
  waitlistPrivacy: {
    color: "#73737A",
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 14,
  },
  waitlistSuccessIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(242,106,33,0.16)",
    borderWidth: 1,
    borderColor: "rgba(242,106,33,0.5)",
    marginBottom: 18,
  },
  waitlistSuccessIconText: {
    color: "#F26A21",
    fontSize: 22,
    fontWeight: "900",
  },
  founderQuote: {
    alignItems: "flex-start",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#353539",
    backgroundColor: "#141416",
    paddingHorizontal: 44,
    paddingVertical: 46,
    marginBottom: 92,
  },
  founderQuoteCompact: {
    borderRadius: 22,
    paddingHorizontal: 26,
    paddingVertical: 34,
    marginBottom: 58,
  },
  founderQuoteIcon: {
    width: 35,
    height: 35,
    marginBottom: 24,
  },
  founderQuoteText: {
    maxWidth: 940,
    color: "#FFFFFF",
    fontSize: 17,
    lineHeight: 28,
    fontWeight: "400",
    letterSpacing: 0,
  },
  founderQuoteTextCompact: {
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0,
  },
  founderQuoteAuthor: {
    color: "#F26A21",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginTop: 26,
    textTransform: "uppercase",
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
  developerCallout: {
    marginTop: 18,
    gap: 6,
    flexDirection: "row",
  },
  developerQuestion: {
    color: "#B8B8BE",
    fontSize: 11,
    fontWeight: "600",
  },
  developerLink: {
    alignSelf: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#F26A21",
    paddingBottom: 2,
  },
  developerLinkText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
});
