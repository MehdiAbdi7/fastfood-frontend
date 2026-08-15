"use client";

import { useMemo, useState } from "react";
import { CategoryChips } from "./CategoryChips";
import { ProductGrid } from "./ProductGrid";
import { Input } from "@/components/ui/Input";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { useGetMenuItemsQuery, useGetMenuCategoriesQuery } from "@/features/menu/menuApi";
import type { MenuItem } from "@/types/menuItem";

function getCategoryId(item: MenuItem): string {
  return typeof item.category === "object" ? item.category._id : item.category;
}

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

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const availableItems = useMemo(
    () => (menuItems ?? []).filter((item) => item.available),
    [menuItems],
  );

  const countByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of availableItems) {
      const id = getCategoryId(item);
      counts[id] = (counts[id] ?? 0) + 1;
    }
    return counts;
  }, [availableItems]);

  const filteredItems = useMemo(() => {
    const byCategory = categoryId
      ? availableItems.filter((item) => getCategoryId(item) === categoryId)
      : availableItems;
    if (!search.trim()) return byCategory;
    const query = search.toLowerCase();
    return byCategory.filter((item) => item.name.toLowerCase().includes(query));
  }, [availableItems, categoryId, search]);

  return (
    <>
      {/* Recherche et catégories restent visibles pendant qu'on parcourt la
          grille : en plein service, remonter chercher un filtre coûte cher. */}
      <div className="sticky top-16 z-10 -mx-1 mb-5 flex flex-col gap-3 bg-background/95 px-1 py-3 backdrop-blur-sm">
        <Input
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <CategoryChips
          categories={(categories ?? []).filter((c) => c.isActive)}
          countByCategory={countByCategory}
          totalCount={availableItems.length}
          selectedId={categoryId}
          onSelect={setCategoryId}
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
