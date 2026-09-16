import { supabase } from "../supabaseClient";

export type ProfileRow = {
  id: string;
  page_bg_color: string | null;
  page_bg_opacity: number;
  show_post_list: boolean;
  created_at: string;
  updated_at: string;
};

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