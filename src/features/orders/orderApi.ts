import { api } from "@/server/api";
import type { ApiEnvelope, PaginatedEnvelope } from "@/types/api";
import type {
  CounterState,
  CreateOrderItemPayload,
  CreateOrderPayload,
  Order,
  OrderStatus,
  OrdersQueryParams,
  ServiceStats,
} from "@/types/order";
import type { Store } from "@/types/store";

interface StoreScopeParams {
  store?: Store;
}

// Résultat paginé exposé aux composants : forme volontairement proche de la
// PaginatedEnvelope backend, sans les champs "success"/"message" inutiles côté UI.
export interface OrdersPage {
  orders: Order[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export const orderApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<OrdersPage, OrdersQueryParams | void>({
      query: (params) => ({ url: "/orders", params: params ?? undefined }),
      transformResponse: (response: PaginatedEnvelope<Order>) => ({
        orders: response.data,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.orders.map((o) => ({ type: "Order" as const, id: o._id })),
              { type: "Order" as const, id: "LIST" },
            ]
          : [{ type: "Order" as const, id: "LIST" }],
    }),

    // Même route que le formulaire public /commande — pas de CheckAuth côté
    // backend sur POST /orders (juste un rate-limit). Le dashboard s'en sert
    // pour les commandes prises au comptoir ou par téléphone.
    createOrder: builder.mutation<Order, CreateOrderPayload>({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      invalidatesTags: [
        { type: "Order", id: "LIST" },
        { type: "Table", id: "LIST" }, // dine_in occupe la table choisie
      ],
    }),

    getOrderById: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      transformResponse: (response: ApiEnvelope<Order>) => response.data,
      providesTags: (_r, _e, id) => [{ type: "Order", id }],
    }),

    updateOrderStatus: builder.mutation<
      Order,
      { id: string; status: OrderStatus }
    >({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
        { type: "Table", id: "LIST" }, // "completed" libère la table associée
      ],
    }),

    addItemsToOrder: builder.mutation<
      Order,
      { id: string; items: CreateOrderItemPayload[] }
    >({
      query: ({ id, items }) => ({
        url: `/orders/${id}/items`,
        method: "PATCH",
        body: { items },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
      ],
    }),

    setDeliveryFee: builder.mutation<Order, { id: string; deliveryFee: number }>({
      query: ({ id, deliveryFee }) => ({
        url: `/orders/${id}/delivery-fee`,
        method: "PATCH",
        body: { deliveryFee },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
      ],
    }),

    deleteOrder: builder.mutation<null, string>({
      query: (id) => ({ url: `/orders/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
        { type: "Table", id: "LIST" },
      ],
    }),

    getCounters: builder.query<CounterState[], StoreScopeParams | void>({
      query: (params) => ({ url: "/orders/counter", params: params ?? undefined }),
      transformResponse: (response: ApiEnvelope<CounterState[]>) => response.data,
      providesTags: ["Counter"],
    }),

    getServiceStats: builder.query<ServiceStats[], StoreScopeParams | void>({
      query: (params) => ({
        url: "/orders/stats/service",
        params: params ?? undefined,
      }),
      transformResponse: (response: ApiEnvelope<ServiceStats[]>) => response.data,
      providesTags: ["ServiceStats"],
    }),

    resetCounter: builder.mutation<
      CounterState,
      { store?: Store; force?: boolean }
    >({
      query: (body) => ({ url: "/orders/counter/reset", method: "POST", body }),
      invalidatesTags: [
        "Counter",
        "ServiceStats",
        { type: "Order", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useAddItemsToOrderMutation,
  useSetDeliveryFeeMutation,
  useDeleteOrderMutation,
  useGetCountersQuery,
  useGetServiceStatsQuery,
  useResetCounterMutation,
} = orderApi;
