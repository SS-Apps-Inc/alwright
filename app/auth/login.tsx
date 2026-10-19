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
import { InternationalPhoneField } from "./InternationalPhoneField";
import { TermsLine } from "./TermsLine";
import { colors } from "@/design-system/tokens";
import { PRIVACY_URL, TERMS_URL } from "@/config";

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
    outputRange: [0, 150],
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
            {
              paddingTop: insets.top + 72,
              paddingBottom: vm.step === "phone" ? 24 : Math.max(insets.bottom, 16),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Text style={styles.title}>
            {vm.step === "phone" ? "Continue with phone" : "Verify your number"}
          </Text>

          {vm.step === "phone" ? (
            <>
              <Text style={styles.subtitle}>We’ll text you a 6-digit code.</Text>

              <InternationalPhoneField
                countryCode={vm.countryCode}
                value={vm.formattedLocal}
                onChangeText={vm.setPhoneInput}
                onSelectCountry={vm.selectCountry}
              />

              {vm.phoneError ? (
                <Text style={styles.referralError}>{vm.phoneError}</Text>
              ) : null}

              <Pressable onPress={vm.toggleReferralVisible} style={styles.referralToggle}>
                <Text style={styles.referralToggleText}>
                  Referred by?
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
                {vm.referralVisible ? (
                  <>
                    <Text style={styles.referralHelp}>
                      Enter the phone number of the person who referred you.
                    </Text>

                    <InternationalPhoneField
                      countryCode={vm.referralCountryCode}
                      value={vm.formattedReferralLocal}
                      onChangeText={vm.setReferralPhoneInput}
                      onSelectCountry={vm.selectReferralCountry}
                      allowAutoFill={false}
                      placeholder="Referral phone number"
                    />

                    {vm.referralError ? (
                      <Text style={styles.referralError}>{vm.referralError}</Text>
                    ) : null}
                  </>
                ) : null}
              </Animated.View>

            </>
          ) : (
            <>
              <Text style={styles.subtitle}>
                Enter the 6-digit code we sent to{" "}
                <Text style={styles.phoneNumber}>{vm.e164 ?? ""}</Text>.
              </Text>

              {/* ✅ OTP field (no phone number on the right anymore) */}
              <View style={styles.otpWrap}>
                <TextInput
                  value={vm.otp}
                  onChangeText={(t) => vm.setOtp(t.replace(/[^\d]/g, "").slice(0, 6))}
                  keyboardType="number-pad"
                  placeholder="-  -  -  -  -  -"
                  placeholderTextColor={colors.placeholder}
                  style={[styles.otpInput, !vm.otp && styles.otpPlaceholder]}
                  maxLength={6}
                  autoComplete={Platform.OS === "android" ? "sms-otp" : "one-time-code"}
                  textContentType="oneTimeCode"
                  importantForAutofill="yes"
                  selectionColor={colors.primary}
                  returnKeyType="done"
                  autoFocus
                />
              </View>

              {/* ✅ Resend with 60s countdown */}
              <Pressable
                onPress={vm.resendOtp}
                disabled={!vm.canResend}
                style={styles.resendBtn}
              >
                <Text
                  style={[
                    styles.resendText,
                    !vm.canResend && styles.resendTextDisabled,
                  ]}
                >
                  {vm.canResend ? "Resend code" : `Resend in ${vm.resendLeft}s`}
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          {vm.step === "phone" ? (
            <>
              <Pressable
                onPress={vm.sendOtp}
                disabled={!vm.canSend}
                style={[styles.primaryBtn, !vm.canSend && styles.btnDisabled]}
              >
                <Text style={styles.primaryText}>
                  {vm.loading ? "Sending..." : "Continue"}
                </Text>
              </Pressable>
              <TermsLine privacyUrl={PRIVACY_URL} termsUrl={TERMS_URL} />
            </>
          ) : (
            <>
              <Pressable
                onPress={vm.verifyOtp}
                disabled={!vm.canVerify}
                style={[styles.primaryBtn, !vm.canVerify && styles.btnDisabled]}
              >
                <Text style={styles.primaryText}>
                  {vm.loading ? "Verifying..." : "Verify"}
                </Text>
              </Pressable>
              <Pressable
                onPress={vm.changePhoneNumber}
                disabled={vm.loading}
                style={styles.changePhoneBtn}
              >
                <Text style={styles.changePhoneText}>Change phone number</Text>
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
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
  closeText: { color: colors.text, fontSize: 18, fontWeight: "800" },

  container: {
    flexGrow: 1,
    paddingHorizontal: 18,
    justifyContent: "center",
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    gap: 14,
  },

  title: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 21,
  },
  phoneNumber: {
    color: colors.text,
    fontWeight: "700",
  },

  primaryBtn: {
    marginTop: 6,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: colors.textInverse, fontSize: 16, fontWeight: "800" },
  btnDisabled: { opacity: 0.45 },

  otpWrap: {
    marginTop: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.subtleBorder,
    backgroundColor: colors.fieldBackground,
    paddingHorizontal: 12,
    height: 58,
    justifyContent: "center",
  },
  otpInput: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 8,
    fontWeight: "800",
    textAlign: "center",
    paddingVertical: 0,
  },
  otpPlaceholder: { letterSpacing: 2 },

  resendBtn: { alignSelf: "center", paddingHorizontal: 14, paddingVertical: 8 },
  resendText: { color: colors.textStrongMuted, fontSize: 14, fontWeight: "700" },
  resendTextDisabled: { color: colors.textFaint },

  changePhoneBtn: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  changePhoneText: {
    color: colors.textSubtle,
    fontSize: 16,
    fontWeight: "700",
  },

  referralToggle: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },

  referralToggleText: {
    color: colors.textFaint,
    fontSize: 14,
    fontWeight: "700",
    textDecorationLine: "underline",
  },

  referralAnimated: {
    overflow: "hidden",
  },

  referralHelp: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    paddingVertical: 4,
  },

  referralError: {
    color: colors.error,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
  },
  footer: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 10,
    backgroundColor: colors.background,
  },
});
