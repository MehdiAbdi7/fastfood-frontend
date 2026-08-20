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
      // items-stretch et non items-start : la colonne de texte doit occuper
      // toute la hauteur de la carte pour que le `mt-auto` du bloc prix ait
      // quelque chose à repousser. Sinon le prix reste collé sous la
      // description et flotte à une hauteur différente d'une carte à l'autre.
      className="group flex w-full items-stretch gap-4 rounded-2xl border border-primary/40 bg-background/70 p-3 text-left backdrop-blur-md transition-colors duration-200 hover:border-primary hover:bg-background/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:bg-primary/10 sm:p-4"
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

        {/* mt-auto : ancre la ligne de prix en bas, donc alignée avec celle des
            cartes voisines quelle que soit la longueur des descriptions. */}
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-1.5">
          {minPrice !== null && (
            // whitespace-nowrap : sans lui, « dès 250 DA » se coupait entre le
            // montant et la devise dès que la colonne se resserrait.
            <span className="tabular-nums whitespace-nowrap font-heading text-base font-bold text-accent-green">
              {item.variants.length > 1 && (
                <span className="text-xs font-semibold text-foreground/50">
                  dès{" "}
                </span>
              )}
              {formatDA(minPrice)}
            </span>
          )}

          {/* Annonce le geste à venir : une fiche s'ouvrira, ce n'est pas un
              ajout direct. Évite la surprise d'un écran qui apparaît. */}
          {configurable && (
            <span className="whitespace-nowrap rounded-full bg-surface-2 px-2 py-0.5 text-xs font-semibold text-foreground/50">
              à composer
            </span>
          )}
        </div>
      </div>

      {/* self-start : la photo reste en haut même quand la carte est étirée
          par une voisine plus haute. */}
      <div className="relative shrink-0 self-start">
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
