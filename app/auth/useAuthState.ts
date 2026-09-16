import { useEffect, useState } from "react";
import { getAuthState, subscribeAuth } from "./authSessionStore";

export function useAuthState() {
  const [s, setS] = useState(getAuthState());

  useEffect(() => {
    return subscribeAuth(setS);
  }, []);

  return s; // { ready, session, user }
}