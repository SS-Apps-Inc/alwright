import { supabase } from "../supabaseClient";

export async function apiDeleteMyAccount() {
  const { data, error } = await supabase.rpc("request_my_account_deletion");
  if (error) throw error;
  return data as { requested: boolean; delete_after: string } | null;
}

export async function apiRequestMyAccountDataExport(email: string) {
  const { data, error } = await supabase.rpc("request_my_account_data_export", {
    p_email: email.trim(),
  });

  if (error) throw error;
  return data as { requested: boolean; email: string } | null;
}

export async function apiCancelMyAccountDeletion() {
  const { data, error } = await supabase.rpc("cancel_my_account_deletion");
  if (error) throw error;
  return data as { canceled: boolean } | null;
}
