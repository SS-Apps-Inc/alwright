import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  CountryCodeList,
  getEmojiFlag,
  type Country,
} from "react-native-country-picker-modal";

import { colors } from "@/design-system/tokens";
import { CountryPickerSheet } from "@/features/auth/country_picker_sheet";
import {
  callingCodeFor,
  digitsOnly,
  supportsPhoneCountry,
  type CountryCode,
} from "@/network/phoneFormatHelper";

const UNSUPPORTED_PHONE_COUNTRIES = CountryCodeList.filter(
  (country) => !supportsPhoneCountry(country)
);

export function InternationalPhoneField({
  countryCode,
  value,
  onChangeText,
  onSelectCountry,
  allowAutoFill = true,
  placeholder = "Phone number",
}: {
  countryCode: CountryCode;
  value: string;
  onChangeText: (text: string) => void;
  onSelectCountry: (country: CountryCode) => void;
  allowAutoFill?: boolean;
  placeholder?: string;
}) {
  const [pickerVisible, setPickerVisible] = React.useState(false);
  const chevron = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(chevron, {
      toValue: pickerVisible ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [chevron, pickerVisible]);

  const selectCountry = React.useCallback(
    (country: Country) => {
      onSelectCountry(country.cca2);
      setPickerVisible(false);
    },
    [onSelectCountry]
  );

  const handleChangeText = React.useCallback(
    (text: string) => {
      const previousDigits = digitsOnly(value);
      const nextDigits = digitsOnly(text);

      // Backspacing over formatting characters must still remove a digit.
      if (text.length < value.length && nextDigits === previousDigits) {
        onChangeText(previousDigits.slice(0, -1));
        return;
      }

      onChangeText(text);
    },
    [onChangeText, value]
  );

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Select phone country"
        onPress={() => setPickerVisible(true)}
        style={({ pressed }) => [styles.prefix, pressed && styles.pressed]}
      >
        <View style={styles.countryLine}>
          <Text style={styles.flag}>{getEmojiFlag(countryCode)}</Text>
          <Text style={styles.code}>{callingCodeFor(countryCode)}</Text>
        </View>
        <Animated.View
          style={[
            styles.chevron,
            {
            transform: [
              {
                rotate: chevron.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "180deg"],
                }),
              },
            ],
            },
          ]}
        >
          <Ionicons name="chevron-down" size={13} color={colors.textFaint} />
        </Animated.View>
      </Pressable>

      <View style={styles.divider} />

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        keyboardType={allowAutoFill ? "phone-pad" : "number-pad"}
        textContentType={allowAutoFill ? "telephoneNumber" : "none"}
        autoComplete={allowAutoFill ? "tel-national" : "off"}
        importantForAutofill={allowAutoFill ? "yes" : "no"}
        contextMenuHidden={!allowAutoFill}
        autoCorrect={false}
        selectionColor={colors.primary}
        returnKeyType="done"
      />

      <CountryPickerSheet
        excludedCountries={UNSUPPORTED_PHONE_COUNTRIES}
        visible={pickerVisible}
        onSelect={selectCountry}
        onClose={() => setPickerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.subtleBorder,
    backgroundColor: colors.fieldBackground,
    paddingRight: 12,
    height: 58,
  },
  prefix: {
    minWidth: 82,
    height: "100%",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  countryLine: { flexDirection: "row", alignItems: "center", gap: 6 },
  chevron: { position: "absolute", bottom: 4 },
  pressed: { opacity: 0.65 },
  flag: { fontSize: 15, lineHeight: 20 },
  code: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 30,
    backgroundColor: colors.subtleBorder,
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    color: colors.text,
    fontSize: 17,
    lineHeight: 22,
  },
});
