import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { apiAddPost } from "@/network/post/postsApi";
import { POST_INPUT_LIMITS } from "@/config";
import { syncBillingPlanFromRevenueCat } from "@/features/billing/billing_plan";
import {
  getPostUpgradeMessage,
  isPaidPaywallResult,
  isPostUpgradeError,
  presentUpgradePaywall,
  showUpgradeAlert,
} from "@/features/paywall/revenuecat_paywall";

export function useAddPostVM(opts: { onSuccess?: () => void } = {}) {
  const [description, setDescription] = useState("");
  const [who, setWho] = useState("");
  const [loading, setLoading] = useState(false);

  const descCount = description.length;
  const whoCount = who.length;

  const canSubmit = useMemo(() => {
    if (loading) return false;
    const d = description.trim();
    const w = who.trim();
    if (!d) return false;
    if (d.length > POST_INPUT_LIMITS.description) return false;
    if (w.length > POST_INPUT_LIMITS.who) return false;
    return true;
  }, [description, who, loading]);

  const setDescriptionSafe = useCallback((t: string) => {
    setDescription(t.slice(0, POST_INPUT_LIMITS.description));
  }, []);

  const setWhoSafe = useCallback((t: string) => {
    setWho(t.slice(0, POST_INPUT_LIMITS.who));
  }, []);

  const submit = useCallback(async () => {
    if (!canSubmit) return;

    setLoading(true);
    try {
      await syncBillingPlanFromRevenueCat();

      await apiAddPost({
        description: description.trim(),
        who: who.trim(),
      });

      // reset
      setDescription("");
      setWho("");

      opts.onSuccess?.();
    } catch (e: any) {
      if (isPostUpgradeError(e)) {
        showUpgradeAlert(getPostUpgradeMessage(e), () => {
          void presentUpgradePaywall().then(async (result) => {
            if (isPaidPaywallResult(result)) {
              try {
                await syncBillingPlanFromRevenueCat();
              } catch (error) {
                console.log("Billing plan sync after paywall failed:", error);
              }
            }
          });
        });
        return;
      }

      Alert.alert(
        "Couldn’t post",
        e?.message ?? "Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [canSubmit, description, who, opts]);

  return {
    description,
    who,
    loading,

    descCount,
    whoCount,

    setDescriptionSafe,
    setWhoSafe,

    canSubmit,
    submit,

    LIMITS: POST_INPUT_LIMITS,
  };
}
