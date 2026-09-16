// login.tsx
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { usePhoneLoginVM } from "./usePhoneLoginVM";
import { CanadaPhoneField } from "./CanadaPhoneField";
import { TermsLine } from "./TermsLine";

const PRIVACY_URL = "https://alwright.cc/privacy";
const TERMS_URL = "https://alwright.cc/terms";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();


  const vm = usePhoneLoginVM(() => {
    router.back();
  });

  const referralAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(referralAnim, {
      toValue: vm.referralVisible ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [vm.referralVisible, referralAnim]);

  const referralHeight = referralAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 118],
  });

  const referralOpacity = referralAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.screen}>
      {/* ✅ Safe-area top bar so X never goes under status bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      {/* ✅ Keyboard avoiding so content won’t go under keyboard */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Continue with phone</Text>

          {vm.step === "phone" ? (
            <>
              <Text style={styles.subtitle}>We’ll text you a 6-digit code.</Text>

              <CanadaPhoneField value={vm.formattedLocal} onChangeText={vm.setPhoneInput} />

              <Pressable onPress={vm.toggleReferralVisible} style={styles.referralToggle}>
                <Text style={styles.referralToggleText}>
                  Referral code?
                </Text>
              </Pressable>

              <Animated.View
                style={[
                  styles.referralAnimated,
                  {
                    height: referralHeight,
                    opacity: referralOpacity,
                  },
                ]}
              >
                <Text style={styles.referralHelp}>
                  Enter the phone number of the person who referred you.
                </Text>

                <CanadaPhoneField
                  value={vm.formattedReferralLocal}
                  onChangeText={vm.setReferralPhoneInput}
                />

                {vm.referralError ? (
                  <Text style={styles.referralError}>{vm.referralError}</Text>
                ) : null}
              </Animated.View>

              <Pressable
                onPress={vm.sendOtp}
                disabled={!vm.canSend}
                style={[styles.primaryBtn, !vm.canSend && styles.btnDisabled]}
              >
                <Text style={styles.primaryText}>{vm.loading ? "Sending..." : "Continue"}</Text>
              </Pressable>

              <TermsLine privacyUrl={PRIVACY_URL} termsUrl={TERMS_URL} />
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>
                {`Enter the 6-digit code we've sent to ${vm.e164 ?? ""}.`}
              </Text>

              {/* ✅ OTP field (no phone number on the right anymore) */}
              <View style={styles.otpWrap}>
                <TextInput
                  value={vm.otp}
                  onChangeText={(t) => vm.setOtp(t.replace(/[^\d]/g, "").slice(0, 6))}
                  keyboardType="number-pad"
                  placeholder="123456"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  style={styles.otpInput}
                  maxLength={6}
                  returnKeyType="done"
                />
              </View>

              <Pressable
                onPress={vm.verifyOtp}
                disabled={!vm.canVerify}
                style={[styles.primaryBtn, !vm.canVerify && styles.btnDisabled]}
              >
                <Text style={styles.primaryText}>{vm.loading ? "Verifying..." : "Verify"}</Text>
              </Pressable>

              {/* ✅ Change phone under Verify */}
              <Pressable onPress={vm.changePhoneNumber} disabled={vm.loading} style={styles.linkBtn}>
                <Text style={styles.linkText}>Change phone number</Text>
              </Pressable>

              {/* ✅ Resend with 60s countdown */}
              <Pressable
                onPress={vm.resendOtp}
                disabled={!vm.canResend}
                style={[styles.secondaryBtn, !vm.canResend && styles.btnDisabled]}
              >
                <Text style={styles.secondaryText}>
                  {vm.canResend ? "Resend code" : `Resend in ${vm.resendLeft}s`}
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0b0b0b" },

  topBar: {
    height: 86, // base height; real height becomes + safe area via paddingTop
    justifyContent: "flex-end",
  },
  closeBtn: {
    marginLeft: 14,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { color: "#fff", fontSize: 18, fontWeight: "800" },

  container: {
    flexGrow: 1,
    paddingHorizontal: 18,
    justifyContent: "center",
    gap: 12,
  },

  title: { color: "#fff", fontSize: 26, fontWeight: "800" },
  subtitle: { color: "rgba(255,255,255,0.65)", fontSize: 14 },

  primaryBtn: {
    marginTop: 6,
    height: 54,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#0b0b0b", fontSize: 16, fontWeight: "800" },
  btnDisabled: { opacity: 0.45 },

  otpWrap: {
    marginTop: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 12,
    height: 54,
    justifyContent: "center",
  },
  otpInput: {
    color: "#fff",
    fontSize: 18,
    letterSpacing: 6,
    fontWeight: "800",
  },

  linkBtn: { paddingVertical: 10, alignItems: "center" },
  linkText: { color: "rgba(255,255,255,0.9)", fontWeight: "800", textDecorationLine: "underline" },

  secondaryBtn: { marginTop: 4, alignItems: "center", padding: 10 },
  secondaryText: { color: "rgba(255,255,255,0.85)", fontWeight: "700" },

  referralToggle: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },

  referralToggleText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "800",
    textDecorationLine: "underline",
  },

  referralAnimated: {
    overflow: "hidden",
  },

  referralHelp: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    paddingVertical: 4,
  },

  referralError: {
    color: "#ff6b6b",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
    
  },
});