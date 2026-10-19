import { supabase } from "../supabaseClient";
import { countryCodeFromPhone } from "../phoneFormatHelper";

export type ProfileRow = {
  id: string;
  phone_country_code: string | null;
  phone_country_flag: string | null;
  feed_country_codes: string[];
  country_discovery_enabled: boolean;
  page_bg_color: string | null;
  page_bg_opacity: number;
  show_post_list: boolean;
  created_at: string;
  updated_at: string;
};

export type CountryPreferences = {
  feedCountryCodes: string[];
  phoneCountryCode: string | null;
  phoneCountryFlag: string | null;
  countryDiscoveryEnabled: boolean;
};

type CountryPreferencesRow = {
  feed_country_codes: string[] | null;
  phone_country_code: string | null;
  phone_country_flag: string | null;
  country_discovery_enabled: boolean | null;
};

function mapCountryPreferences(
  row: CountryPreferencesRow | null | undefined
): CountryPreferences {
  return {
    feedCountryCodes: Array.isArray(row?.feed_country_codes)
      ? row.feed_country_codes.slice(0, 5)
      : [],
    phoneCountryCode: row?.phone_country_code ?? null,
    phoneCountryFlag: row?.phone_country_flag ?? null,
    countryDiscoveryEnabled: !!row?.country_discovery_enabled,
  };
}

export async function apiSaveMyPhoneCountry(countryCode: string) {
  const { error } = await supabase.rpc("save_my_phone_country", {
    p_country_code: countryCode,
  });

  if (error) throw error;
}

export async function apiGetMyCountryPreferences() {
  const { data, error } = await supabase
    .rpc("get_my_country_preferences")
    .single();

  if (error) throw error;
  const preferences = mapCountryPreferences(data as CountryPreferencesRow);
  if (preferences.phoneCountryCode) return preferences;

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;

  const countryCode = countryCodeFromPhone(authData.user?.phone);
  if (!countryCode) return preferences;

  await apiSaveMyPhoneCountry(countryCode);

  const { data: refreshedData, error: refreshedError } = await supabase
    .rpc("get_my_country_preferences")
    .single();
  if (refreshedError) throw refreshedError;

  return mapCountryPreferences(refreshedData as CountryPreferencesRow);
}

export async function apiUpdateMyFeedCountries(countryCodes: string[]) {
  const { data, error } = await supabase
    .rpc("update_my_feed_countries", {
      p_country_codes: countryCodes,
    })
    .single();

  if (error) throw error;
  return mapCountryPreferences(data as CountryPreferencesRow);
}

export async function apiUpdateMyCountryDiscovery(enabled: boolean) {
  const { data, error } = await supabase
    .rpc("update_my_country_discovery", {
      p_enabled: enabled,
    })
    .single();

  if (error) throw error;
  return mapCountryPreferences(data as CountryPreferencesRow);
}

async function requireUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const uid = data.user?.id;
  if (!uid) throw new Error("You must be logged in.");
  return uid;
}

export async function ensureMyProfile() {
  const uid = await requireUserId();

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: uid,
        page_bg_color: null,
        page_bg_opacity: 1,
        show_post_list: true,
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return data as ProfileRow;
}

export async function apiGetProfileByUserId(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data as ProfileRow;
}

export async function apiUpdateMyProfileTheme(input: {
  page_bg_color: string | null;
  page_bg_opacity: number;
  show_post_list: boolean;
}) {
  const uid = await requireUserId();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      page_bg_color: input.page_bg_color,
      page_bg_opacity: input.page_bg_opacity,
      show_post_list: input.show_post_list,
    })
    .eq("id", uid)
    .select("*")
    .single();

  if (error) throw error;
  return data as ProfileRow;
}
