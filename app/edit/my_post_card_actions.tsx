import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { PostUI } from "@/network/post/postMappers";
import { showDeletePostConfirm } from "./delete_post_confirm";

type Props = {
  post: PostUI;
  onSettings: (post: PostUI) => void;
  onDelete: (post: PostUI) => void;
};

export function MyPostCardActions({ post, onSettings, onDelete }: Props) {
  return (
    <View style={styles.root}>
      <Pressable style={styles.button} onPress={() => onSettings(post)}>
        <Text style={styles.text}>Edit</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.deleteButton]}
        onPress={() =>
          showDeletePostConfirm({
            post,
            onConfirm: () => onDelete(post),
          })
        }
      >
        <Text style={[styles.text, styles.deleteText]}>Delete</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 30,
    flexDirection: "row",
    gap: 8,
  },

  button: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  deleteButton: {
    backgroundColor: "rgba(255,80,80,0.9)",
  },

  text: {
    color: "#111111",
    fontSize: 12,
    fontWeight: "900",
  },

  deleteText: {
    color: "#ffffff",
  },
});