import {
  AsYouType,
  getCountryCallingCode,
  isSupportedCountry,
  parsePhoneNumberFromString,
  type CountryCode as PhoneCountryCode,
} from "libphonenumber-js/max";
import {
  isCountryCode,
  type CountryCode,
} from "react-native-country-picker-modal";

export type { CountryCode };

export function digitsOnly(input: string) {
  return input.replace(/[^\d]/g, "");
}

export function formatNationalPhone(input: string, country: CountryCode) {
  const digits = digitsOnly(input).slice(0, 15);
  if (!isSupportedCountry(country)) return digits;
  return new AsYouType(country as PhoneCountryCode).input(digits);
}

export function parseNationalPhone(input: string, country: CountryCode) {
  const digits = digitsOnly(input).slice(0, 15);
  const parsed =
    digits && isSupportedCountry(country)
      ? parsePhoneNumberFromString(digits, country as PhoneCountryCode)
      : undefined;

  return {
    digits,
    formatted: formatNationalPhone(digits, country),
    e164: parsed?.isValid() ? parsed.number : null,
    isPossible: parsed?.isPossible() ?? false,
  };
}

export function normalizePhoneInput(input: string, country: CountryCode) {
  if (input.trim().startsWith("+")) {
    const parsed = parsePhoneNumberFromString(input);
    if (parsed?.country && isCountryCode(parsed.country)) {
      return {
        country: parsed.country,
        digits: parsed.nationalNumber.slice(0, 15),
      };
    }
  }

  return {
    country,
    digits: digitsOnly(input).slice(0, 15),
  };
}

export function callingCodeFor(country: CountryCode) {
  return isSupportedCountry(country)
    ? `+${getCountryCallingCode(country as PhoneCountryCode)}`
    : "";
}

export function countryCodeFromPhone(input: string | null | undefined) {
  if (!input) return null;
  const parsed = parsePhoneNumberFromString(input);
  return parsed?.country && isCountryCode(parsed.country)
    ? parsed.country
    : null;
}

export function supportsPhoneCountry(country: CountryCode) {
  return isSupportedCountry(country);
}

export function supportedCountryOrFallback(
  regionCode: string | null | undefined,
  fallback: CountryCode = "CA"
) {
  const normalized = regionCode?.toUpperCase() ?? "";
  return isCountryCode(normalized) && supportsPhoneCountry(normalized)
    ? normalized
    : fallback;
}
