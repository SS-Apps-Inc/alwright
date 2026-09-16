// app/_layout.tsx
import { Stack } from "expo-router";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { initAuthListener } from "./auth/authSessionStore";
import { useEffect } from "react";
import { colors } from "@/design-system";

export default function RootLayout() {
  useEffect(() => {
    void initAuthListener().catch((error) => {
      console.error("Auth initialization failed", error);
    });
  }, []);

  return (
    <SafeAreaProvider>
      {/* This prevents drawing under the Android status bar */}
      <StatusBar
        style="light"
        translucent={false}
        backgroundColor={colors.backgroundLower}
      />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="feed" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="auth"
          options={{
            headerShown: false,
            presentation: Platform.OS === "web" ? "card" : "transparentModal",
            animation: Platform.OS === "web" ? "default" : "slide_from_bottom",
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
