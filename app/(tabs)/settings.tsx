import { Redirect } from "expo-router";
import { Platform } from "react-native";

import SettingsScreen from "../setting/settings";

export default function TabSetting() {
  if (Platform.OS === "web") {
    return <Redirect href="/feed" />;
  }

  return <SettingsScreen />;
}
