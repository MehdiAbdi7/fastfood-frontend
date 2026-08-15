"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/useAuth";

// Type le corps d'erreur RTK Query tel que renvoyé par errorResponse() backend
interface ApiError {
  data?: { error?: string };
  status?: number;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoginLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      const apiError = err as ApiError;
      // Le 429 (rate limit) renvoie déjà un délai précis dans err.data.error
      // (voir middlewares/rateLimiters.ts backend) -> on l'affiche tel quel
      setErrorMessage(
        apiError.data?.error ?? "Une erreur est survenue, réessayez.",
      );
    }
  }

  return (
    <div className="background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-foreground bg-background p-8 shadow-food-md dark:bg-primary/20">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Image src="/logo-niwa.png" alt="Niwa Food" width={56} height={56} />
          <h1 className="font-heading text-xl font-bold text-foreground">
            Espace équipe
          </h1>
          <p className="text-sm text-foreground/60">
            Connectez-vous pour accéder au dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-primary/30 bg-background px-4 py-2.5 text-foreground outline-none transition-colors focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-foreground">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-primary/30 bg-background px-4 py-2.5 text-foreground outline-none transition-colors focus:border-primary"
            />
          </div>

          {errorMessage && (
            <p className="rounded-lg bg-accent-bordeaux/10 px-3 py-2 text-sm text-accent-bordeaux">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoginLoading}
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary py-2.5 font-bold text-on-primary transition-all hover:bg-accent-slate disabled:opacity-60"
          >
            {isLoginLoading && (
              <span className="icon-[mdi--loading] animate-spin text-lg" />
            )}
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
