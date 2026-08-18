import type { Middleware, UnknownAction } from "@reduxjs/toolkit";
import { io, type Socket } from "socket.io-client";
import { api } from "@/server/api";
import { sessionLoaded, sessionCleared } from "@/features/auth/authSlice";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000";

// Une seule instance pour toute la session, ouverte/fermée sur login/logout —
// pas de reconnexion à chaque action Redux.
let socket: Socket | null = null;

function disconnect() {
  socket?.disconnect();
  socket = null;
}

export const socketMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action as UnknownAction);
  const typedAction = action as UnknownAction;

  // Ouverture : le user vient d'être posé (login, ou arrivée sur le dashboard
  // avec une session déjà valide). Un payload null signifie « pas connecté ».
  if (sessionLoaded.match(typedAction)) {
    if (!typedAction.payload) {
      disconnect();
      return result;
    }

    if (socket?.connected) return result;

    // Plus de `auth: { token }` : le token est dans un cookie httpOnly, que le
    // JavaScript ne peut pas lire. withCredentials fait joindre ce cookie au
    // handshake, où le backend le lit (voir readCookie dans config/socket.ts).
    socket = io(SOCKET_URL, { withCredentials: true });

    socket.on("connect", () => {
      // C'est ce message qui fait rejoindre les rooms dashboard:<store>,
      // selon le rôle et le magasin lus depuis le JWT côté serveur.
      socket?.emit("join_dashboard");
    });

    // Le socket ne pousse pas les données dans le store : il invalide les tags
    // RTK Query, qui refetche. Une seule source de vérité pour les commandes,
    // qu'elles arrivent par socket ou par requête classique.
    socket.on("new_order", () => {
      store.dispatch(
        api.util.invalidateTags(["Order", "ServiceStats", "Counter"]),
      );
    });

    socket.on("order_updated", () => {
      store.dispatch(
        api.util.invalidateTags(["Order", "ServiceStats", "Table"]),
      );
    });

    socket.on("order_deleted", () => {
      store.dispatch(
        api.util.invalidateTags(["Order", "ServiceStats", "Table"]),
      );
    });

    socket.on("counter_reset", () => {
      store.dispatch(
        api.util.invalidateTags(["Order", "ServiceStats", "Counter"]),
      );
    });
  }

  if (sessionCleared.match(typedAction)) {
    disconnect();
  }

  return result;
};
