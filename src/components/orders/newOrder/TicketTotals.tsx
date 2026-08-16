"use client";

import { formatDA } from "@/lib/format";

interface TicketTotalsProps {
  itemsTotal: number;
  itemsCount: number;
  // Frais de livraison, seulement pour une commande de type delivery. Ils sont
  // fixés depuis la fiche commande une fois l'adresse connue, donc souvent
  // absents au moment de la saisie.
  deliveryFee?: number;
}

/**
 * Récapitulatif chiffré du ticket : sous-total, frais, total.
 *
 * Le visuel de référence affiche aussi une ligne « remise » et un choix de
 * moyen de paiement. Ni l'un ni l'autre n'existe dans le modèle Order du
 * backend — les afficher donnerait des contrôles décoratifs, sans effet sur
 * la commande enregistrée. À ajouter côté serveur d'abord si le besoin est réel.
 */
export function TicketTotals({
  itemsTotal,
  itemsCount,
  deliveryFee,
}: TicketTotalsProps) {
  const total = itemsTotal + (deliveryFee ?? 0);

  return (
    <div className="flex flex-col gap-2 border-t border-dashed border-border-subtle pt-4">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-foreground/60">
          Articles
          <span className="tabular-nums ml-1.5 text-foreground/40">
            ({itemsCount})
          </span>
        </span>
        <span className="tabular-nums font-semibold text-foreground/80">
          {formatDA(itemsTotal)}
        </span>
      </div>

      {deliveryFee !== undefined && (
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-foreground/60">Livraison</span>
          <span className="tabular-nums font-semibold text-foreground/80">
            {formatDA(deliveryFee)}
          </span>
        </div>
      )}

      <div className="mt-1 flex items-baseline justify-between border-t border-border-subtle pt-3">
        <span className="font-heading text-sm font-bold uppercase tracking-wide text-foreground/70">
          Total
        </span>
        <span className="tabular-nums font-heading text-2xl font-bold text-accent-green">
          {formatDA(total)}
        </span>
      </div>
    </div>
  );
}
