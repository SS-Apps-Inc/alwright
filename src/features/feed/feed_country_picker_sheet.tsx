import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  FlagType,
  getAllCountries,
  getEmojiFlag,
  type Country,
} from "react-native-country-picker-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radii, spacing, typography } from "@/design-system";
import { FEED_COUNTRY_SELECTION_LIMIT } from "@/config";

type Props = {
  visible: boolean;
  value: string[];
  onClose: () => void;
  onApply: (countryCodes: string[]) => void;
};

function getCountryName(country: Country) {
  return typeof country.name === "string"
    ? country.name
    : country.name.common;
}

export function FeedCountryPickerSheet({
  visible,
  value,
  onClose,
  onApply,
}: Props) {
  const insets = useSafeAreaInsets();
  const [countries, setCountries] = useState<Country[]>([]);
  const [selected, setSelected] = useState<string[]>(value);
  const [query, setQuery] = useState("");
  const [limitMessage, setLimitMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getAllCountries(FlagType.EMOJI, "common", undefined, undefined, undefined, [], undefined, true)
      .then((result) => {
        if (active) setCountries(result);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    setSelected(value);
    setQuery("");
    setLimitMessage(null);
  }, [value, visible]);

  const filteredCountries = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return countries;
    return countries.filter((country) => {
      const name = getCountryName(country).toLocaleLowerCase();
      return name.includes(normalized) || country.cca2.toLowerCase().includes(normalized);
    });
  }, [countries, query]);

  const toggleCountry = (code: string) => {
    setLimitMessage(null);
    setSelected((previous) => {
      if (previous.includes(code)) {
        return previous.filter((item) => item !== code);
      }
      if (previous.length >= FEED_COUNTRY_SELECTION_LIMIT) {
        setLimitMessage(
          `You can select up to ${FEED_COUNTRY_SELECTION_LIMIT} countries.`
        );
        return previous;
      }
      return [...previous, code];
    });
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      visible={visible}
    >
      <View
        style={[
          styles.screen,
          { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Close country selection"
            hitSlop={10}
            onPress={onClose}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={20} color={colors.text} />
          </Pressable>
          <View style={styles.headingWrap}>
            <Text style={styles.title}>Choose countries</Text>
            <Text style={styles.subtitle}>
              Select up to {FEED_COUNTRY_SELECTION_LIMIT} countries, or keep
              your feed open to Everywhere.
            </Text>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <TextInput
            autoCorrect={false}
            onChangeText={setQuery}
            placeholder="Search countries"
            placeholderTextColor={colors.placeholder}
            style={styles.search}
            value={query}
          />
        </View>

        {!query ? (
          <Pressable
            onPress={() => {
              setSelected([]);
              setLimitMessage(null);
            }}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <Text style={styles.flag}>🌎</Text>
            <View style={styles.rowText}>
              <Text style={styles.countryName}>Everywhere</Text>
              <Text style={styles.countryHint}>All public posts</Text>
            </View>
            {selected.length === 0 ? (
              <Ionicons name="checkmark-circle" size={23} color={colors.primary} />
            ) : null}
          </Pressable>
        ) : null}

        {countries.length === 0 ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={filteredCountries}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(country) => country.cca2}
            renderItem={({ item }) => {
              const isSelected = selected.includes(item.cca2);
              return (
                <Pressable
                  onPress={() => toggleCountry(item.cca2)}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <Text style={styles.flag}>{getEmojiFlag(item.cca2)}</Text>
                  <Text numberOfLines={1} style={styles.countryName}>
                    {getCountryName(item)}
                  </Text>
                  {isSelected ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={23}
                      color={colors.primary}
                    />
                  ) : null}
                </Pressable>
              );
            }}
          />
        )}

        <View style={styles.footer}>
          <View>
            <Text style={styles.selectionCount}>
              {selected.length === 0
                ? "Everywhere"
                : `${selected.length} of ${FEED_COUNTRY_SELECTION_LIMIT} selected`}
            </Text>
            {limitMessage ? <Text style={styles.limit}>{limitMessage}</Text> : null}
          </View>
          <Pressable
            onPress={() => {
              onApply(selected);
              onClose();
            }}
            style={({ pressed }) => [styles.doneButton, pressed && styles.donePressed]}
          >
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  headingWrap: { flex: 1, paddingTop: 2 },
  title: { color: colors.text, fontSize: 21, fontWeight: typography.weight.black },
  subtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 4 },
  searchWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  search: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.subtleBorder,
    backgroundColor: colors.fieldBackground,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 14,
  },
  row: {
    minHeight: 61,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceBorder,
  },
  rowPressed: { backgroundColor: colors.surface },
  flag: { fontSize: 24 },
  rowText: { flex: 1 },
  countryName: { flex: 1, color: colors.text, fontSize: 16, fontWeight: "700" },
  countryHint: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  loader: { flex: 1 },
  footer: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surfaceBorder,
  },
  selectionCount: { color: colors.textMuted, fontSize: 12, fontWeight: "700" },
  limit: { color: colors.error, fontSize: 11, marginTop: 3 },
  doneButton: {
    minWidth: 104,
    height: 46,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  donePressed: { opacity: 0.75 },
  doneText: { color: colors.white, fontSize: 15, fontWeight: typography.weight.black },
});
