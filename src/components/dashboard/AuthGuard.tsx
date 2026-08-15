"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/useAuth";
import { useAppSelector } from "@/lib/hooks";

interface AuthGuardProps {
  children: React.ReactNode;
  // Restreint la page aux admins (ex: /utilisateurs)
  adminOnly?: boolean;
}

// Protection côté client. Le statut "idle" (avant lecture du localStorage par
// AuthHydrator) affiche un loader identique sur serveur et client — jamais de
// redirection ni de contenu protégé tant qu'on n'est pas sûr de l'état réel.
export function AuthGuard({ children, adminOnly = false }: AuthGuardProps) {
  const router = useRouter();
  const status = useAppSelector((state) => state.auth.status);
  const { isAuthenticated, isAdmin, user } = useAuth();

  useEffect(() => {
    if (status === "idle") return; // hydratation pas encore terminée

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (adminOnly && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [status, isAuthenticated, isAdmin, adminOnly, router]);

  const isReady = status === "authenticated" && (!adminOnly || isAdmin) && user;

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="icon-[mdi--loading] animate-spin text-4xl text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
