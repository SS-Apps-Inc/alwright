import { supabase } from "../supabaseClient";
import type { BillingPlan } from "@/features/billing/billing_plan";

export type BillingSyncInput = {
  plan: BillingPlan;
  revenuecatAppUserId?: string | null;
  revenuecatOriginalAppUserId?: string | null;
  revenuecatEntitlement?: string | null;
  revenuecatActiveProductIds?: string[];
  revenuecatCustomerInfo?: unknown;
};

export async function apiSyncMyBillingPlan(input: BillingPlan | BillingSyncInput) {
  const payload =
    typeof input === "string"
      ? { plan: input }
      : input;

  const { data, error } = await supabase
    .rpc("sync_my_billing_plan", {
      p_plan: payload.plan,
      p_revenuecat_app_user_id: payload.revenuecatAppUserId ?? null,
      p_revenuecat_original_app_user_id: payload.revenuecatOriginalAppUserId ?? null,
      p_revenuecat_entitlement: payload.revenuecatEntitlement ?? null,
      p_revenuecat_active_product_ids: payload.revenuecatActiveProductIds ?? [],
      p_revenuecat_customer_info: payload.revenuecatCustomerInfo ?? null,
    })
    .single();

  if (error) throw error;
  return data as { billing_plan: BillingPlan };
}
