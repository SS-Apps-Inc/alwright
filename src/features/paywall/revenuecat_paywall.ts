import { Alert, Platform } from "react-native";
import {
  ensureRevenueCatUserForCurrentSession,
  syncBillingPlanFromRevenueCat,
} from "@/features/billing/billing_plan";

declare const require: (name: string) => any;

export const REVENUECAT_OFFERING_ID = "alwright.v1";

export type RevenueCatPaywallResult =
  | "cancelled"
  | "error"
  | "not_available"
  | "purchased"
  | "restored";

export function isPaidPaywallResult(result: RevenueCatPaywallResult) {
  return result === "purchased" || result === "restored";
}

let paywallModules:
  | {
      Purchases: any;
      RevenueCatUI: any;
      PAYWALL_RESULT: any;
    }
  | null = null;

function loadPaywallModules() {
  if (Platform.OS !== "ios" && Platform.OS !== "android") return null;
  if (paywallModules) return paywallModules;

  try {
    const purchasesMod = require("react-native-purchases");
    const uiMod = require("react-native-purchases-ui");

    paywallModules = {
      Purchases: purchasesMod.default ?? purchasesMod,
      RevenueCatUI: uiMod.default ?? uiMod,
      PAYWALL_RESULT: uiMod.PAYWALL_RESULT,
    };
    return paywallModules;
  } catch (error) {
    console.error("RevenueCat paywall module load failed", error);
    return null;
  }
}

function mapPaywallResult(result: unknown, paywallResult: any): RevenueCatPaywallResult {
  if (result === paywallResult.PURCHASED) return "purchased";
  if (result === paywallResult.RESTORED) return "restored";
  return "cancelled";
}

export async function presentUpgradePaywall(): Promise<RevenueCatPaywallResult> {
  if (Platform.OS === "web") {
    Alert.alert("Only available in app");
    return "not_available";
  }

  try {
    await ensureRevenueCatUserForCurrentSession();

    const revenueCat = loadPaywallModules();
    if (!revenueCat) {
      Alert.alert("Error opening paywall");
      return "not_available";
    }

    const offerings = await revenueCat.Purchases.getOfferings();
    const offering =
      offerings.all[REVENUECAT_OFFERING_ID] ?? offerings.current ?? null;

    if (!offering) {
      Alert.alert("Error", `Offering ${REVENUECAT_OFFERING_ID} not found`);
      console.log("Available offerings:", Object.keys(offerings.all));
      return "not_available";
    }

    const result = await revenueCat.RevenueCatUI.presentPaywall({ offering });
    const mapped = mapPaywallResult(result, revenueCat.PAYWALL_RESULT);

    if (isPaidPaywallResult(mapped)) {
      await syncBillingPlanFromRevenueCat();
    }

    return mapped;
  } catch (error) {
    console.error("presentUpgradePaywall failed", error);
    Alert.alert("Error opening paywall");
    return "error";
  }
}

export function isPostUpgradeError(error: unknown) {
  const message = getErrorMessage(error);

  return (
    message.includes("You reached your limit of 2 posts every 3 days") ||
    message.includes("Posting is available on Starter and Pro plans") ||
    message.includes("Posting requires Starter or Pro") ||
    message.includes("Daily post limit reached")
  );
}

export function getPostUpgradeMessage(error: unknown) {
  const message = getErrorMessage(error);

  if (message.includes("You reached your limit of 2 posts every 3 days")) {
    return "You reached your limit of 2 posts every 3 days!";
  }

  if (message.includes("Daily post limit reached")) {
    return "You reached today's post limit. Starter can post 6 times per day. Pro can post 31 times per day.";
  }

  return "You reached your limit of 2 posts every 3 days!";
}

function getErrorMessage(error: unknown) {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : String(error ?? "");

  return message;
}

export function showUpgradeAlert(message: string, onPressOk: () => void) {
  Alert.alert(
    "Upgrade required",
    message,
    [{ text: "OK", onPress: onPressOk }]
  );
}
