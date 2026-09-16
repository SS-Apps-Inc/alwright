import { Redirect } from "expo-router";
import { Platform } from "react-native";

import AddPostScreen from "../add_post/add_post";

export default function TabAdd() {
  if (Platform.OS === "web") {
    return <Redirect href="/feed" />;
  }

  return <AddPostScreen />;
}
