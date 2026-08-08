// src/app/(public)/commande/page.tsx

"use client";

import { useState, useMemo } from "react";
import {
  useGetMenuCategoriesQuery,
  useGetMenuItemsQuery,
} from "@/features/menu/menuApi";
import {
  useCategoryGroups,
  type SectionDef,
} from "@/features/menu/useCategoryGroups";
import { CategoryTabs } from "@/components/public/CategoryTabs";
import { BestSellerCard } from "@/components/public/BestSellerCard";
import type { MenuItem } from "@/types/menuItem";

function getCategoryId(item: MenuItem): string {
  return typeof item.category === "string" ? item.category : item.category._id;
}

export default function CommandePage() {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useGetMenuCategoriesQuery();

  const {
    data: menuItems,
    isLoading: isItemsLoading,
    isError: isItemsError,
  } = useGetMenuItemsQuery();

  const groups = useCategoryGroups(categories);

  const selectedGroup = useMemo(
    () => groups.find((g) => g.label === selectedLabel) ?? null,
    [groups, selectedLabel],
  );

  const availableItems = useMemo(
    () => (menuItems ?? []).filter((item) => item.available),
    [menuItems],
  );

  // Items appartenant au tab sélectionné (ou tout le menu si aucun tab choisi)
  const itemsInTab = useMemo(() => {
    if (selectedGroup === null) return availableItems;
    const ids = new Set(selectedGroup.categoryIds);
    return availableItems.filter((item) => ids.has(getCategoryId(item)));
  }, [availableItems, selectedGroup]);

  // Répartition en sections si le groupe en définit, avec un fallback "Autres"
  // pour ne jamais perdre silencieusement un item qui ne matche aucun mot-clé.
  // Chaque item n'est assigné qu'à UNE seule section (premier match gagne),
  // pour éviter les doublons quand une description matche plusieurs mots-clés.
  const sections = useMemo(() => {
    if (!selectedGroup?.sectionDefs) return null;

    const defs = selectedGroup.sectionDefs;
    const matchedIds = new Set<string>();

    const built = defs.map((def: SectionDef) => {
      const items = itemsInTab.filter((item) => {
        if (matchedIds.has(item._id)) return false;

        const matches =
          def.kind === "category"
            ? getCategoryId(item) === def.categoryId
            : def.test(item);

        if (matches) matchedIds.add(item._id);
        return matches;
      });
      return { label: def.label, items };
    });

    const leftovers = itemsInTab.filter((item) => !matchedIds.has(item._id));
    if (leftovers.length > 0) {
      built.push({ label: "Autres", items: leftovers });
    }

    return built.filter((section) => section.items.length > 0);
  }, [itemsInTab, selectedGroup]);

  const isLoading = isCategoriesLoading || isItemsLoading;
  const isError = isCategoriesError || isItemsError;
  const isEmpty = sections ? sections.length === 0 : itemsInTab.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <span className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
          Notre carte
        </span>
        <h1 className="font-heading text-3xl font-bold text-accent-green sm:text-4xl">
          Composez votre commande
        </h1>
        <p className="max-w-md text-sm text-foreground/80">
          Sur place, à emporter ou en livraison — choisissez ce qui vous plaît.
        </p>
      </div>

      {isCategoriesLoading ? (
        <p className="mb-8 text-center text-sm text-foreground/60">
          Chargement des catégories...
        </p>
      ) : isCategoriesError ? (
        <p className="mb-8 text-center text-sm text-accent-bordeaux">
          Impossible de charger les catégories.
        </p>
      ) : (
        <div className="mb-10">
          <CategoryTabs
            groups={groups}
            selectedLabel={selectedLabel}
            onSelect={setSelectedLabel}
          />
        </div>
      )}

      {isItemsLoading && (
        <p className="text-center text-sm text-foreground/60">
          Chargement du menu...
        </p>
      )}

      {isItemsError && (
        <p className="text-center text-sm text-accent-bordeaux">
          Erreur lors du chargement du menu. Vérifie que le backend tourne et
          que CORS_ORIGIN est bien configuré.
        </p>
      )}

      {!isLoading && !isError && isEmpty && (
        <p className="text-center text-sm text-foreground/60">
          Aucun produit disponible dans cette catégorie pour le moment.
        </p>
      )}

      {/* Tab avec sections (Burgers/Tacos/Pizzas) -> titres + séparations visuelles */}
      {!isLoading && !isError && sections && sections.length > 0 && (
        <div className="flex flex-col gap-10">
          {sections.map((section) => (
            <div key={section.label}>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
                  {section.label}
                </h2>
                <div className="h-px flex-1 bg-primary/20" />
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {section.items.map((item) => (
                  <BestSellerCard key={item._id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* "Tout le menu" ou tab simple -> grille plate */}
      {!isLoading && !isError && !sections && itemsInTab.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {itemsInTab.map((item) => (
            <BestSellerCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
