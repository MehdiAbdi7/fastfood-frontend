import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "../features/theme/themeSlice";
import heroCarouselReducer from "../features/heroCarousel/heroCarouselSlice";
import { api } from "@/server/api";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    heroCarousel: heroCarouselReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
