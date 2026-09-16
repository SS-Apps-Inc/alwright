import { supabase } from "./supabaseClient";

export async function sendPhoneOtp(phoneE164: string) {
  // Sends OTP SMS (and signs up the user if they don’t exist by default)
  const { error } = await supabase.auth.signInWithOtp({
    phone: phoneE164,
    options: {
      // If you want to prevent auto-signup later, set shouldCreateUser: false
      // shouldCreateUser: false,
    },
  });

  if (error) throw error;
}

export async function verifyPhoneOtp(phoneE164: string, code: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone: phoneE164,
    token: code,
    type: "sms",
  });

  if (error) throw error;
  return data.session; // session may be null depending on config, but usually returns session
}

export type ClaimReferralResult = {
  referral_id: string | null;
  user_id: string;
  referrer_user_id: string | null;
  already_claimed: boolean;
};

export async function apiClaimReferral(referrerPhoneE164: string) {
  const { data, error } = await supabase.rpc("claim_referral", {
    p_referrer_phone_e164: referrerPhoneE164,
  });

  if (error) throw error;
  return Array.isArray(data) ? data[0] as ClaimReferralResult | undefined : data as ClaimReferralResult | undefined;
}
