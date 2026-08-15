"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { credentialsReceived, loggedOut } from "./authSlice";
import { useLoginMutation } from "./authApi";
import { api } from "@/server/api";

export function useAuth() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, token, status } = useAppSelector((state) => state.auth);
  const [loginMutation, loginState] = useLoginMutation();

  async function login(email: string, password: string) {
    // .unwrap() propage l'erreur RTK Query au composant appelant (formulaire),
    // qui affiche le message renvoyé par errorResponse() côté backend
    const result = await loginMutation({ email, password }).unwrap();
    dispatch(credentialsReceived(result));
    return result.user;
  }

  function logout() {
    dispatch(loggedOut());
    // Vide tout le cache RTK Query : évite qu'un prochain login (autre magasin,
    // autre rôle) affiche un instant les données du compte précédent
    dispatch(api.util.resetApiState());
    router.replace("/login");
  }

  return {
    user,
    token,
    isAuthenticated: status === "authenticated",
    isAdmin: user?.role === "admin",
    login,
    logout,
    isLoginLoading: loginState.isLoading,
  };
}
