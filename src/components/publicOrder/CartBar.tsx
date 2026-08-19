"use client";

import { useCart } from "@/features/publicOrder/useCart";
import { formatDA } from "@/lib/format";

/**
 * Barre flottante d'accès au panier.
 *
 * Elle affiche le total en permanence, ce qui est le point le plus demandé sur
 * une carte de fast-food : le client compose en surveillant son budget, sans
 * devoir ouvrir le ticket à chaque ajout.
 */
export function CartBar() {
  const { count, total, openTicket } = useCart();

  if (count === 0) return null;

  return (
    <div
      className="fixed inset-x-0 z-30 px-4 sm:px-6"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <button
        type="button"
        onClick={openTicket}
        className="mx-auto flex h-14 w-full max-w-md items-center gap-3 rounded-full bg-primary px-4 text-on-primary shadow-[0_10px_30px_-8px_rgba(0,0,0,0.5)] transition-transform hover:scale-[1.02] active:scale-[0.99] motion-safe:animate-[cartBarIn_0.28s_ease-out]"
      >
        <span className="tabular-nums flex h-9 min-w-9 items-center justify-center rounded-full bg-on-primary/20 px-2 font-heading text-base font-bold">
          {count}
        </span>

        <span className="flex-1 text-left font-heading text-base font-bold">
          Voir mon panier
        </span>

        <span className="tabular-nums font-heading text-base font-bold">
          {formatDA(total)}
        </span>
        <span className="icon-[mdi--chevron-up] text-xl opacity-80" />
      </button>
    </div>
  );
}
