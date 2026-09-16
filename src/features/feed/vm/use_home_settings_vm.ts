// use_home_settings_vm.ts
import { useCallback, useState } from "react";
import {
  readHomeSettingsMemory,
  writeHomeSettingsMemory,
  type HomeSettingsMemory,
} from "@/memory";
import type { PostLayoutMode } from "@/features/posts/post_layout";

export function useHomeSettingsVM() {
  const [settingsVisible, setSettingsVisible] = useState(false);

  const [homeSettings, setHomeSettings] = useState<HomeSettingsMemory>(() =>
    readHomeSettingsMemory()
  );

  const openSettings = useCallback(() => {
    setSettingsVisible(true);
  }, []);

  const closeSettings = useCallback(() => {
    setSettingsVisible(false);
  }, []);

  const updateHomeSettings = useCallback((next: HomeSettingsMemory) => {
    setHomeSettings(next);
    writeHomeSettingsMemory(next);
  }, []);

  const setShowOnlyLastPost = useCallback(
    (value: boolean) => {
      updateHomeSettings({
        ...homeSettings,
        showOnlyLastPost: value,
      });
    },
    [homeSettings, updateHomeSettings]
  );

  const setLayoutMode = useCallback(
    (value: PostLayoutMode) => {
      updateHomeSettings({
        ...homeSettings,
        showOnlyLastPost: false,
        layoutMode: value,
      });
    },
    [homeSettings, updateHomeSettings]
  );

  const setAutoApplyLatestPosts = useCallback(
    (value: boolean) => {
      updateHomeSettings({
        ...homeSettings,
        autoApplyLatestPosts: value,
      });
    },
    [homeSettings, updateHomeSettings]
  );

  return {
    homeSettings,
    settingsVisible,
    openSettings,
    closeSettings,
    setShowOnlyLastPost,
    setAutoApplyLatestPosts,
    setLayoutMode,
  };
}
