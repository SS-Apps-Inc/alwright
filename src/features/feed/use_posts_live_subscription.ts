// use_posts_live_subscription.ts
import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import { supabase } from "@/network/supabaseClient";
import { mapPostRowToUI, type PostUI } from "@/network/post/postMappers";
import { withPostDefaults } from "./home_posts_defaults";
import {
  apiGetPublicMyPostsPageSettings,
  mapMyPostsPageSettingsRow,
} from "@/network/post/postsApi";

type Args = {
  enabled: boolean;
  onNewPost: (post: PostUI) => void;
};

export function usePostsLiveSubscription({ enabled, onNewPost }: Args) {
  const onNewPostRef = useRef(onNewPost);
  onNewPostRef.current = onNewPost;

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;

    const channel = supabase
      .channel("posts-live-inserts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          if (disposed) return;

          const row = payload.new;
          if (!row) return;

          void (async () => {
            try {
              const mapped = withPostDefaults(mapPostRowToUI(row as any));
              const userId =
                typeof row.user_id === "string" ? row.user_id : mapped.userId;

              if (!userId) {
                onNewPostRef.current(mapped);
                return;
              }

              const settingsRow = await apiGetPublicMyPostsPageSettings(userId);
              const settings = mapMyPostsPageSettingsRow(settingsRow);

              if (disposed) return;

              onNewPostRef.current({
                ...mapped,
                profileIconType: settings.profileIconType,
                profileLinksEnabled: settings.profileLinksEnabled,
                postCopyEnabled: settings.postCopyEnabled,
              });
            } catch (error) {
              try {
                const mapped = withPostDefaults(mapPostRowToUI(row as any));
                onNewPostRef.current(mapped);
              } catch (mapError) {
                console.error("Failed to map live post", mapError);
              }
              console.error("Failed to enrich live post", error);
            }
          })();
        }
      )
      .subscribe((status) => {
        console.log("posts-live-inserts status:", status);
      });

    const appStateSub =
      Platform.OS === "web"
        ? null
        : AppState.addEventListener("change", (state) => {
            if (state === "active") {
              // keep simple; Supabase client will reconnect if needed
            }
          });

    return () => {
      disposed = true;
      appStateSub?.remove();
      supabase.removeChannel(channel);
    };
  }, [enabled]);
}
