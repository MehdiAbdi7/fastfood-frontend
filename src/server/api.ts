import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    // TODO : quand le slice `auth` existera (login staff), ajouter ici
    // prepareHeaders pour injecter le Bearer token sur chaque requête
  }),
  // Tags utilisés pour l'invalidation automatique du cache après une mutation
  // (ex: après un POST sur /menu-items, on invalide "MenuItem" pour recharger la liste)
  tagTypes: ["MenuItem", "MenuCategory", "Order", "Table"],
  endpoints: () => ({}),
});
