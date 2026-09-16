import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { privateMemory } from "@/memory";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const hasSupabaseConfig = !!supabaseUrl && !!supabaseAnonKey;

if (!hasSupabaseConfig) {
  console.error(
    "Supabase env is missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY before building."
  );
}

export const supabase = createClient(
  supabaseUrl ?? "https://missing-supabase-url.supabase.co",
  supabaseAnonKey ?? "missing-supabase-anon-key",
  {
  auth: {
    storage: privateMemory,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: Platform.OS === "web",
  },
  }
);
