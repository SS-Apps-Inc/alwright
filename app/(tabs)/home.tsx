import { Redirect } from "expo-router";
import { Platform } from "react-native";

import HomeScreen from "@/features/feed/home_screen";

export default function TabHome() {
  if (Platform.OS === "web") {
    return <Redirect href="/feed" />;
  }

  return <HomeScreen />;
}
