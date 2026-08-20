"use client";

import Image from "next/image";
import { formatDA } from "@/lib/format";
import { summarizeVariants } from "@/lib/variantLabel";
import { getEligibleFormulas } from "@/lib/formulaRules";
import type { MenuItem } from "@/types/menuItem";

interface DishCardProps {
  item: MenuItem;
  /** Quantité déjà au panier — 0 si absent. */
  inCart: number;
  onSelect: (item: MenuItem) => void;
}

// Largeur d'AFFICHAGE de la vignette, pas le poids du fichier : le navigateur
// choisit la variante du srcset avec cette seule information, avant même
// d'avoir appliqué le CSS. Elle suit les tailles fixes ci-dessous.
const THUMB_SIZES = "(max-width: 640px) 112px, 128px";

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

  // Les axes de choix, pas les combinaisons — voir summarizeVariants.
  const variantChoices = summarizeVariants(item.variants);

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

        {/* Une ligne par décision à prendre (viande, taille), et non une
            énumération des six combinaisons possibles. */}
        {variantChoices.length > 0 && (
          <div className="flex flex-col gap-0.5">
            {variantChoices.map(({ attribute, values }) => (
              <p key={attribute} className="text-xs text-foreground/50">
                <span className="font-semibold capitalize text-foreground/65">
                  {attribute}
                </span>{" "}
                : {values.join(", ")}
              </p>
            ))}
          </div>
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
          {/* La pastille « à composer » a été retirée : l'icône tune-variant
              sur la photo dit déjà qu'une fiche va s'ouvrir. Deux signaux pour
              la même information encombraient la ligne de prix. */}
        </div>
      </div>

      {/* self-start : la photo reste en haut même quand la carte est étirée
          par une voisine plus haute. */}
      <div className="relative shrink-0 self-start">
        {/* next/image plutôt qu'un <img> brut : Cloudinary est déclaré dans
            remotePatterns, donc Next sert une vignette au bon format et à la
            bonne taille. Sur une page qui charge 33 produits d'un coup, c'est
            le principal gain sur le LCP. */}
        <div className="relative h-28 w-28 overflow-hidden rounded-xl bg-primary/10 sm:h-32 sm:w-32">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt=""
              fill
              sizes={THUMB_SIZES}
              className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
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
