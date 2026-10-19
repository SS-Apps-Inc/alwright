import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthState } from "./auth/useAuthState";
import { colors, LogoAnimation } from "@/design-system";
import {
  configureRevenueCatForPlatform,
  syncBillingPlanFromRevenueCat,
} from "@/features/billing/billing_plan";
import { prepareHomePostsForLaunch } from "@/features/feed/prepare_home_posts";

export default function Splash() {
  const router = useRouter();
  const auth = useAuthState();
  const [animationComplete, setAnimationComplete] = useState(false);
  const [startupComplete, setStartupComplete] = useState(false);

  const handleAnimationEnd = useCallback(() => {
    setAnimationComplete(true);
  }, []);

  useEffect(() => {
    if (!auth.ready) return;

    let cancelled = false;

    async function finishStartup() {
      const homePostsPromise = prepareHomePostsForLaunch(
        auth.user && Platform.OS !== "web" ? undefined : []
      );

      try {
        if (
          auth.session &&
          (Platform.OS === "ios" || Platform.OS === "android")
        ) {
          configureRevenueCatForPlatform();
          await syncBillingPlanFromRevenueCat();
        }
      } catch (error) {
        console.log("Splash billing plan sync failed:", error);
      } finally {
        await homePostsPromise;
        if (!cancelled) {
          setStartupComplete(true);
        }
      }
    }

    void finishStartup();

    return () => {
      cancelled = true;
    };
  }, [auth.ready, auth.session, auth.user]);

  useEffect(() => {
    if (animationComplete && startupComplete) {
      router.replace("/(tabs)/home");
    }
  }, [animationComplete, router, startupComplete]);

  return (
    <View style={styles.screen}>
      <StatusBar
        style="dark"
        translucent={false}
        backgroundColor={colors.splashBackground}
      />
      <LogoAnimation size={220} onAnimationEnd={handleAnimationEnd} />
      <ActivityIndicator color={colors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.splashBackground,
  },
  spinner: {
    position: "absolute",
    bottom: 48,
  },
});
