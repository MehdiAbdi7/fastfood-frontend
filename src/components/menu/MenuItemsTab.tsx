"use client";

import { useMemo, useState } from "react";
import {
  useGetMenuItemsQuery,
  useGetMenuCategoriesQuery,
} from "@/features/menu/menuApi";
import { useDeleteMenuItemMutation } from "@/features/menu/menuItemApi";
import { useAuth } from "@/features/auth/useAuth";
import { useToast } from "@/features/toast/useToast";
import { getApiErrorMessage } from "@/lib/apiError";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { MenuItemFormModal } from "./MenuItemFormModal";
import { MenuItemCard } from "./MenuItemCard";
import type { MenuItem } from "@/types/menuItem";

function getCategoryId(item: MenuItem): string {
  return typeof item.category === "object" ? item.category._id : item.category;
}

export function MenuItemsTab() {
  const { isAdmin } = useAuth();
  const { data: items, isLoading, isError } = useGetMenuItemsQuery();
  const { data: categories } = useGetMenuCategoriesQuery();
  const [deleteItem, { isLoading: isDeleting }] = useDeleteMenuItemMutation();
  const toast = useToast();

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const countByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items ?? []) {
      const id = getCategoryId(item);
      counts[id] = (counts[id] ?? 0) + 1;
    }
    return counts;
  }, [items]);

  const filteredItems = useMemo(() => {
    const byCategory = categoryId
      ? (items ?? []).filter((item) => getCategoryId(item) === categoryId)
      : (items ?? []);

    if (!search.trim()) return byCategory;

    // La recherche couvre aussi la description : c'est souvent par un
    // ingrédient qu'on retrouve un produit dont on a oublié le nom.
    const query = search.toLowerCase();
    return byCategory.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query),
    );
  }, [items, categoryId, search]);

  async function handleDelete() {
    if (!deletingItem) return;
    try {
      await deleteItem(deletingItem._id).unwrap();
      toast.success("Produit supprimé");
      setDeletingItem(null);
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, "Impossible de supprimer ce produit"),
      );
    }
  }

  if (isLoading) return <SkeletonGrid count={8} />;

  if (isError) {
    return (
      <EmptyState
        icon="icon-[mdi--cloud-off-outline]"
        title="Impossible de charger le menu"
        description="Vérifie ta connexion, puis recharge la page."
      />
    );
  }

  const activeCategories = (categories ?? []).filter((c) => c.isActive);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Rechercher un produit ou un ingrédient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:w-72"
        />
        {isAdmin && (
          <Button
            icon="icon-[mdi--plus]"
            onClick={() => setIsCreating(true)}
            className="shrink-0"
          >
            Nouveau produit
          </Button>
        )}
      </div>

      {/* Le compte par catégorie évite d'ouvrir un filtre vide — l'information
          est donnée avant le clic, pas après. */}
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        <button
          onClick={() => setCategoryId(null)}
          className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
            categoryId === null
              ? "border-primary bg-primary text-on-primary"
              : "border-border-subtle bg-surface text-foreground/70 hover:border-primary hover:text-foreground"
          }`}
        >
          Tous
          <span
            className={`tabular-nums rounded-full px-1.5 text-xs ${
              categoryId === null
                ? "bg-on-primary/20"
                : "bg-surface-2 text-foreground/50"
            }`}
          >
            {items?.length ?? 0}
          </span>
        </button>

        {activeCategories.map((category) => (
          <button
            key={category._id}
            onClick={() => setCategoryId(category._id)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
              categoryId === category._id
                ? "border-primary bg-primary text-on-primary"
                : "border-border-subtle bg-surface text-foreground/70 hover:border-primary hover:text-foreground"
            }`}
          >
            {category.name}
            <span
              className={`tabular-nums rounded-full px-1.5 text-xs ${
                categoryId === category._id
                  ? "bg-on-primary/20"
                  : "bg-surface-2 text-foreground/50"
              }`}
            >
              {countByCategory[category._id] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={
            search ? "icon-[mdi--magnify-close]" : "icon-[mdi--food-outline]"
          }
          title={search ? "Aucun résultat" : "Aucun produit"}
          description={
            search
              ? "Change de catégorie ou vide la recherche."
              : isAdmin
                ? "Ajoute ton premier produit pour commencer."
                : undefined
          }
          action={
            !search &&
            isAdmin && (
              <Button
                icon="icon-[mdi--plus]"
                onClick={() => setIsCreating(true)}
              >
                Nouveau produit
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item._id}
              item={item}
              isAdmin={isAdmin}
              onEdit={() => setEditingItem(item)}
              onDelete={() => setDeletingItem(item)}
            />
          ))}
        </div>
      )}

      <MenuItemFormModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        item={null}
      />
      <MenuItemFormModal
        isOpen={editingItem !== null}
        onClose={() => setEditingItem(null)}
        item={editingItem}
      />
      <ConfirmDialog
        isOpen={deletingItem !== null}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title={`Supprimer "${deletingItem?.name}" ?`}
        description="Le produit et son image associée seront définitivement supprimés."
        confirmLabel="Supprimer"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
