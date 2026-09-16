import React, { useCallback } from "react";
import { Tabs, useRouter } from "expo-router";
import { Image, Platform, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthState } from "../auth/useAuthState";


const ICONS = {
  home: {
    active: require("../../assets/tab-icons/home.active.png"),
    inactive: require("../../assets/tab-icons/home.inactive.png"),
  },
  write: {
    active: require("../../assets/tab-icons/write.active.png"),
    inactive: require("../../assets/tab-icons/write.inactive.png"),
  },
  settings: {
    active: require("../../assets/tab-icons/setting.active.png"),
    inactive: require("../../assets/tab-icons/setting.inactive.png"),
  },
};
function TabIcon({
  name,
  focused,
}: {
  name: keyof typeof ICONS;
  focused: boolean;
}) {
  return (
    <Image
      source={focused ? ICONS[name].active : ICONS[name].inactive}
      resizeMode="contain"
      style={{
        width: 24,
        height: 24,
      }}
    />
  );
}

export default function TabsLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const auth = useAuthState();

  const baseHeight = 60;
  const bottomPad = Math.max(8, insets.bottom);

  const handleAddPress = useCallback(() => {
    if (Platform.OS === "web") {
      router.replace("/(tabs)/home");
      return;
    }

    if (!auth.ready) return;

    if (!auth.user) {
      router.push("/auth/login");
      return;
    }

    router.push("/(tabs)/add");
  }, [auth.ready, auth.user, router]);

  const handleSettingsPress = useCallback(() => {
    if (Platform.OS === "web") {
      router.replace("/(tabs)/home");
      return;
    }

    router.push("/(tabs)/settings");
  }, [router]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF8A00",
        tabBarInactiveTintColor: "#919191",
        tabBarStyle:
          Platform.OS === "web"
            ? ({ display: "none" } as any)
            : {
              height: baseHeight + bottomPad,
              paddingBottom: bottomPad,
              paddingTop: 8,
              backgroundColor: scheme === "dark" ? "#0b0b0b" : "#ffffff",
              borderTopWidth: 0,
              shadowColor: "#121212",
              shadowOpacity: 0.08,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: -2 },
              elevation: 8,
            },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="add"
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleAddPress();
          },
        }}
        options={{
          title: "Write",
          tabBarIcon: ({ focused }) => <TabIcon name="write" focused={focused} />,
          // on web, not even linkable from tab config
          href: Platform.OS === "web" ? null : undefined,
        }}
      />

      <Tabs.Screen
        name="settings"
        listeners={{
          tabPress: (e) => {
            if (Platform.OS === "web") {
              e.preventDefault();
              handleSettingsPress();
            }
          },
        }}
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
          // on web, not even linkable from tab config
          href: Platform.OS === "web" ? null : undefined,
        }}
      />
    </Tabs>
  );
}