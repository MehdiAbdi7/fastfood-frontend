"use client";

import { useMemo, useState } from "react";
import { useGetMenuItemsQuery } from "@/features/menu/menuApi";
import { useAddItemsToOrderMutation } from "@/features/orders/orderApi";
import { useToast } from "@/features/toast/useToast";
import { getApiErrorMessage } from "@/lib/apiError";
import { formatDA } from "@/lib/format";
import { formatVariantLabel } from "@/lib/variantLabel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { CreateOrderItemPayload } from "@/types/order";
import type { MenuItemVariant } from "@/types/menuItem";

interface CartLine {
  key: string;
  menuItemId: string;
  name: string;
  variant: MenuItemVariant;
  quantity: number;
}

interface AddItemsPanelProps {
  orderId: string;
  onDone: () => void;
}

// Ajout rapide volontairement simplifié : pas d'extras ni d'ingrédients exclus
// depuis le dashboard (ça reste la logique de personnalisation du client sur
// /commande). Utile pour un oubli, un article ajouté à table, etc.
export function AddItemsPanel({ orderId, onDone }: AddItemsPanelProps) {
  const { data: menuItems, isLoading } = useGetMenuItemsQuery();
  const [addItems, { isLoading: isSubmitting }] = useAddItemsToOrderMutation();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);

  const filteredItems = useMemo(() => {
    const available = (menuItems ?? []).filter((item) => item.available);
    if (!search.trim()) return available;
    const query = search.toLowerCase();
    return available.filter((item) => item.name.toLowerCase().includes(query));
  }, [menuItems, search]);

  function addToCart(menuItemId: string, name: string, variant: MenuItemVariant) {
    const key = `${menuItemId}-${JSON.stringify(variant.combination)}`;
    setCart((prev) => {
      const existing = prev.find((line) => line.key === key);
      if (existing) {
        return prev.map((line) =>
          line.key === key ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [...prev, { key, menuItemId, name, variant, quantity: 1 }];
    });
  }

  function removeFromCart(key: string) {
    setCart((prev) => prev.filter((line) => line.key !== key));
  }

  async function handleSubmit() {
    if (cart.length === 0) return;

    const payload: CreateOrderItemPayload[] = cart.map((line) => ({
      menuItemId: line.menuItemId,
      variantSelected: line.variant.combination,
      selectedExtras: [],
      excludedIngredients: [],
      quantity: line.quantity,
      isKidsMenu: false,
    }));

    try {
      await addItems({ id: orderId, items: payload }).unwrap();
      toast.success("Articles ajoutés à la commande");
      onDone();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Impossible d'ajouter ces articles"));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Rechercher un produit..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading && <p className="text-sm text-foreground/50">Chargement du menu...</p>}

      <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto">
        {filteredItems.map((item) => (
          <div
            key={item._id}
            className="flex items-center justify-between gap-2 rounded-xl border border-border-subtle px-3 py-2"
          >
            <span className="truncate text-sm font-semibold text-foreground">
              {item.name}
            </span>
            <div className="flex shrink-0 gap-1.5">
              {item.variants.map((variant, i) => (
                <button
                  key={i}
                  onClick={() => addToCart(item._id, item.name, variant)}
                  className="flex items-center gap-1 rounded-lg bg-surface-2 px-2 py-1 text-xs font-bold text-foreground/80 hover:bg-primary/15 hover:text-primary"
                >
                  <span className="icon-[mdi--plus] text-sm" />
                  {formatVariantLabel(variant.combination)} · {formatDA(variant.price)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl bg-surface-2 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-foreground/50">
            À ajouter
          </p>
          {cart.map((line) => (
            <div key={line.key} className="flex items-center justify-between text-sm">
              <span className="text-foreground/80">
                {line.quantity}x {line.name}
                {line.variant.combination &&
                Object.keys(line.variant.combination).length > 0
                  ? ` (${formatVariantLabel(line.variant.combination)})`
                  : ""}
              </span>
              <button
                onClick={() => removeFromCart(line.key)}
                aria-label="Retirer"
                className="text-foreground/40 hover:text-accent-bordeaux"
              >
                <span className="icon-[mdi--close] text-base" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onDone}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={cart.length === 0}
          isLoading={isSubmitting}
        >
          Ajouter à la commande
        </Button>
      </div>
    </div>
  );
}
