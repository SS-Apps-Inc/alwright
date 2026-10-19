// app/auth/authSessionStore.ts
import { apiCancelMyAccountDeletion } from "@/network/account/accountApi";
import { privateMemory } from "@/memory";
import { supabase } from "@/network/supabaseClient";
import { STORAGE_KEYS } from "@/config";
import type { Session, User } from "@supabase/supabase-js";

type AuthState = {
  ready: boolean;
  session: Session | null;
  user: User | null;
};

let state: AuthState = {
  ready: false,
  session: null,
  user: null,
};

const listeners = new Set<(s: AuthState) => void>();
let lastDeletionCancelUserId: string | null = null;

function notify() {
  for (const cb of listeners) cb(state);
}

export function subscribeAuth(cb: (s: AuthState) => void) {
  listeners.add(cb);
  cb(state);

  return () => {
    listeners.delete(cb);
  };
}

export function getAuthState() {
  return state;
}

export function isLoggedIn() {
  return !!state.session?.user;
}

export async function getAccessToken() {
  if (state.session?.access_token) return state.session.access_token;
  return await privateMemory.getItem(STORAGE_KEYS.auth.accessToken);
}

export async function getUserId() {
  return (
    state.session?.user?.id ??
    (await privateMemory.getItem(STORAGE_KEYS.auth.userId)) ??
    null
  );
}

export async function signOut() {
  await supabase.auth.signOut();
}

async function persistSession(session: Session | null) {
  if (!session) {
    await privateMemory.removeItem(STORAGE_KEYS.auth.accessToken);
    await privateMemory.removeItem(STORAGE_KEYS.auth.refreshToken);
    await privateMemory.removeItem(STORAGE_KEYS.auth.userId);
    return;
  }

  await privateMemory.setItem(
    STORAGE_KEYS.auth.accessToken,
    session.access_token
  );
  await privateMemory.setItem(
    STORAGE_KEYS.auth.refreshToken,
    session.refresh_token
  );
  await privateMemory.setItem(STORAGE_KEYS.auth.userId, session.user.id);
}

async function cancelPendingDeletionForSession(session: Session | null) {
  const uid = session?.user?.id ?? null;
  if (!uid || lastDeletionCancelUserId === uid) return;

  try {
    await apiCancelMyAccountDeletion();
    lastDeletionCancelUserId = uid;
  } catch (error) {
    console.log("Cancel account deletion failed:", error);
  }
}

export async function initAuthListener() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      state = { ...state, ready: true };
      notify();
      return;
    }

    state = {
      ready: true,
      session: data.session ?? null,
      user: data.session?.user ?? null,
    };

    await persistSession(state.session);
    notify();
    void cancelPendingDeletionForSession(state.session);

    supabase.auth.onAuthStateChange(async (_event, session) => {
      state = {
        ready: true,
        session: session ?? null,
        user: session?.user ?? null,
      };

      await persistSession(session ?? null);
      notify();
      void cancelPendingDeletionForSession(session ?? null);
    });
  } catch (error) {
    console.error("initAuthListener failed", error);
    state = { ready: true, session: null, user: null };
    notify();
  }
}
