import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";

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
  }, []);
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
        {/* 🔥 YOUR ICON */}
        <View style={styles.logoWrapper}>
          <Image
            source={{ uri: "/assets/images/icon.png" }}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </View>

        <Text style={styles.logoText}>Alwright</Text>
      </View>

      <Text style={styles.description}>
        Express what matters. Simply.
      </Text>
    </Animated.View>
  );
}

const LOGO_SIZE = 110;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0B0B0C",
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

  // 🔥 Wrapper gives border + glow
  logoWrapper: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",

    // subtle glow (web + ios nice effect)
    shadowColor: "#fff",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },

    // android fallback
    elevation: 6,
  },

  logoImage: {
    width: "100%",
    height: "100%",
    borderRadius: LOGO_SIZE / 2,
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.6,
  },

  description: {
    color: "#AFAFAF",
    fontSize: 14,
    fontWeight: "600",
  },
});