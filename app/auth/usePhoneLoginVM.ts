import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";

import { sendPhoneOtp, verifyPhoneOtp, apiClaimReferral } from "@/network/phoneAuthService";
import { apiCancelMyAccountDeletion } from "@/network/account/accountApi";
import { syncBillingPlanFromRevenueCat } from "@/features/billing/billing_plan";
import {
  formatCanadaLocal,
  toCanadaE164FromLocalDigits,
} from "@/network/phoneFormatHelper";
import { useCountdown } from "./useCountdown";

type Step = "phone" | "otp";

export function usePhoneLoginVM(onSuccess?: () => void) {
  const [step, setStep] = useState<Step>("phone");
  const [localDigits, setLocalDigits] = useState("");
  const [referralLocalDigits, setReferralLocalDigits] = useState("");
  const [referralVisible, setReferralVisible] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const resend = useCountdown(60);

  const phone = useMemo(
    () => toCanadaE164FromLocalDigits(localDigits),
    [localDigits]
  );

  const referralPhone = useMemo(
    () => toCanadaE164FromLocalDigits(referralLocalDigits),
    [referralLocalDigits]
  );

  const formattedLocal = useMemo(
    () => formatCanadaLocal(phone.local10),
    [phone.local10]
  );

  const formattedReferralLocal = useMemo(
    () => formatCanadaLocal(referralPhone.local10),
    [referralPhone.local10]
  );

  const referralHasValue = referralLocalDigits.trim().length > 0;
  const referralIsComplete = !referralHasValue || !!referralPhone.e164;
  const referralIsSame =
    !!phone.e164 && !!referralPhone.e164 && phone.e164 === referralPhone.e164;

  const referralError = useMemo(() => {
    if (!referralHasValue) return null;
    if (!referralPhone.e164) return "Enter a complete Canadian phone number.";
    if (referralIsSame) return "Referral phone number cannot be your own.";
    return null;
  }, [referralHasValue, referralPhone.e164, referralIsSame]);

  const canSend =
    !!phone.e164 &&
    referralIsComplete &&
    !referralIsSame &&
    !loading;

  const canVerify = otp.trim().length === 6 && !!phone.e164 && !loading;

  const setPhoneInput = useCallback((text: string) => {
    const d = text.replace(/[^\d]/g, "").slice(0, 11);
    setLocalDigits(d);
  }, []);

  const setReferralPhoneInput = useCallback((text: string) => {
    const d = text.replace(/[^\d]/g, "").slice(0, 11);
    setReferralLocalDigits(d);
  }, []);

  const toggleReferralVisible = useCallback(() => {
    setReferralVisible((prev) => !prev);
  }, []);

  const sendOtp = useCallback(async () => {
    if (!phone.e164 || loading) return;

    if (referralError) {
      Alert.alert("Referral number", referralError);
      return;
    }

    setLoading(true);

    try {
      await sendPhoneOtp(phone.e164);
      setStep("otp");
      resend.start();
    } catch (e: any) {
      Alert.alert("Couldn’t send code", e?.message ?? "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [phone.e164, loading, resend, referralError]);

  const verifyOtp = useCallback(async () => {
    if (!phone.e164 || loading) return;

    setLoading(true);

    try {
      const session = await verifyPhoneOtp(phone.e164, otp.trim());
      const uid = session?.user?.id;

      if (!uid) {
        throw new Error("No user id returned");
      }

      try {
        await syncBillingPlanFromRevenueCat();
      } catch (error) {
        console.log("Billing plan sync failed:", error);
      }

      try {
        await apiCancelMyAccountDeletion();
      } catch (error) {
        console.log("Cancel account deletion failed:", error);
      }

      if (referralPhone.e164 && !referralIsSame) {
        try {
          await apiClaimReferral(referralPhone.e164);
        } catch (error: any) {
          console.log("Referral claim failed:", error);
          Alert.alert(
            "Referral was not saved",
            error?.message ?? "Please check the referral phone number."
          );
        }
      }

      onSuccess?.();
    } catch (e: any) {
      Alert.alert("Invalid code", e?.message ?? "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    phone.e164,
    otp,
    loading,
    referralPhone.e164,
    referralIsSame,
    onSuccess,
  ]);

  const resendOtp = useCallback(async () => {
    if (!phone.e164 || loading || resend.left > 0) return;

    setLoading(true);

    try {
      await sendPhoneOtp(phone.e164);
      resend.start();
    } catch (e: any) {
      Alert.alert("Couldn’t resend", e?.message ?? "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [phone.e164, loading, resend]);

  const changePhoneNumber = useCallback(() => {
    setOtp("");
    setStep("phone");
    resend.stop();
  }, [resend]);

  return {
    step,
    loading,

    formattedLocal,
    setPhoneInput,
    canSend,
    sendOtp,

    referralVisible,
    toggleReferralVisible,
    formattedReferralLocal,
    setReferralPhoneInput,
    referralError,

    otp,
    setOtp,
    canVerify,
    verifyOtp,
    resendOtp,
    resendLeft: resend.left,
    canResend: resend.left === 0 && !loading,

    e164: phone.e164,
    changePhoneNumber,
  };
}
