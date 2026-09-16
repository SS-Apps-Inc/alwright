import React from "react";
import { Redirect, useRouter } from "expo-router";

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAddPostVM } from "./useAddPostVM";
import { PostTextField } from "./PostTextField";

export default function AddPostScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const vm = useAddPostVM({
    onSuccess: () => {
      router.replace({
        pathname: "/(tabs)/home",
        params: { refreshFeed: String(Date.now()) },
      });
    },
  });

  if (Platform.OS === "web") {
    return <Redirect href="/feed" />;
  }

  return (
    <View style={styles.screen}>
      {/* Safe-area top bar so X never goes under status bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      {/* Keyboard avoiding so content won’t go under keyboard */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Write a post</Text>

          <PostTextField
            label="Description"
            value={vm.description}
            onChangeText={vm.setDescriptionSafe}
            placeholder="Write beyond the thoughts..."
            maxLength={vm.LIMITS.description}
            counterText={`${vm.descCount}/${vm.LIMITS.description}`}
            multiline
            inputHeight={170}
          />

          <PostTextField
            label="Who says?"
            value={vm.who}
            onChangeText={vm.setWhoSafe}
            placeholder="e.g. Nikola Tesla"
            maxLength={vm.LIMITS.who}
            counterText={`${vm.whoCount}/${vm.LIMITS.who}`}
          />

          <Pressable
            onPress={vm.submit}
            disabled={!vm.canSubmit}
            style={[styles.primaryBtn, !vm.canSubmit && styles.btnDisabled]}
          >
            <Text style={styles.primaryText}>
              {vm.loading ? "Posting..." : "Post"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0b0b0b" },

  topBar: {
    height: 86,
    justifyContent: "flex-end",
  },
  closeBtn: {
    marginLeft: 14,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { color: "#fff", fontSize: 18, fontWeight: "800" },

container: {
  flexGrow: 1,
  paddingHorizontal: 24,
  paddingTop: 16,   // small spacing under the X bar
  gap: 14,
},

  title: { color: "#fff", fontSize: 26, fontWeight: "800", marginBottom: 16 },
  subtitle: { color: "rgba(255,255,255,0.65)", fontSize: 14, marginBottom: 6 },

  primaryBtn: {
    marginTop: 32,
    height: 54,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#0b0b0b", fontSize: 16, fontWeight: "800" },
  btnDisabled: { opacity: 0.45 },

  helper: { color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 16, marginTop: 6 },
});
