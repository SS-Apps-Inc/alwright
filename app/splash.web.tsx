import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, LogoAnimation } from "@/design-system";
import { APP_NAME, APP_TAGLINE, UI_CONSTANTS } from "@/config";

export function SplashIntro({ onFinish }: { onFinish: () => void }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -120,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish(); //  THIS WAS MISSING
      });
    }, 2400);

    return () => clearTimeout(timer);
  }, [onFinish, opacity, scale, translateY]);
  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <View style={styles.center}>
        <LogoAnimation size={UI_CONSTANTS.splashWebLogoSize} />
        <Text style={styles.logoText}>{APP_NAME}</Text>
      </View>

      <Text style={styles.description}>
        {APP_TAGLINE}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.splashBackground,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 140,
    paddingBottom: 40,
    zIndex: 100,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
  },

  logoText: {
    color: colors.logoForeground,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.6,
  },

  description: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
});
