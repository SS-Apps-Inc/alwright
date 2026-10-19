import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Linking, Platform } from "react-native";
import { router } from "expo-router";
import Constants from "expo-constants";
import * as Application from "expo-application";

import { getAuthState, signOut, subscribeAuth } from "../auth/authSessionStore";
import {
  apiDeleteMyAccount,
  apiRequestMyAccountDataExport,
} from "@/network/account/accountApi";
import {
  getBillingState,
  getBillingPlanLabel,
  subscribeBillingState,
  syncBillingPlanFromRevenueCat,
  type BillingPlan,
} from "@/features/billing/billing_plan";
import {
  isPaidPaywallResult,
  presentUpgradePaywall,
} from "@/features/paywall/revenuecat_paywall";
import {
  APP_VERSION,
  EMAIL_PATTERN,
  PRIVACY_URL,
  PUBLIC_SITE_URL,
  SUPPORT_EMAIL_URL,
  TERMS_URL,
} from "@/config";

export function useSettingsViewModel() {
  const auth = getAuthState();
  const initialBilling = getBillingState();

  const [userId, setUserId] = useState(auth.user?.id ?? null);
  const [email, setEmail] = useState(auth.user?.email ?? null);

  const [plan, setPlan] = useState<BillingPlan>(initialBilling.plan);
  const [loadingPlan, setLoadingPlan] = useState(initialBilling.loading);
  const [openingPaywall, setOpeningPaywall] = useState(false);
  const [deleteAccountVisible, setDeleteAccountVisible] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [exportDataVisible, setExportDataVisible] = useState(false);
  const [exportEmail, setExportEmail] = useState("");
  const [exportEmailTouched, setExportEmailTouched] = useState(false);
  const [exportingData, setExportingData] = useState(false);

  useEffect(() => {
    return subscribeAuth((s) => {
      setUserId(s.user?.id ?? null);
      setEmail(s.user?.email ?? null);
    });
  }, []);

  const isLoggedIn = !!userId;

  useEffect(() => {
    return subscribeBillingState((state) => {
      setPlan(state.plan);
      setLoadingPlan(state.loading);
    });
  }, []);

  const planLabel = getBillingPlanLabel(plan);

  const canUpgrade = plan !== "pro";

  const openUpgradePaywall = useCallback(async () => {
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }

    try {
      setOpeningPaywall(true);
      const result = await presentUpgradePaywall();

      if (isPaidPaywallResult(result)) {
        await syncBillingPlanFromRevenueCat();
      }
    } finally {
      setOpeningPaywall(false);
    }
  }, [isLoggedIn]);

  const openMyPosts = () => router.push("/my-posts");

  const openMyPage = async () => {
    if (userId) {
      await Linking.openURL(`${PUBLIC_SITE_URL}/${userId}`);
    }
  };

  const goToLogin = useCallback(() => {
    router.push("/auth/login");
  }, []);

  const publicProfileUrl = userId ? `${PUBLIC_SITE_URL}/${userId}` : null;
  const appVersionLabel = useMemo(() => {
    const version =
      Application.nativeApplicationVersion ??
      Constants.expoConfig?.version ??
      APP_VERSION;
    const build =
      Application.nativeBuildVersion ??
      (Platform.OS === "android"
        ? Constants.platform?.android?.versionCode
        : Constants.platform?.ios?.buildNumber);

    return build ? `Version ${version} (${build})` : `Version ${version}`;
  }, []);
  const normalizedExportEmail = exportEmail.trim();
  const exportEmailValid = EMAIL_PATTERN.test(normalizedExportEmail);

  const openDeleteAccount = useCallback(() => {
    setDeleteConfirmText("");
    setDeleteAccountVisible(true);
  }, []);

  const closeDeleteAccount = useCallback(() => {
    if (deletingAccount) return;
    setDeleteAccountVisible(false);
    setDeleteConfirmText("");
  }, [deletingAccount]);

  const openExportData = useCallback(() => {
    setExportEmail(email ?? "");
    setExportEmailTouched(false);
    setDeleteAccountVisible(false);
    setExportDataVisible(true);
  }, [email]);

  const closeExportData = useCallback(() => {
    if (exportingData) return;
    setExportDataVisible(false);
    setExportEmail("");
    setExportEmailTouched(false);
  }, [exportingData]);

  const handleRequestDataExport = useCallback(async () => {
    setExportEmailTouched(true);

    if (!exportEmailValid) return;

    try {
      setExportingData(true);
      await apiRequestMyAccountDataExport(normalizedExportEmail);
      setExportDataVisible(false);
      setExportEmail("");
      setExportEmailTouched(false);
      Alert.alert(
        "Request sent",
        "We will email your data within 24 hours."
      );
    } catch (error) {
      console.error("requestDataExport failed", error);
      Alert.alert("Could not request export", "Please try again.");
    } finally {
      setExportingData(false);
    }
  }, [exportEmailValid, normalizedExportEmail]);

  const handleDeleteMyAccount = useCallback(async () => {
    if (deleteConfirmText !== "DELETE") return;

    try {
      setDeletingAccount(true);
      await apiDeleteMyAccount();

      try {
        await signOut();
      } catch (error) {
        console.error("signOut after account delete failed", error);
      }

      setDeleteAccountVisible(false);
      router.replace("/");
      Alert.alert(
        "Deletion scheduled",
        "Your data is scheduled for permanent deletion after 30 days."
      );
    } catch (error) {
      console.error("deleteMyAccount failed", error);
      Alert.alert("Could not delete account", "Please try again.");
    } finally {
      setDeletingAccount(false);
    }
  }, [deleteConfirmText]);


  return {
    isLoggedIn,
    email,
    loadingPlan,
    openingPaywall,
    plan,
    planLabel,
    canUpgrade,
    openUpgradePaywall,
    openMyPosts,
    openMyPage,
    openPrivacy: () => Linking.openURL(PRIVACY_URL),
    openTerms: () => Linking.openURL(TERMS_URL),
    openContact: () => Linking.openURL(SUPPORT_EMAIL_URL),
    openRateUs: () => { },
    handleSignOut: signOut,
    goToLogin,
    publicProfileUrl,
    appVersionLabel,
    deleteAccountVisible,
    deleteConfirmText,
    deletingAccount,
    exportDataVisible,
    exportEmail,
    exportEmailTouched,
    exportEmailValid,
    exportingData,
    openDeleteAccount,
    closeDeleteAccount,
    setDeleteConfirmText,
    openExportData,
    closeExportData,
    setExportEmail,
    setExportEmailTouched,
    handleRequestDataExport,
    handleDeleteMyAccount,
  };
}
