"use client";

import { useState } from "react";
import { useGetMenuItemsQuery } from "@/features/menu/menuApi";
import { useDeleteMenuItemMutation } from "@/features/menu/menuItemApi";
import { useToast } from "@/features/toast/useToast";
import { getApiErrorMessage } from "@/lib/apiError";
import { formatDA } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { MenuItemFormModal } from "./MenuItemFormModal";
import type { MenuItem } from "@/types/menuItem";

export function MenuItemsTab() {
  const { data: items, isLoading, isError } = useGetMenuItemsQuery();
  const [deleteItem, { isLoading: isDeleting }] = useDeleteMenuItemMutation();
  const toast = useToast();

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);

  async function handleDelete() {
    if (!deletingItem) return;
    try {
      await deleteItem(deletingItem._id).unwrap();
      toast.success("Produit supprimé");
      setDeletingItem(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Impossible de supprimer ce produit"));
    }
  }

  if (isLoading) return <SkeletonGrid count={8} />;
  if (isError) {
    return <EmptyState icon="icon-[mdi--cloud-off-outline]" title="Impossible de charger le menu" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button icon="icon-[mdi--plus]" onClick={() => setIsCreating(true)}>
          Nouveau produit
        </Button>
      </div>

      {!items || items.length === 0 ? (
        <EmptyState icon="icon-[mdi--food-outline]" title="Aucun produit" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const categoryName =
              typeof item.category === "object" ? item.category.name : "";
            const minPrice = Math.min(...item.variants.map((v) => v.price));

            return (
              <div
                key={item._id}
                className={`flex gap-3 rounded-2xl border p-3 ${
                  item.available
                    ? "border-border-subtle bg-surface"
                    : "border-border-subtle bg-surface opacity-60"
                }`}
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="icon-[mdi--food] text-2xl text-foreground/30" />
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <p className="truncate text-sm font-bold text-foreground">{item.name}</p>
                    <p className="text-xs text-foreground/50">{categoryName}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-accent-green">
                      {item.variants.length > 1 ? "dès " : ""}
                      {formatDA(minPrice)}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingItem(item)}
                        aria-label="Modifier"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-foreground/50 hover:bg-surface-2 hover:text-foreground"
                      >
                        <span className="icon-[mdi--pencil-outline] text-sm" />
                      </button>
                      <button
                        onClick={() => setDeletingItem(item)}
                        aria-label="Supprimer"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-foreground/50 hover:bg-accent-bordeaux/10 hover:text-accent-bordeaux"
                      >
                        <span className="icon-[mdi--trash-can-outline] text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <MenuItemFormModal isOpen={isCreating} onClose={() => setIsCreating(false)} item={null} />
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
