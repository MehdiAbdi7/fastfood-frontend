"use client";

import Link from "next/link";
import { formatDA } from "@/lib/format";
import {
  describeLineOptions,
  getLineTotal,
  type CartLine,
  type LineDetailTone,
} from "@/lib/cartLine";

const DETAIL_CLASSES: Record<LineDetailTone, string> = {
  neutral: "text-foreground/50",
  formula: "text-accent-mustard font-semibold",
  extra: "text-accent-green",
  removed: "text-accent-bordeaux",
};

interface CheckoutSummaryProps {
  lines: CartLine[];
  total: number;
  count: number;
}

/**
 * Récapitulatif figé de la commande, en lecture seule.
 *
 * Aucun contrôle de quantité ici, contrairement à CartSheet : à ce stade le
 * client remplit ses coordonnées, lui remettre des boutons +/− sous les yeux
 * l'invite à repartir en arrière au lieu de terminer. Le lien « Modifier »
 * renvoie à la carte, qui est l'endroit prévu pour ça.
 *
 * Même vocabulaire visuel que le ticket (chasse fixe, pointillés, découpe
 * dentelée) pour qu'on reconnaisse le même objet d'un écran à l'autre.
 */
export function CheckoutSummary({ lines, total, count }: CheckoutSummaryProps) {
  return (
    <section className="ticket-notch relative flex flex-col rounded-3xl border border-primary/25 bg-background pb-6 dark:bg-primary/10">
      <header className="flex items-center justify-between border-b border-dashed border-primary/25 px-5 py-4">
        <div className="flex flex-col">
          <h2 className="font-heading text-base font-bold text-foreground">
            Votre commande
          </h2>
          <span className="tabular-nums text-xs font-semibold text-foreground/50">
            {count} article{count > 1 ? "s" : ""}
          </span>
        </div>

        <Link
          href="/commande"
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-foreground/55 transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <span className="icon-[mdi--pencil-outline] text-sm" />
          Modifier
        </Link>
      </header>

      <ul className="flex flex-col divide-y divide-dashed divide-primary/20 px-5">
        {lines.map((line) => (
          <li key={line.key} className="flex gap-3 py-3">
            <span className="tabular-nums mt-0.5 flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 px-1 text-xs font-bold text-primary">
              {line.quantity}
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate font-heading text-sm font-bold text-foreground">
                  {line.name}
                </p>
                <span className="tabular-nums shrink-0 font-heading text-sm font-bold text-foreground">
                  {formatDA(getLineTotal(line))}
                </span>
              </div>

              {describeLineOptions(line).map((detail, index) => (
                <p
                  key={index}
                  className={`text-xs leading-snug ${DETAIL_CLASSES[detail.tone]}`}
                >
                  {detail.label}
                </p>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-1 flex items-baseline justify-between border-t border-dashed border-primary/25 px-5 pt-4">
        <span className="font-heading text-sm font-bold uppercase tracking-wide text-foreground/70">
          Sous-total
        </span>
        <span className="tabular-nums font-heading text-2xl font-bold text-accent-green">
          {formatDA(total)}
        </span>
      </div>
    </section>
  );
}
