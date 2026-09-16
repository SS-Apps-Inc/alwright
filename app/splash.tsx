import React, { useEffect } from "react";
import { ActivityIndicator, Image, Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuthState } from "./auth/useAuthState";
import { colors } from "@/design-system";
import {
  configureRevenueCatForPlatform,
  syncBillingPlanFromRevenueCat,
} from "@/features/billing/billing_plan";

export default function Splash() {
  const router = useRouter();
  const auth = useAuthState();

  useEffect(() => {
    if (!auth.ready) return;

    let cancelled = false;

    async function finishStartup() {
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
        if (!cancelled) {
          router.replace("/(tabs)/home");
        }
      }
    }

    void finishStartup();

    return () => {
      cancelled = true;
    };
  }, [auth.ready, auth.session, router]);

  return (
    <View style={styles.screen}>
      <Image
        source={require("../assets/images/icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator style={{ marginTop: 18 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.backgroundLower },
  logo: { width: 140, height: 140 },
});
