import { supabase } from "@/network/supabaseClient";

type IosWaitlistResult = {
  registered_name: string;
  registered_email: string | null;
  registered_phone: string | null;
  already_registered: boolean;
};

export async function apiJoinIosWaitlist({
  name,
  email,
  phone,
}: {
  name: string;
  email: string | null;
  phone: string | null;
}) {
  const { data, error } = await supabase
    .rpc("join_ios_waitlist", {
      p_name: name.trim(),
      p_email: email?.trim() || null,
      p_phone: phone?.trim() || null,
    })
    .single();

  if (error) throw error;

  const result = data as IosWaitlistResult;
  return {
    name: result.registered_name,
    email: result.registered_email,
    phone: result.registered_phone,
    alreadyRegistered: result.already_registered,
  };
}
