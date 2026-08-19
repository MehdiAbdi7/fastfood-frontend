"use client";

import { useMemo } from "react";
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

/**
 * Grille des plats, et hôte de la fiche produit.
 *
 * La fiche vit ici et non dans un composant frère : c'est le seul endroit qui
 * détient déjà le menu complet. L'isoler ailleurs obligerait à sérialiser une
 * deuxième fois tout le catalogue dans le payload RSC.
 */
export function DishList({ items, nav }: DishListProps) {
  const dispatch = useAppDispatch();
  const search = useAppSelector(selectSearch);
  const groupLabel = useAppSelector(selectGroupLabel);
  const subCategoryId = useAppSelector(selectSubCategoryId);
  const sheet = useAppSelector(selectProductSheet);

  const { quantityByItem, lines, addLine, openProduct, closeProduct } =
    useCart();

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

    if (!search.trim()) return byCategory;

    // La recherche couvre la description : on retrouve souvent un plat par un
    // ingrédient dont on a oublié le nom.
    const query = search.toLowerCase();
    return byCategory.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query),
    );
  }, [items, nav, groupLabel, subCategoryId, search]);

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
        // Une colonne sur mobile pour laisser respirer les descriptions, deux
        // sur grand écran où la largeur devient excessive pour une seule ligne.
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <DishCard
              key={item._id}
              item={item}
              inCart={quantityByItem[item._id] ?? 0}
              onSelect={handleSelect}
            />
          ))}
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
