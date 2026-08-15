import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/lib/store";
import { loggedOut } from "@/features/auth/authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

// Pas de refresh token côté backend (JWT simple, 7j) : un 401 signifie donc
// toujours "token invalide ou expiré" -> on déconnecte proprement plutôt que
// de laisser l'app dans un état incohérent (données affichées, requêtes qui
// échouent en boucle).
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    api.dispatch(loggedOut());
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  // Tags utilisés pour l'invalidation automatique du cache après une mutation
  tagTypes: [
    "MenuItem",
    "MenuCategory",
    "MenuExtra",
    "MenuExtraType",
    "Order",
    "Table",
    "User",
    "Counter",
    "ServiceStats",
  ],
  endpoints: () => ({}),
});
