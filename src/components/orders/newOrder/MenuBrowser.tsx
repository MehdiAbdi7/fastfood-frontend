"use client";

import { useMemo, useState } from "react";
import { CategoryChips } from "./CategoryChips";
import { ProductGrid } from "./ProductGrid";
import { Input } from "@/components/ui/Input";
import { SkeletonGrid } from "@/components/ui/Skeleton";
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

interface MenuBrowserProps {
  quantityByItem: Record<string, number>;
  onSelect: (item: MenuItem) => void;
}

// Partagé entre la prise de commande (/commandes/nouvelle) et l'ajout
// d'articles à une commande existante (/commandes/[id]/ajouter) : même
// parcours produit dans les deux cas, une seule implémentation à maintenir.
export function MenuBrowser({ quantityByItem, onSelect }: MenuBrowserProps) {
  const { data: menuItems, isLoading } = useGetMenuItemsQuery();
  const { data: categories } = useGetMenuCategoriesQuery();

  // Même source de vérité que la carte publique et la page Menu : un groupe
  // déclaré dans categoryGroups.ts se répercute partout sans reconfiguration.
  const groups = useCategoryGroups(categories);

  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [subCategoryId, setSubCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const availableItems = useMemo(
    () => (menuItems ?? []).filter((item) => item.available),
    [menuItems],
  );

  const selectedGroup = useMemo(
    () => groups.find((group) => group.label === selectedLabel) ?? null,
    [groups, selectedLabel],
  );

  // Seules les sections de type "category" donnent des sous-chips : celles de
  // type "predicate" (Pizzas, découpées par mot-clé de description) ne
  // correspondent à aucune catégorie assignable à un produit.
  const subCategories = useMemo<CategorySection[]>(() => {
    if (!selectedGroup?.sectionDefs) return [];
    return selectedGroup.sectionDefs.filter(
      (def): def is CategorySection => def.kind === "category",
    );
  }, [selectedGroup]);

  // Comptes sur les seuls produits disponibles : un article épuisé n'est pas
  // commandable, inutile d'ouvrir une catégorie qui semble pleine pour n'y
  // trouver rien de sélectionnable.
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
    // Une sous-catégorie choisie restreint au seul id ; sinon on prend tout le
    // groupe ; sinon tout le menu.
    const activeIds = subCategoryId
      ? [subCategoryId]
      : (selectedGroup?.categoryIds ?? null);

    const byCategory = activeIds
      ? availableItems.filter((item) => activeIds.includes(getCategoryId(item)))
      : availableItems;

    if (!search.trim()) return byCategory;

    // La recherche couvre aussi la description : c'est souvent par un
    // ingrédient qu'on retrouve un produit dont on a oublié le nom.
    const query = search.toLowerCase();
    return byCategory.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query),
    );
  }, [availableItems, selectedGroup, subCategoryId, search]);

  // Changer de groupe doit vider la sous-sélection, sinon un id de Canettes
  // resterait actif en passant sur Burgers, et la grille serait vide.
  function selectGroup(label: string | null) {
    setSelectedLabel(label);
    setSubCategoryId(null);
  }

  return (
    <>
      {/* Recherche et catégories restent visibles pendant qu'on parcourt la
          grille : en plein service, remonter chercher un filtre coûte cher. */}
      <div className="sticky top-16 z-10 -mx-1 mb-5 flex flex-col gap-3 bg-background/95 px-1 py-3 backdrop-blur-sm">
        <Input
          placeholder="Rechercher un produit ou un ingrédient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <CategoryChips
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
        <SkeletonGrid count={8} />
      ) : (
        <ProductGrid
          items={filteredItems}
          quantityByItem={quantityByItem}
          onSelect={onSelect}
        />
      )}
    </>
  );
}
