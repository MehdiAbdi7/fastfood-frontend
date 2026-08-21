"use client";

import { useEffect, useMemo } from "react";
import { DishCard, hasChoices } from "./DishCard";
import { ProductSheet } from "./ProductSheet";
import { useCart } from "@/features/publicOrder/useCart";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  filtersReset,
  selectGroupLabel,
  selectSearch,
  selectSubCategoryId,
} from "@/features/publicOrder/browseSlice";
import { selectProductSheet } from "@/features/publicOrder/cartSlice";
import type { MenuNavGroup } from "@/features/menu/menuNav";
import type { MenuItem } from "@/types/menuItem";

interface DishListProps {
  items: MenuItem[]; // déjà filtrés "disponibles" côté serveur
  nav: MenuNavGroup[];
}

function getCategoryId(item: MenuItem): string {
  return typeof item.category === "object" ? item.category._id : item.category;
}

function getBasePrice(item: MenuItem): number {
  return item.variants.length
    ? Math.min(...item.variants.map((variant) => variant.price))
    : Number.POSITIVE_INFINITY;
}

/**
 * Grille des plats, et hôte de la fiche produit.
 *
 * La fiche vit ici et non dans un composant frère : c'est le seul endroit qui
 * détient déjà le menu complet. L'isoler ailleurs obligerait à sérialiser une
 * deuxième fois tout le catalogue dans le payload RSC.
 *
 * C'est aussi pour cette raison que la réconciliation du panier restauré est
 * portée ici : le layout, qui hydrate, ne connaît pas le menu.
 */
export function DishList({ items, nav }: DishListProps) {
  const dispatch = useAppDispatch();
  const search = useAppSelector(selectSearch);
  const groupLabel = useAppSelector(selectGroupLabel);
  const subCategoryId = useAppSelector(selectSubCategoryId);
  const sheet = useAppSelector(selectProductSheet);

  const {
    quantityByItem,
    lines,
    addLine,
    openProduct,
    closeProduct,
    isHydrated,
    reconcile,
    unavailableNotice,
    dismissNotice,
  } = useCart();

  // Chaîne primitive et non tableau : la référence d'un tableau change à
  // chaque rendu, ce qui relancerait l'effet en boucle.
  const availableIdsKey = useMemo(
    () => items.map((item) => item._id).join(","),
    [items],
  );

  useEffect(() => {
    // Avant l'hydratation il n'y a rien à réconcilier, et le faire trop tôt
    // reviendrait à valider un panier vide.
    if (!isHydrated) return;
    reconcile(availableIdsKey ? availableIdsKey.split(",") : []);
    // reconcile est recréé à chaque rendu (useCart n'est pas mémoïsé) : le
    // sortir des dépendances évite la boucle, et le reducer est de toute
    // façon idempotent — il ne modifie l'état que s'il y a vraiment à retirer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, availableIdsKey]);

  // Options de formule (la boisson d'un menu) lues dans le menu réel plutôt
  // qu'une liste figée : ajouter une canette suffit à la proposer en formule.
  const optionsByCategory = useMemo(() => {
    const options: Record<string, string[]> = {};

    for (const item of items) {
      const categoryName =
        typeof item.category === "object" ? item.category?.name : undefined;
      if (!categoryName) continue;
      (options[categoryName] ??= []).push(item.name);
    }

    for (const list of Object.values(options)) {
      list.sort((a, b) => a.localeCompare(b, "fr"));
    }

    return options;
  }, [items]);

  const filteredItems = useMemo(() => {
    const activeIds = subCategoryId
      ? [subCategoryId]
      : (nav.find((group) => group.label === groupLabel)?.categoryIds ?? null);

    const byCategory = activeIds
      ? items.filter((item) => activeIds.includes(getCategoryId(item)))
      : items;

    const searchedItems = !search.trim()
      ? byCategory
      : (() => {
          // La recherche couvre la description : on retrouve souvent un plat
          // par un ingrédient dont on a oublié le nom.
          const query = search.toLowerCase();
          return byCategory.filter(
            (item) =>
              item.name.toLowerCase().includes(query) ||
              item.description?.toLowerCase().includes(query),
          );
        })();

    const sections =
      nav.find((group) => group.label === groupLabel)?.sections ?? [];
    const sectionRankByItemId = new Map(
      sections.flatMap((section, index) =>
        section.itemIds.map((itemId) => [itemId, index] as const),
      ),
    );

    return [...searchedItems].sort((a, b) => {
      const sectionA =
        sectionRankByItemId.get(a._id) ?? Number.POSITIVE_INFINITY;
      const sectionB =
        sectionRankByItemId.get(b._id) ?? Number.POSITIVE_INFINITY;
      return (
        sectionA - sectionB ||
        getBasePrice(a) - getBasePrice(b) ||
        a.name.localeCompare(b.name, "fr")
      );
    });
  }, [items, nav, groupLabel, subCategoryId, search]);

  const sectionsByItemId = useMemo(() => {
    const sections =
      nav.find((group) => group.label === groupLabel)?.sections ?? [];
    return new Map(
      sections.flatMap((section) =>
        section.itemIds.map((itemId) => [itemId, section.label] as const),
      ),
    );
  }, [nav, groupLabel]);

  const configuredItem = sheet
    ? (items.find((item) => item._id === sheet.menuItemId) ?? null)
    : null;

  const editedLine = sheet?.lineKey
    ? (lines.find((line) => line.key === sheet.lineKey) ?? null)
    : null;

  function handleSelect(item: MenuItem) {
    // Rien à composer (une canette, une salade) : au panier en un geste, sans
    // imposer un écran de plus.
    if (!hasChoices(item)) {
      addLine({
        menuItemId: item._id,
        name: item.name,
        imageUrl: item.imageUrl,
        variant: item.variants[0],
        extras: [],
        excludedIngredients: [],
        quantity: 1,
      });
      return;
    }

    openProduct(item._id);
  }

  return (
    <>
      {/* Un article disparu en silence serait pire que pas de panier persisté
          du tout : le client doit savoir pourquoi son total a baissé. */}
      {unavailableNotice.length > 0 && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-accent-mustard/40 bg-accent-mustard/10 px-4 py-3">
          <span className="icon-[mdi--information-outline] mt-0.5 shrink-0 text-lg text-accent-mustard" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="font-heading text-sm font-bold text-foreground">
              {unavailableNotice.length > 1
                ? "Des articles ne sont plus disponibles"
                : "Un article n'est plus disponible"}
            </p>
            <p className="text-sm text-foreground/65">
              {unavailableNotice.join(", ")} — retiré
              {unavailableNotice.length > 1 ? "s" : ""} de votre panier.
            </p>
          </div>
          <button
            type="button"
            onClick={dismissNotice}
            aria-label="Fermer"
            className="shrink-0 text-foreground/40 transition-colors hover:text-foreground"
          >
            <span className="icon-[mdi--close] text-lg" />
          </button>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <span className="icon-[mdi--silverware-clean] text-4xl text-foreground/25" />
          <p className="font-heading text-lg font-bold text-foreground">
            Rien ne correspond
          </p>
          <p className="max-w-xs text-sm text-foreground/60">
            Essayez une autre catégorie, ou effacez la recherche.
          </p>
          <button
            type="button"
            onClick={() => dispatch(filtersReset())}
            className="mt-2 rounded-full border border-primary px-5 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
          >
            Revoir tout le menu
          </button>
        </div>
      ) : (
        // Deux colonnes maximum, et seulement à partir de xl. En trois
        // colonnes, la colonne de texte tombe à ~230 px : une description de
        // tacos s'y étale sur quatre lignes à côté d'une photo minuscule.
        // Une carte horizontale a besoin de largeur, pas de densité.
        <div className="grid gap-3 xl:grid-cols-2">
          {filteredItems.map((item, index) => {
            const sectionLabel = sectionsByItemId.get(item._id);
            const previousSectionLabel =
              index > 0
                ? sectionsByItemId.get(filteredItems[index - 1]._id)
                : null;
            const showSection =
              sectionLabel && sectionLabel !== previousSectionLabel;

            return (
              <div key={item._id} className="contents">
                {showSection && (
                  <h2 className="col-span-full mt-3 border-b border-primary/20 pb-2 font-heading text-lg font-bold text-foreground first:mt-0">
                    {sectionLabel}
                  </h2>
                )}
                <DishCard
                  item={item}
                  inCart={quantityByItem[item._id] ?? 0}
                  onSelect={handleSelect}
                />
              </div>
            );
          })}
        </div>
      )}

      {configuredItem && (
        <ProductSheet
          // Remonte le composant à chaque produit : l'état initial est posé par
          // les initialiseurs de useState, donc plus aucun effet de remise à
          // zéro, et aucun risque de garder la formule du produit précédent.
          key={`${configuredItem._id}-${sheet?.lineKey ?? "new"}`}
          item={configuredItem}
          optionsByCategory={optionsByCategory}
          initialLine={editedLine}
          onClose={closeProduct}
        />
      )}
    </>
  );
}
