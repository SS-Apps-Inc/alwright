import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

type Maybe<T> = T | null;

function canUseWebStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export const publicMemory = {
  getItem(key: string): Maybe<string> {
    try {
      if (Platform.OS !== "web") return SecureStore.getItem(key);
      if (!canUseWebStorage()) return null;
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem(key: string, value: string): void {
    try {
      if (Platform.OS !== "web") {
        SecureStore.setItem(key, value);
        return;
      }
      if (!canUseWebStorage()) return;
      window.localStorage.setItem(key, value);
    } catch {}
  },

  removeItem(key: string): void {
    try {
      if (Platform.OS !== "web") {
        void SecureStore.deleteItemAsync(key);
        return;
      }
      if (!canUseWebStorage()) return;
      window.localStorage.removeItem(key);
    } catch {}
  },
};

export const privateMemory = {
  async getItem(key: string): Promise<Maybe<string>> {
    try {
      if (Platform.OS === "web") return publicMemory.getItem(key);
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        publicMemory.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        publicMemory.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};
