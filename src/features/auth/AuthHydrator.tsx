"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { authHydrated, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "./authSlice";
import type { User } from "@/types/user";

// Monté une seule fois dans Providers. Lit le localStorage après le premier
// rendu (donc identique côté serveur et côté client au moment de l'hydratation
// React), puis fait basculer authSlice de "idle" vers son état réel.
export function AuthHydrator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      const rawUser = localStorage.getItem(USER_STORAGE_KEY);

      if (token && rawUser) {
        dispatch(authHydrated({ user: JSON.parse(rawUser) as User, token }));
      } else {
        dispatch(authHydrated(null));
      }
    } catch {
      dispatch(authHydrated(null));
    }
    // volontairement vide : une seule lecture, au montage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
