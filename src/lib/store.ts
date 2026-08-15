// src/lib/store.ts

import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "../features/theme/themeSlice";
import heroCarouselReducer from "../features/heroCarousel/heroCarouselSlice";
import navbarReducer from "../features/navbar/navbarSlice";
import testimonialsReducer from "../features/testimonials/testimonialsSlice";
import authReducer from "../features/auth/authSlice";
import toastReducer from "../features/toast/toastSlice";
import storeScopeReducer from "../features/store/storeScopeSlice";
import { api } from "@/server/api";
import { socketMiddleware } from "@/middlewares/socketMiddleware";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    heroCarousel: heroCarouselReducer,
    navbar: navbarReducer,
    testimonials: testimonialsReducer,
    auth: authReducer,
    toast: toastReducer,
    storeScope: storeScopeReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware, socketMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
