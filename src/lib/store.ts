// src/lib/store.ts

import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "../features/theme/themeSlice";
import heroCarouselReducer from "../features/heroCarousel/heroCarouselSlice";
import navbarReducer from "../features/navbar/navbarSlice";
import testimonialsReducer from "../features/testimonials/testimonialsSlice";
import { api } from "@/server/api";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    heroCarousel: heroCarouselReducer,
    navbar: navbarReducer,
    testimonials: testimonialsReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
