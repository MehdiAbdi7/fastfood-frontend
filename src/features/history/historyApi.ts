import { api } from "@/server/api";
import type { ApiEnvelope, PaginatedEnvelope } from "@/types/api";
import type {
  HistoryDayEntry,
  HistoryMonthEntry,
  HistoryYearEntry,
  Order,
  OrderType,
} from "@/types/order";
import type { Store } from "@/types/store";

// `type` est obligatoire côté backend (voir historyTypeSchema) : impossible de
// demander "tous les types" en un seul appel d'historique, il faut choisir.
interface BaseHistoryParams {
  type: OrderType;
  store?: Store;
}

export interface HistoryOrdersParams extends BaseHistoryParams {
  year: number;
  month: number;
  day: number;
  page?: number;
  limit?: number;
}

export interface OrdersHistoryPage {
  orders: Order[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export const historyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHistoryYears: builder.query<HistoryYearEntry[], BaseHistoryParams>({
      query: (params) => ({ url: "/orders/history/years", params }),
      transformResponse: (response: ApiEnvelope<HistoryYearEntry[]>) => response.data,
    }),

    getHistoryMonths: builder.query<
      HistoryMonthEntry[],
      BaseHistoryParams & { year: number }
    >({
      query: (params) => ({ url: "/orders/history/months", params }),
      transformResponse: (response: ApiEnvelope<HistoryMonthEntry[]>) => response.data,
    }),

    getHistoryDays: builder.query<
      HistoryDayEntry[],
      BaseHistoryParams & { year: number; month: number }
    >({
      query: (params) => ({ url: "/orders/history/days", params }),
      transformResponse: (response: ApiEnvelope<HistoryDayEntry[]>) => response.data,
    }),

    getHistoryOrders: builder.query<OrdersHistoryPage, HistoryOrdersParams>({
      query: (params) => ({ url: "/orders/history/orders", params }),
      transformResponse: (response: PaginatedEnvelope<Order>) => ({
        orders: response.data,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
      }),
    }),
  }),
});

export const {
  useGetHistoryYearsQuery,
  useGetHistoryMonthsQuery,
  useGetHistoryDaysQuery,
  useGetHistoryOrdersQuery,
} = historyApi;
