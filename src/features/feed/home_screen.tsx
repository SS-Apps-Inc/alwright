import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { HomePostsHeader } from "./home_posts_header";
import { useHomePostsVM } from "./use_home_posts_vm";
import { HomeSettingsSheet } from "./home_settings_sheet";
import { colors } from "@/design-system";
import { FeedCountryPickerSheet } from "./feed_country_picker_sheet";

export default function HomeScreen() {
  const vm = useHomePostsVM();
  const router = useRouter();
  const params = useLocalSearchParams<{ refreshFeed?: string }>();
  const slide = useRef(new Animated.Value(0)).current;
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);

  useEffect(() => {
    if (!params.refreshFeed) return;
    void vm.refreshPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.refreshFeed]);

  useEffect(() => {
    Animated.spring(slide, {
      toValue: vm.settingsVisible ? 1 : 0,
      useNativeDriver: true,
      tension: 70,
      friction: 12,
    }).start();
  }, [slide, vm.settingsVisible]);

  const exactHeight = vm.insets.top + vm.topPad + vm.contentHeight + vm.bottomPad;
  const drawerWidth = Math.min(380, Math.max(280, vm.containerWidth * 0.72));

  const homeTranslateX = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [0, drawerWidth * 0.36],
  });

  const homeScale = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.96],
  });

  return (
    <View style={styles.root} onLayout={vm.onContainerLayout}>
      <Animated.View
        style={[
          styles.homeLayer,
          {
            transform: [{ translateX: homeTranslateX }, { scale: homeScale }],
          },
        ]}
      >
        <ScrollView
          style={styles.root}
          contentContainerStyle={[
            styles.content,
            {
              height: exactHeight,
              paddingBottom: vm.bottomPad,
            },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={vm.refreshing}
              onRefresh={vm.refreshPosts}
              tintColor={colors.white}
            />
          }
          bounces
          alwaysBounceVertical
        >
          <HomePostsHeader {...vm} />
        </ScrollView>

        {!vm.settingsVisible ? (
          <Pressable onPress={vm.openSettings} style={styles.curveTab} hitSlop={12}>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ) : null}
      </Animated.View>

      <HomeSettingsSheet
        visible={vm.settingsVisible}
        width={drawerWidth}
        showOnlyLastPost={vm.homeSettings.showOnlyLastPost}
        singlePostSource={vm.homeSettings.singlePostSource}
        layoutMode={vm.homeSettings.layoutMode}
        autoApplyLatestPosts={vm.homeSettings.autoApplyLatestPosts}
        showCountryPreference={vm.showCountryPreference}
        feedCountryCodes={vm.selectedCountryCodes}
        onClose={vm.closeSettings}
        onChangeShowOnlyLastPost={vm.setShowOnlyLastPost}
        onChangeSinglePostSource={vm.setSinglePostSource}
        onChangeLayoutMode={vm.setLayoutMode}
        onChangeAutoApplyLatestPosts={vm.setAutoApplyLatestPosts}
        onOpenCountryPicker={() => {
          vm.closeSettings();
          if (!vm.countryFeatureAvailable) {
            router.push("/auth/login");
            return;
          }
          setCountryPickerVisible(true);
        }}
      />

      <FeedCountryPickerSheet
        visible={countryPickerVisible}
        value={vm.selectedCountryCodes}
        onClose={() => setCountryPickerVisible(false)}
        onApply={(countryCodes) => {
          void vm.setFeedCountryCodes(countryCodes);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  homeLayer: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 0,
    overflow: "hidden",
  },
  content: {
    backgroundColor: colors.background,
  },

  // 1/5-ish visible circle tab
  curveTab: {
    position: "absolute",
    left: -58,
    top: "11%",
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.darkFloating,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.subtleBorder,
  },
  chevron: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 26,
  },
});
