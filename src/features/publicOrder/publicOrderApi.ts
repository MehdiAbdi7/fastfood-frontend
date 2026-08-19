import { api } from "@/server/api";
import type { ApiEnvelope } from "@/types/api";
import type { CreateOrderPayload, Order, OrderTracking } from "@/types/order";
import type { PublicTable } from "@/types/table";
import type { Store } from "@/types/store";

/**
 * Endpoints du parcours client, tous publics (aucun CheckAuth côté backend).
 *
 * Volontairement séparé de features/orders/orderApi.ts : celui-ci sert le
 * dashboard, avec une politique d'invalidation dense (Order, ServiceStats,
 * Counter...). Un visiteur du site n'a rien de tout ça en cache, et mélanger
 * les deux ferait invalider des tags que personne n'a demandés.
 */
export const publicOrderApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPublicTables: builder.query<PublicTable[], { store: Store }>({
      query: ({ store }) => ({ url: "/tables/public", params: { store } }),
      transformResponse: (response: ApiEnvelope<PublicTable[]>) =>
        response.data,
      providesTags: [{ type: "Table", id: "PUBLIC" }],
    }),

    createPublicOrder: builder.mutation<Order, CreateOrderPayload>({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      // transformResponse indispensable : le backend enveloppe tout dans
      // { success, message, data }. Sans ça, `created._id` serait undefined
      // et la redirection vers le suivi partirait sur une URL cassée.
      transformResponse: (response: ApiEnvelope<Order>) => response.data,
      // Une commande sur place occupe la table : la liste publique doit le
      // refléter pour le client suivant qui scanne le QR.
      invalidatesTags: [{ type: "Table", id: "PUBLIC" }],
    }),

    // Tag propre au suivi ("Order" + l'id) : le socket public l'invalide à
    // chaque événement, ce qui déclenche un refetch. Le document ne transite
    // jamais par le socket, seule cette route applique la bonne projection.
    getOrderTracking: builder.query<OrderTracking, string>({
      query: (id) => `/orders/${id}/track`,
      transformResponse: (response: ApiEnvelope<OrderTracking>) =>
        response.data,
      providesTags: (_r, _e, id) => [{ type: "Order", id }],
    }),
  }),
});

export const {
  useGetPublicTablesQuery,
  useCreatePublicOrderMutation,
  useGetOrderTrackingQuery,
} = publicOrderApi;
