import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettingsViewModel } from "./settings.viewmodel";

function RowButton({
  title,
  subtitle,
  onPress,
  danger = false,
  muted = false,
  first = false,
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
  muted?: boolean;
  first?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        first && styles.firstRow,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={styles.rowTextWrap}>
        <Text
          style={[
            styles.rowTitle,
            muted && styles.mutedText,
            danger && styles.dangerText,
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.rowSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

function DeleteAccountSheet({
  visible,
  confirmText,
  deleting,
  canDelete,
  onChangeConfirmText,
  onClose,
  onDelete,
  onExportData,
}: {
  visible: boolean;
  confirmText: string;
  deleting: boolean;
  canDelete: boolean;
  onChangeConfirmText: (value: string) => void;
  onClose: () => void;
  onDelete: () => void;
  onExportData: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalLayer}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
          >
            <View style={styles.sheetHeader}>
              <Pressable
                onPress={onClose}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.closeText}>×</Text>
              </Pressable>
              <Text style={styles.sheetTitle}>Delete account</Text>
              <View style={styles.closeButtonSpacer} />
            </View>

            <Text style={styles.sheetBody}>
              Your account will be signed out now. Your data will be scheduled
              for permanent deletion from the server after 30 days, and you
              cannot return after it is deleted.
            </Text>

            <TextInput
              value={confirmText}
              onChangeText={onChangeConfirmText}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="Type DELETE"
              placeholderTextColor="#71717a"
              style={styles.input}
            />

            <Pressable
              disabled={!canDelete || deleting}
              onPress={onDelete}
              style={({ pressed }) => [
                styles.deleteButton,
                (!canDelete || deleting) && styles.disabledButton,
                pressed && styles.buttonPressed,
              ]}
            >
              {deleting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.deleteButtonText}>Delete</Text>
              )}
            </Pressable>

            <Pressable
              onPress={onExportData}
              style={({ pressed }) => [
                styles.textOnlyButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.textOnlyButtonText}>
                Send my data to my email
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ExportDataSheet({
  visible,
  email,
  touched,
  valid,
  exporting,
  onChangeEmail,
  onTouchEmail,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  email: string;
  touched: boolean;
  valid: boolean;
  exporting: boolean;
  onChangeEmail: (value: string) => void;
  onTouchEmail: (value: boolean) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const showError = touched && !valid;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalLayer}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
          >
            <View style={styles.sheetHeader}>
              <Pressable
                onPress={onClose}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.closeText}>×</Text>
              </Pressable>
              <Text style={styles.sheetTitle}>Send my data</Text>
              <View style={styles.closeButtonSpacer} />
            </View>

            <Text style={styles.sheetBody}>
              Enter the email address where you want to receive your account
              data. We will email your data within 24 hours.
            </Text>

            <TextInput
              value={email}
              onChangeText={onChangeEmail}
              onBlur={() => onTouchEmail(true)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="email@example.com"
              placeholderTextColor="#71717a"
              style={[styles.input, showError && styles.inputError]}
            />

            {showError ? (
              <Text style={styles.errorText}>Enter a valid email address.</Text>
            ) : null}

            <Pressable
              disabled={!valid || exporting}
              onPress={onSubmit}
              style={({ pressed }) => [
                styles.primarySheetButton,
                (!valid || exporting) && styles.disabledButton,
                pressed && styles.buttonPressed,
              ]}
            >
              {exporting ? (
                <ActivityIndicator color="#0b0b0b" />
              ) : (
                <Text style={styles.primarySheetButtonText}>Send</Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function SettingsScreen() {
  const vm = useSettingsViewModel();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + 12,
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* LOGIN / PLAN */}
        {!vm.isLoggedIn ? (
          <View style={styles.card}>
            <Pressable
              onPress={vm.goToLogin}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Login</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.planBox}>
              <Text style={styles.planSmallLabel}>Current plan</Text>

              {vm.loadingPlan ? (
                <ActivityIndicator style={{ marginTop: 8 }} />
              ) : (
                <Text style={styles.planValue}>{vm.planLabel}</Text>
              )}

              {vm.email ? (
                <Text style={styles.userDetail}>{vm.email}</Text>
              ) : null}
            </View>

            {vm.canUpgrade && (
              <Pressable
                onPress={vm.openUpgradePaywall}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                {vm.openingPaywall ? (
                  <ActivityIndicator color="#0b0b0b" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {vm.plan === "starter"
                      ? "Upgrade to Pro"
                      : "Upgrade now"}
                  </Text>
                )}
              </Pressable>
            )}
          </View>
        )}

        {/* USER */}
        {vm.isLoggedIn && (
          <View style={styles.card}>
            <RowButton
              first
              title="My Page"
              subtitle="Stylize your posts & page"
              onPress={vm.openMyPosts}
            />
            <RowButton
              title="View Public Page"
              subtitle={vm.publicProfileUrl ?? ""}
              onPress={vm.openMyPage}
            />
          </View>
        )}

        {/* LEGAL */}
        <View style={styles.card}>
          <RowButton first title="Privacy Policy" onPress={vm.openPrivacy} />
          <RowButton title="Terms of Use" onPress={vm.openTerms} />
          <RowButton title="Contact Us" onPress={vm.openContact} />
        </View>

        {/* SIGN OUT */}
        {
          vm.isLoggedIn && (
            <>
              <View style={styles.card}>
                <RowButton
                  first
                  title="Delete My Account"
                  onPress={vm.openDeleteAccount}
                  muted
                />
                <RowButton title="Sign Out" onPress={vm.handleSignOut} />
              </View>
              <Text style={styles.versionText}>{vm.appVersionLabel}</Text>
            </>
          )
        }

      </ScrollView>

      <DeleteAccountSheet
        visible={vm.deleteAccountVisible}
        confirmText={vm.deleteConfirmText}
        deleting={vm.deletingAccount}
        canDelete={vm.deleteConfirmText === "DELETE"}
        onChangeConfirmText={vm.setDeleteConfirmText}
        onClose={vm.closeDeleteAccount}
        onDelete={vm.handleDeleteMyAccount}
        onExportData={vm.openExportData}
      />

      <ExportDataSheet
        visible={vm.exportDataVisible}
        email={vm.exportEmail}
        touched={vm.exportEmailTouched}
        valid={vm.exportEmailValid}
        exporting={vm.exportingData}
        onChangeEmail={vm.setExportEmail}
        onTouchEmail={vm.setExportEmailTouched}
        onClose={vm.closeExportData}
        onSubmit={vm.handleRequestDataExport}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0b0b0b",
  },

  container: {
    paddingHorizontal: 16,
  },

  card: {
    backgroundColor: "#171717",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 14,
  },

  planBox: {
    paddingBottom: 14,
  },

  planSmallLabel: {
    color: "#a1a1aa",
    fontSize: 13,
    marginBottom: 6,
  },

  planValue: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
  },

  userDetail: {
    color: "#a1a1aa",
    fontSize: 13,
    marginTop: 6,
  },

  primaryButton: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  primaryButtonText: {
    color: "#0b0b0b",
    fontSize: 15,
    fontWeight: "800",
  },

  buttonPressed: {
    opacity: 0.85,
  },

  row: {
    minHeight: 56,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#2a2a2a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },

  firstRow: {
    borderTopWidth: 0,
  },

  rowPressed: {
    opacity: 0.85,
  },

  rowTextWrap: {
    flex: 1,
    paddingRight: 12,
  },

  rowTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  rowSubtitle: {
    color: "#a1a1aa",
    fontSize: 13,
    marginTop: 4,
  },

  chevron: {
    color: "#71717a",
    fontSize: 24,
  },

  dangerText: {
    color: "#f87171",
  },

  mutedText: {
    color: "#a1a1aa",
  },

  versionText: {
    color: "#71717a",
    fontSize: 12,
    fontWeight: "500",
    paddingTop: 0,
    paddingBottom: 18,
    textAlign: "center",
  },

  modalLayer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.54)",
  },

  sheet: {
    minHeight: "50%",
    maxHeight: "88%",
    backgroundColor: "#171717",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },

  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
  },

  sheetHeader: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#232323",
  },

  closeButtonSpacer: {
    width: 38,
  },

  closeText: {
    color: "#ffffff",
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "600",
  },

  sheetTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },

  sheetBody: {
    color: "#d4d4d8",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },

  input: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#3f3f46",
    backgroundColor: "#0f0f0f",
    color: "#ffffff",
    fontSize: 16,
    paddingHorizontal: 14,
    marginBottom: 12,
  },

  inputError: {
    borderColor: "#f87171",
  },

  errorText: {
    color: "#f87171",
    fontSize: 13,
    marginBottom: 12,
  },

  deleteButton: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc2626",
    marginTop: 4,
  },

  deleteButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.45,
  },

  textOnlyButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  textOnlyButtonText: {
    color: "#d4d4d8",
    fontSize: 15,
    fontWeight: "700",
  },

  primarySheetButton: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    marginTop: 4,
  },

  primarySheetButtonText: {
    color: "#0b0b0b",
    fontSize: 15,
    fontWeight: "800",
  },
});
