"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { AuthHydrator } from "@/features/auth/AuthHydrator";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator />
      {children}
    </Provider>
  );
}
