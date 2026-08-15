import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types/user";

export const TOKEN_STORAGE_KEY = "niwa_token";
export const USER_STORAGE_KEY = "niwa_user";

interface AuthState {
  user: User | null;
  token: string | null;
  // "idle" tant que le localStorage n'a pas été lu (uniquement possible côté
  // client, dans un useEffect — voir AuthHydrator.tsx). Rester neutre ici,
  // plutôt que de lire localStorage directement dans initialState, évite un
  // mismatch d'hydratation Next (le rendu serveur n'a pas accès à window et
  // afficherait "déconnecté" pendant que le client afficherait "connecté" dès
  // le tout premier rendu). Même précaution que useTheme.ts pour le thème.
  status: "idle" | "authenticated" | "unauthenticated";
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Appelé une fois au montage par AuthHydrator, avec ce qui a été trouvé
    // (ou non) dans le localStorage.
    authHydrated(
      state,
      action: PayloadAction<{ user: User; token: string } | null>,
    ) {
      if (action.payload) {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.status = "authenticated";
      } else {
        state.status = "unauthenticated";
      }
    },
    credentialsReceived(
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.status = "authenticated";

      localStorage.setItem(TOKEN_STORAGE_KEY, action.payload.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(action.payload.user));
    },
    // Après qu'un admin modifie son propre profil (PATCH /auth/users/:id)
    currentUserUpdated(state, action: PayloadAction<User>) {
      state.user = action.payload;
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(action.payload));
    },
    loggedOut(state) {
      state.user = null;
      state.token = null;
      state.status = "unauthenticated";

      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    },
  },
});

export const { authHydrated, credentialsReceived, currentUserUpdated, loggedOut } =
  authSlice.actions;
export default authSlice.reducer;
