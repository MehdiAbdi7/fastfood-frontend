"use client";

import { formatDA } from "@/lib/format";
import { formatVariantLabel } from "@/lib/variantLabel";
import type { MenuItem } from "@/types/menuItem";

interface MenuItemCardProps {
  item: MenuItem;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function MenuItemCard({
  item,
  isAdmin,
  onEdit,
  onDelete,
}: MenuItemCardProps) {
  const categoryName =
    typeof item.category === "object" ? item.category.name : null;
  const minPrice = Math.min(...item.variants.map((v) => v.price));
  const hasVariants = item.variants.length > 1;

  return (
    <article
      className={`surface-card group relative flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-food-sm ${
        item.available ? "" : "opacity-60"
      }`}
    >
      {/* Image large plutôt que la vignette 64px d'avant : sur une page de
          gestion, reconnaître un produit d'un coup d'œil compte plus que
          d'en faire tenir un maximum à l'écran. */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-surface-2">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="icon-[mdi--food] text-4xl text-foreground/20" />
          </div>
        )}

        {categoryName && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur-sm">
            {categoryName}
          </span>
        )}

        {/* Actions en surimpression, révélées au survol : elles encombreraient
            le corps de la carte alors qu'on ne les utilise qu'occasionnellement.
            Toujours visibles au clavier grâce à focus-within. */}
        {isAdmin && (
          <div className="absolute right-2.5 top-2.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <button
              onClick={onEdit}
              aria-label={`Modifier ${item.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/90 text-foreground/70 backdrop-blur-sm transition-colors hover:text-primary"
            >
              <span className="icon-[mdi--pencil-outline] text-base" />
            </button>
            <button
              onClick={onDelete}
              aria-label={`Supprimer ${item.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/90 text-foreground/70 backdrop-blur-sm transition-colors hover:text-accent-bordeaux"
            >
              <span className="icon-[mdi--trash-can-outline] text-base" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate font-heading text-sm font-bold text-foreground">
            {item.name}
          </h3>
          <span className="tabular-nums shrink-0 font-heading text-sm font-bold text-accent-green">
            {hasVariants ? "dès " : ""}
            {formatDA(minPrice)}
          </span>
        </div>

        {/* La description existait en base sans jamais être affichée ici —
            c'est pourtant elle qui distingue deux burgers au nom proche. */}
        {item.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-foreground/55">
            {item.description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
          {hasVariants && (
            <span className="rounded-md bg-surface-2 px-2 py-1 text-xs font-semibold text-foreground/55">
              {item.variants
                .map((v) => formatVariantLabel(v.combination))
                .join(" · ")}
            </span>
          )}

          <span
            className={`rounded-md px-2 py-1 text-xs font-semibold ${
              item.available
                ? "bg-accent-green/10 text-accent-green"
                : "bg-accent-bordeaux/10 text-accent-bordeaux"
            }`}
          >
            {item.available ? "Disponible" : "Épuisé"}
          </span>
        </div>
      </div>
    </article>
  );
}
