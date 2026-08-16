import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// Liste volontairement large : un tag déclaré mais jamais utilisé ne coûte
// rien, alors qu'un tag utilisé sans être déclaré déclenche l'avertissement
// « Tag type X was used, but not specified » et casse silencieusement
// l'invalidation. En cas de doute, mieux vaut en déclarer un de trop.
//
// Si une nouvelle alerte apparaît sur un nom absent d'ici, ajoute-le : le
// message donne toujours le nom exact du tag manquant.
const TAG_TYPES = [
  "User",
  "Order",
  "Counter",
  "ServiceStats",
  "Stats",
  "History",
  "Table",
  "MenuItem",
  "MenuCategory",
  "MenuExtra",
  "MenuExtraType",
] as const;

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    // Remplace prepareHeaders : le navigateur joint désormais le cookie
    // httpOnly tout seul. Le token n'existe plus dans le state Redux, donc
    // plus rien à injecter à la main — et plus rien à voler via une XSS.
    credentials: "include",
  }),
  tagTypes: TAG_TYPES,
  endpoints: () => ({}),
});
