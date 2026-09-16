import { Alert, Platform } from "react-native";
import type { PostUI } from "@/network/post/postMappers";

type Args = {
  post: PostUI;
  onConfirm: () => void;
};

export function showDeletePostConfirm({ post, onConfirm }: Args) {
  const message = "This post will be deleted permanently.";

  if (Platform.OS === "web") {
    const ok = window.confirm(message);
    if (ok) onConfirm();
    return;
  }

  Alert.alert("Delete permanently?", message, [
    {
      text: "Cancel",
      style: "cancel",
    },
    {
      text: "Yes, delete",
      style: "destructive",
      onPress: onConfirm,
    },
  ]);
}