"use client";

import { formatDA } from "@/lib/format";
import { formatVariantLabel } from "@/lib/variantLabel";
import { getEligibleFormulas } from "@/lib/formulaRules";
import type { MenuItem } from "@/types/menuItem";

interface DishCardProps {
  item: MenuItem;
  /** Quantité déjà au panier — 0 si absent. */
  inCart: number;
  onSelect: (item: MenuItem) => void;
}

// Un produit sans variante, sans extra, sans retrait possible et sans formule
// éligible n'a rien à configurer : il part au panier en un seul geste.
export function hasChoices(item: MenuItem): boolean {
  const extras = (item.availableExtras ?? []).filter(
    (extra) => typeof extra === "object",
  );
  return (
    item.variants.length > 1 ||
    extras.length > 0 ||
    (item.removableIngredients?.length ?? 0) > 0 ||
    getEligibleFormulas(item).length > 0
  );
}

export function DishCard({ item, inCart, onSelect }: DishCardProps) {
  const configurable = hasChoices(item);
  const minPrice = item.variants.length
    ? Math.min(...item.variants.map((v) => v.price))
    : null;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      aria-label={`${item.name}, ${configurable ? "choisir les options" : "ajouter au panier"}`}
      className="group flex w-full items-start gap-4 rounded-2xl border border-primary/50 bg-background p-3 text-left transition-colors duration-200 hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:bg-primary/10 sm:p-4"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-0.5">
        <h3 className="font-heading text-base font-bold leading-snug text-foreground">
          {item.name}
        </h3>

        {/* Entière, jamais tronquée : c'est la liste d'ingrédients, donc la
            seule information qui permet de trancher entre deux burgers. */}
        {item.description && (
          <p className="text-sm leading-relaxed text-foreground/65">
            {item.description}
          </p>
        )}

        {item.variants.length > 1 && (
          <p className="text-xs font-semibold text-foreground/45">
            {item.variants
              .map((v) => formatVariantLabel(v.combination))
              .join(" · ")}
          </p>
        )}

        <div className="mt-1 flex items-center gap-2">
          {minPrice !== null && (
            <span className="tabular-nums font-heading text-base font-bold text-accent-green">
              {item.variants.length > 1 && (
                <span className="text-xs font-semibold text-foreground/50">
                  dès{" "}
                </span>
              )}
              {formatDA(minPrice)}
            </span>
          )}

          {/* Annonce le geste à venir : une modale s'ouvrira, ce n'est pas un
              ajout direct. Évite la surprise d'un écran qui apparaît. */}
          {configurable && (
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-semibold text-foreground/50">
              à composer
            </span>
          )}
        </div>
      </div>

      <div className="relative shrink-0">
        <div className="h-24 w-24 overflow-hidden rounded-xl bg-primary/10 sm:h-28 sm:w-28">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="icon-[mdi--food] text-3xl text-primary/30" />
            </div>
          )}
        </div>

        {/* Pastille d'action, débordant sur la photo — 44px de côté, la taille
            tactile minimale, puisque tout le monde commande au téléphone. */}
        <span
          className={`absolute -bottom-2 -right-2 flex h-11 w-11 items-center justify-center rounded-full border-2 border-background text-xl shadow-md transition-colors ${
            inCart > 0
              ? "bg-accent-green text-on-primary"
              : "bg-primary text-on-primary group-hover:bg-accent-green"
          }`}
        >
          {inCart > 0 ? (
            <span className="tabular-nums text-sm font-bold">{inCart}</span>
          ) : (
            <span
              className={
                configurable ? "icon-[mdi--tune-variant]" : "icon-[mdi--plus]"
              }
            />
          )}
        </span>
      </div>
    </button>
  );
}
