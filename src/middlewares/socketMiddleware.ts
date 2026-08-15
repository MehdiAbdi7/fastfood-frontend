import { io, type Socket } from "socket.io-client";
import type { Middleware } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";
import { api } from "@/server/api";
import { credentialsReceived, loggedOut } from "@/features/auth/authSlice";

// Une seule instance Socket.io pour toute la session, ouverte/fermée sur
// login/logout — pas de reconnexion à chaque action Redux.
let socket: Socket | null = null;

function connectSocket(token: string, dispatch: (action: unknown) => void) {
  if (socket) return;

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
    auth: { token },
  });

  socket.on("connect", () => {
    // Le backend décide des rooms selon le rôle (admin = les deux magasins,
    // employee = le sien) — voir config/socket.ts
    socket?.emit("join_dashboard");
  });

  // Stratégie volontairement simple : on invalide les tags concernés plutôt
  // que de patcher le cache à la main. RTK Query refetch alors automatiquement
  // toute query active qui dépend de ce tag (peu importe ses query params).
  // Sur un réseau local, le coût du refetch est négligeable et cette approche
  // est bien moins fragile qu'un patch manuel qui doit deviner la forme exacte
  // de chaque cache en mémoire.

  socket.on("new_order", () => {
    dispatch(api.util.invalidateTags([{ type: "Order", id: "LIST" }]));
  });

  socket.on("order_updated", () => {
    dispatch(
      api.util.invalidateTags([
        { type: "Order", id: "LIST" },
        { type: "Table", id: "LIST" }, // une commande "completed" libère sa table
      ]),
    );
  });

  socket.on("order_deleted", () => {
    dispatch(api.util.invalidateTags([{ type: "Order", id: "LIST" }]));
  });

  socket.on("counter_reset", () => {
    // Nouveau service ouvert : la numérotation, les stats et la liste
    // "active" repartent toutes de zéro.
    dispatch(
      api.util.invalidateTags([
        "Counter",
        "ServiceStats",
        { type: "Order", id: "LIST" },
      ]),
    );
  });

  socket.on("connect_error", (err) => {
    // Un token invalide/expiré ferme la connexion côté serveur (voir
    // config/socket.ts backend). On ne force pas le logout ici : la prochaine
    // requête REST s'en chargera via le 401 de baseQueryWithReauth — évite de
    // déconnecter l'utilisateur pour un simple hoquet réseau du socket.
    console.warn("Socket non connecté :", err.message);
  });
}

function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export const socketMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action) => {
    const result = next(action);

    if (credentialsReceived.match(action)) {
      connectSocket(action.payload.token, store.dispatch);
    }

    if (loggedOut.match(action)) {
      disconnectSocket();
    }

    return result;
  };
