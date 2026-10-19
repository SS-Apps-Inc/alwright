import { Ionicons } from "@expo/vector-icons";
import React from "react";
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
  type CountryCode,
} from "react-native-country-picker-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/design-system/tokens";
import { UI_CONSTANTS } from "@/config";

type Props = {
  excludedCountries: CountryCode[];
  onClose: () => void;
  onSelect: (country: Country) => void;
  visible: boolean;
};

export function CountryPickerSheet({
  excludedCountries,
  onClose,
  onSelect,
  visible,
}: Props) {
  const insets = useSafeAreaInsets();
  const listRef = React.useRef<FlatList<Country>>(null);
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    let active = true;
    getAllCountries(
      FlagType.EMOJI,
      "common",
      undefined,
      undefined,
      undefined,
      excludedCountries,
      undefined,
      true
    ).then((result) => {
      if (active) setCountries(result);
    });
    return () => {
      active = false;
    };
  }, [excludedCountries]);

  React.useEffect(() => {
    if (!visible) setQuery("");
  }, [visible]);

  const filteredCountries = React.useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return countries;
    return countries.filter((country) => {
      const name =
        typeof country.name === "string" ? country.name : country.name.common;
      return (
        name.toLocaleLowerCase().includes(normalized) ||
        country.cca2.toLocaleLowerCase().includes(normalized) ||
        country.callingCode.some((code) => code.includes(normalized.replace("+", "")))
      );
    });
  }, [countries, query]);

  const countryLetters = React.useMemo(
    () =>
      new Set(
        countries.map((country) => {
          const name =
            typeof country.name === "string" ? country.name : country.name.common;
          return name[0]?.toLocaleUpperCase();
        })
      ),
    [countries]
  );

  const jumpToLetter = React.useCallback(
    (letter: string) => {
      const index = countries.findIndex((country) => {
        const name =
          typeof country.name === "string" ? country.name : country.name.common;
        return name.toLocaleUpperCase().startsWith(letter);
      });
      if (index >= 0) {
        listRef.current?.scrollToIndex({ index, animated: false });
      }
    },
    [countries]
  );

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
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close country picker"
            hitSlop={10}
            onPress={onClose}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={19} color={colors.text} />
          </Pressable>
          <TextInput
            autoCorrect={false}
            keyboardAppearance="dark"
            onChangeText={setQuery}
            placeholder="Search country or calling code"
            placeholderTextColor={colors.placeholder}
            returnKeyType="search"
            style={styles.search}
            value={query}
          />
        </View>

        {countries.length === 0 ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : (
          <View style={styles.listArea}>
            <FlatList
              ref={listRef}
              data={filteredCountries}
              getItemLayout={(_, index) => ({
                index,
                length: UI_CONSTANTS.countryListItemHeight,
                offset: UI_CONSTANTS.countryListItemHeight * index,
              })}
              initialNumToRender={18}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(country) => country.cca2}
              onScrollToIndexFailed={({ index }) => {
                listRef.current?.scrollToOffset({
                  animated: false,
                  offset: UI_CONSTANTS.countryListItemHeight * index,
                });
              }}
              persistentScrollbar
              renderItem={({ item }) => {
                const name =
                  typeof item.name === "string" ? item.name : item.name.common;
                return (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => onSelect(item)}
                    style={({ pressed }) => [
                      styles.countryRow,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.countryFlag}>{getEmojiFlag(item.cca2)}</Text>
                    <Text numberOfLines={1} style={styles.countryName}>
                      {name} (+{item.callingCode[0]})
                    </Text>
                  </Pressable>
                );
              }}
              showsVerticalScrollIndicator
            />

            {!query ? (
              <View style={styles.alphabet} pointerEvents="box-none">
                {UI_CONSTANTS.countryIndexLetters.map((letter) => {
                  const enabled = countryLetters.has(letter);
                  return (
                    <Pressable
                      key={letter}
                      disabled={!enabled}
                      hitSlop={3}
                      onPress={() => jumpToLetter(letter)}
                      style={styles.letterButton}
                    >
                      <Text
                        style={[styles.letter, !enabled && styles.letterDisabled]}
                      >
                        {letter}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 18, paddingBottom: 12 },
  closeButton: {
    width: 36,
    height: 42,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  search: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.subtleBorder,
    backgroundColor: colors.fieldBackground,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 14,
  },
  loader: { flex: 1 },
  listArea: { flex: 1 },
  countryRow: {
    height: UI_CONSTANTS.countryListItemHeight,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 18,
    paddingRight: 58,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceBorder,
  },
  pressed: { backgroundColor: colors.surface },
  countryFlag: { fontSize: 24 },
  countryName: { flex: 1, color: colors.text, fontSize: 17 },
  alphabet: {
    position: "absolute",
    top: 8,
    bottom: 8,
    right: 12,
    width: 22,
    justifyContent: "space-between",
    alignItems: "center",
  },
  letterButton: {
    flex: 1,
    width: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  letter: { color: colors.text, fontSize: 11, fontWeight: "700" },
  letterDisabled: { opacity: 0.25 },
});
