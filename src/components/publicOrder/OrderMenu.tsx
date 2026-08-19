"use client";

import { useMemo, useState } from "react";
import { MenuNav } from "./MenuNav";
import { DishCard } from "./DishCard";
import {
  useGetMenuItemsQuery,
  useGetMenuCategoriesQuery,
} from "@/features/menu/menuApi";
import {
  useCategoryGroups,
  type SectionDef,
} from "@/features/menu/useCategoryGroups";
import type { MenuItem } from "@/types/menuItem";

function getCategoryId(item: MenuItem): string {
  return typeof item.category === "object" ? item.category._id : item.category;
}

type CategorySection = Extract<SectionDef, { kind: "category" }>;

export function OrderMenu() {
  const {
    data: menuItems,
    isLoading,
    isError,
    refetch,
  } = useGetMenuItemsQuery();
  const { data: categories } = useGetMenuCategoriesQuery();

  const groups = useCategoryGroups(categories);

  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [subCategoryId, setSubCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Provisoire : remplacé par le slice panier à l'étape 4. Permet de vérifier
  // dès maintenant le rendu de la pastille de quantité.
  const [draftCart, setDraftCart] = useState<Record<string, number>>({});

  const availableItems = useMemo(
    () => (menuItems ?? []).filter((item) => item.available),
    [menuItems],
  );

  const selectedGroup = useMemo(
    () => groups.find((group) => group.label === selectedLabel) ?? null,
    [groups, selectedLabel],
  );

  const subCategories = useMemo<CategorySection[]>(() => {
    if (!selectedGroup?.sectionDefs) return [];
    return selectedGroup.sectionDefs.filter(
      (def): def is CategorySection => def.kind === "category",
    );
  }, [selectedGroup]);

  const countByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of availableItems) {
      const id = getCategoryId(item);
      counts[id] = (counts[id] ?? 0) + 1;
    }
    return counts;
  }, [availableItems]);

  const countByGroup = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const group of groups) {
      counts[group.label] = group.categoryIds.reduce(
        (sum, id) => sum + (countByCategory[id] ?? 0),
        0,
      );
    }
    return counts;
  }, [groups, countByCategory]);

  const filteredItems = useMemo(() => {
    const activeIds = subCategoryId
      ? [subCategoryId]
      : (selectedGroup?.categoryIds ?? null);

    const byCategory = activeIds
      ? availableItems.filter((item) => activeIds.includes(getCategoryId(item)))
      : availableItems;

    if (!search.trim()) return byCategory;

    const query = search.toLowerCase();
    return byCategory.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query),
    );
  }, [availableItems, selectedGroup, subCategoryId, search]);

  function selectGroup(label: string | null) {
    setSelectedLabel(label);
    setSubCategoryId(null);
  }

  function handleSelect(item: MenuItem) {
    // Étape 3 : ouvrira la modale de composition pour les produits à options.
    setDraftCart((prev) => ({
      ...prev,
      [item._id]: (prev[item._id] ?? 0) + 1,
    }));
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <span className="icon-[mdi--wifi-off] text-4xl text-foreground/25" />
        <p className="font-heading text-lg font-bold text-foreground">
          Le menu n&apos;a pas pu être chargé
        </p>
        <p className="max-w-xs text-sm text-foreground/60">
          Vérifiez votre connexion, puis réessayez.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-1 rounded-full bg-primary px-5 py-2.5 font-bold text-on-primary transition-transform hover:scale-105"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="sticky top-17 z-20 -mx-4 flex flex-col gap-3 bg-background/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <label className="relative block">
          <span className="sr-only">Rechercher un plat</span>
          <span className="icon-[mdi--magnify] pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-foreground/40" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Un plat, un ingrédient..."
            className="h-12 w-full rounded-full border border-primary/25 bg-background pl-12 pr-4 text-foreground outline-none transition-colors placeholder:text-foreground/40 focus:border-primary"
          />
        </label>

        <MenuNav
          groups={groups}
          countByGroup={countByGroup}
          totalCount={availableItems.length}
          selectedLabel={selectedLabel}
          onSelect={selectGroup}
          subCategories={subCategories}
          countByCategory={countByCategory}
          selectedSubId={subCategoryId}
          onSelectSub={setSubCategoryId}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl bg-primary/10"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <span className="icon-[mdi--silverware-clean] text-4xl text-foreground/25" />
          <p className="font-heading text-lg font-bold text-foreground">
            Rien ne correspond
          </p>
          <p className="max-w-xs text-sm text-foreground/60">
            Essayez une autre catégorie, ou effacez la recherche.
          </p>
        </div>
      ) : (
        // Une colonne sur mobile pour laisser respirer les descriptions, deux
        // sur grand écran où la largeur devient excessive pour une seule ligne.
        <div className="grid gap-3 lg:grid-cols-2">
          {filteredItems.map((item) => (
            <DishCard
              key={item._id}
              item={item}
              inCart={draftCart[item._id] ?? 0}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
