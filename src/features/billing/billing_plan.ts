import { Platform } from "react-native";
import { apiSyncMyBillingPlan } from "@/network/billing/billingApi";
import { supabase } from "@/network/supabaseClient";

declare const require: (name: string) => any;

export type BillingPlan = "free" | "starter" | "pro";
type BillingState = {
  ready: boolean;
  loading: boolean;
  plan: BillingPlan;
  customerInfo: any | null;
};

let revenueCatConfigured = false;
let revenueCatLoadFailed = false;
let purchasesModule:
  | {
      Purchases: any;
      LOG_LEVEL: any;
    }
  | null = null;
let billingState: BillingState = {
  ready: false,
  loading: false,
  plan: "free",
  customerInfo: null,
};
const billingListeners = new Set<(state: BillingState) => void>();

export const DAILY_POST_LIMITS: Record<BillingPlan, number> = {
  free: 2,
  starter: 6,
  pro: 31,
};

function emitBillingState(next: Partial<BillingState>) {
  billingState = { ...billingState, ...next };
  for (const listener of billingListeners) {
    listener(billingState);
  }
}

export function getBillingState() {
  return billingState;
}

export function subscribeBillingState(listener: (state: BillingState) => void) {
  billingListeners.add(listener);
  listener(billingState);

  return () => {
    billingListeners.delete(listener);
  };
}

function loadPurchasesModule() {
  if (Platform.OS !== "ios" && Platform.OS !== "android") return null;
  if (purchasesModule) return purchasesModule;
  if (revenueCatLoadFailed) return null;

  try {
    const mod = require("react-native-purchases");
    purchasesModule = {
      Purchases: mod.default ?? mod,
      LOG_LEVEL: mod.LOG_LEVEL,
    };
    return purchasesModule;
  } catch (error) {
    revenueCatLoadFailed = true;
    console.error("RevenueCat native module load failed", error);
    emitBillingState({ ready: true, loading: false, plan: "free" });
    return null;
  }
}

export function configureRevenueCatForPlatform() {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    emitBillingState({ ready: true, loading: false, plan: "free" });
    return false;
  }

  if (revenueCatConfigured) return true;

  const revenueCat = loadPurchasesModule();
  if (!revenueCat) return false;

  const iosApiKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
  const androidApiKey =
    process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ??
    process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
  const apiKey = Platform.OS === "ios" ? iosApiKey : androidApiKey;

  if (!apiKey) {
    console.error(`RevenueCat API key is missing for ${Platform.OS}`);
    emitBillingState({ ready: true, loading: false, plan: "free" });
    return false;
  }

  try {
    revenueCat.Purchases.setLogLevel(revenueCat.LOG_LEVEL.VERBOSE);
    revenueCat.Purchases.configure({ apiKey });
    revenueCatConfigured = true;
    return true;
  } catch (error) {
    console.error("RevenueCat configuration failed", error);
    emitBillingState({ ready: true, loading: false, plan: "free" });
    return false;
  }
}

function normalizePlanToken(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
}

function tokenHasPlan(value: unknown, plan: "starter" | "pro") {
  const normalized = normalizePlanToken(value);
  return (
    normalized === plan ||
    normalized.startsWith(`${plan}_`) ||
    normalized.endsWith(`_${plan}`) ||
    normalized.includes(`_${plan}_`)
  );
}

function getRevenueCatIdentifiers(info: any | null) {
  const activeEntitlements = info?.entitlements?.active ?? {};
  const activeSubscriptions = Array.isArray(info?.activeSubscriptions)
    ? info.activeSubscriptions
    : [];

  return [
    ...Object.keys(activeEntitlements),
    ...Object.values(activeEntitlements).map((entitlement: any) => entitlement?.identifier),
    ...activeSubscriptions,
  ];
}

function hasAnyActiveRevenueCatPurchase(info: any | null) {
  const activeEntitlements = info?.entitlements?.active ?? {};
  const activeSubscriptions = Array.isArray(info?.activeSubscriptions)
    ? info.activeSubscriptions
    : [];

  return (
    Object.keys(activeEntitlements).length > 0 ||
    activeSubscriptions.length > 0
  );
}

function getActiveEntitlementIdentifiers(info: any | null) {
  const activeEntitlements = info?.entitlements?.active ?? {};

  return Object.entries(activeEntitlements)
    .map(([key, entitlement]: [string, any]) => entitlement?.identifier ?? key)
    .filter((value) => typeof value === "string" && value.trim().length > 0);
}

function getActiveProductIds(info: any | null) {
  return Array.isArray(info?.activeSubscriptions)
    ? info.activeSubscriptions.filter((value: unknown) => typeof value === "string")
    : [];
}

export function deriveBillingPlan(info: any | null): BillingPlan {
  const identifiers = getRevenueCatIdentifiers(info);

  if (identifiers.some((identifier) => tokenHasPlan(identifier, "pro"))) {
    return "pro";
  }

  if (identifiers.some((identifier) => tokenHasPlan(identifier, "starter"))) {
    return "starter";
  }

  if (hasAnyActiveRevenueCatPurchase(info)) {
    return "starter";
  }

  return "free";
}

export function getBillingPlanLabel(plan: BillingPlan) {
  if (plan === "pro") return "Pro";
  if (plan === "starter") return "Starter";
  return "Free";
}

export function canUsePaidPostFeatures(plan: BillingPlan) {
  return plan === "starter" || plan === "pro";
}

export function getDailyPostLimit(plan: BillingPlan) {
  return DAILY_POST_LIMITS[plan];
}

export async function getCurrentRevenueCatBillingPlan() {
  if (Platform.OS === "web") return "free" as BillingPlan;

  await ensureRevenueCatUserForCurrentSession();
  const purchases = loadPurchasesModule()?.Purchases;
  if (!purchases) return "free" as BillingPlan;

  const info = await purchases.getCustomerInfo();
  return deriveBillingPlan(info);
}

export async function ensureRevenueCatUserForCurrentSession() {
  if (Platform.OS === "web") return null;
  if (!configureRevenueCatForPlatform()) return null;

  const purchases = loadPurchasesModule()?.Purchases;
  if (!purchases) return null;

  const { data } = await supabase.auth.getUser();
  const uid = data.user?.id ?? null;
  if (!uid) return null;

  const currentAppUserId = await purchases.getAppUserID().catch(() => null);
  if (currentAppUserId === uid) return uid;

  await purchases.logIn(uid);
  return uid;
}

export async function syncBillingPlanFromRevenueCatInfo(info: any | null) {
  await ensureRevenueCatUserForCurrentSession();

  const plan = deriveBillingPlan(info);
  const activeEntitlements = getActiveEntitlementIdentifiers(info);
  const activeProductIds = getActiveProductIds(info);
  const revenuecatAppUserId =
    Platform.OS === "web"
      ? null
      : await loadPurchasesModule()?.Purchases.getAppUserID().catch(() => null);

  await apiSyncMyBillingPlan({
    plan,
    revenuecatAppUserId,
    revenuecatOriginalAppUserId: info?.originalAppUserId ?? null,
    revenuecatEntitlement: activeEntitlements[0] ?? null,
    revenuecatActiveProductIds: activeProductIds,
    revenuecatCustomerInfo: info ?? null,
  });

  emitBillingState({
    ready: true,
    loading: false,
    plan,
    customerInfo: info ?? null,
  });

  return plan;
}

export async function syncBillingPlanFromRevenueCat() {
  emitBillingState({ loading: true });

  if (Platform.OS === "web") {
    const { data } = await supabase.auth.getUser();

    if (data.user) {
      await apiSyncMyBillingPlan({
        plan: "free",
        revenuecatAppUserId: null,
        revenuecatOriginalAppUserId: null,
        revenuecatEntitlement: null,
        revenuecatActiveProductIds: [],
        revenuecatCustomerInfo: null,
      });
    }

    emitBillingState({
      ready: true,
      loading: false,
      plan: "free",
      customerInfo: null,
    });

    return "free" as BillingPlan;
  }

  try {
    const configured = configureRevenueCatForPlatform();
    if (!configured) return "free" as BillingPlan;

    await ensureRevenueCatUserForCurrentSession();
    const purchases = loadPurchasesModule()?.Purchases;
    if (!purchases) return "free" as BillingPlan;

    const info = await purchases.getCustomerInfo();
    return await syncBillingPlanFromRevenueCatInfo(info);
  } catch (error) {
    emitBillingState({ ready: true, loading: false });
    throw error;
  }
}
