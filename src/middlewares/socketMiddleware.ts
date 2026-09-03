import type { Middleware, UnknownAction } from "@reduxjs/toolkit";
import { io, type Socket } from "socket.io-client";
import { api } from "@/server/api";
import { sessionLoaded, sessionCleared } from "@/features/auth/authSlice";
import { MY_DELIVERIES_TAG } from "@/features/delivery/deliveryApi";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

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
    const user = typedAction.payload;

    if (!user) {
      disconnect();
      return result;
    }

    // `socket` et non `socket?.connected` : pendant le handshake, `connected`
    // vaut encore false. Un second sessionLoaded qui tombait dans cette
    // fenêtre créait un DEUXIÈME io() et écrasait la référence du premier,
    // qui restait ouvert sans que personne ne puisse plus le fermer.
    // disconnect() remet la variable à null, donc tester sa simple présence
    // suffit et n'empêche pas une reconnexion après déconnexion.
    if (socket) return result;

    const isDelivery = user.role === "delivery";

    // Plus de `auth: { token }` : le token est dans un cookie httpOnly, que le
    // JavaScript ne peut pas lire. withCredentials fait joindre ce cookie au
    // handshake, où le backend le lit (voir readCookie dans config/socket.ts).
    socket = io(SOCKET_URL, { withCredentials: true });

    socket.on("connect", () => {
      // Deux rooms mutuellement exclusives. Le backend refuse de toute façon
      // join_dashboard à un livreur, mais autant ne pas le demander : ce serait
      // suggérer que le cloisonnement est une question de politesse côté client.
      socket?.emit(isDelivery ? "join_delivery" : "join_dashboard");
    });

    if (isDelivery) {
      // Un livreur n'a qu'un seul écran, et une seule chose à savoir : ce qui
      // change dans SES courses. Le backend émet un signal seul, le refetch
      // applique le filtre `deliveryPerson: moi`.
      socket.on("delivery_updated", () => {
        store.dispatch(api.util.invalidateTags([MY_DELIVERIES_TAG]));
      });

      return result;
    }

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
      // StoreStatus inclus : ouvrir un service rouvre les commandes en ligne
      // côté backend (voir resetCounter). Sans cette invalidation, l'autre
      // poste continuerait d'afficher l'interrupteur en position fermée.
      store.dispatch(
        api.util.invalidateTags([
          "Order",
          "ServiceStats",
          "Counter",
          "StoreStatus",
        ]),
      );
    });

    // Un poste vient d'ouvrir ou de fermer les commandes en ligne : tous les
    // autres doivent voir l'interrupteur basculer, sinon l'équipe se
    // contredirait au téléphone.
    socket.on("store_status_changed", () => {
      store.dispatch(api.util.invalidateTags(["StoreStatus"]));
    });
  }

  if (sessionCleared.match(typedAction)) {
    disconnect();
  }

  return result;
};
