/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatDA } from "@/lib/format";
import { formatVariantLabel } from "@/lib/variantLabel";
import {
  getExtraTypeName,
  isExtraSelectable,
  resolveExtraPrice,
} from "@/lib/extraPrice";
import type { MenuExtra, MenuItem, MenuItemVariant } from "@/types/menuItem";
import type { NewCartLine } from "../useItemCart";

// Types d'extras où un seul choix est permis. Le backend ne l'impose pas
// (décision produit : contrainte portée par l'interface), donc c'est ici que
// ça se joue — un tacos ne peut recevoir qu'un seul gratinage.
const SINGLE_CHOICE_TYPES = ["Gratinage"];

interface ProductConfigModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onConfirm: (line: NewCartLine) => void;
}

export function ProductConfigModal({
  item,
  onClose,
  onConfirm,
}: ProductConfigModalProps) {
  const [variantIndex, setVariantIndex] = useState(0);
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  // Remise à zéro à chaque ouverture : sans ça, les extras du produit
  // précédent resteraient cochés sur le suivant.
  useEffect(() => {
    if (!item) return;
    setVariantIndex(0);
    setSelectedExtraIds([]);
    setExcluded([]);
    setQuantity(1);
  }, [item]);

  const variant: MenuItemVariant | undefined = item?.variants[variantIndex];

  // useMemo indispensable : `?? {}` crée un objet neuf à chaque rendu quand
  // `combination` est absent en base. Sans mémoïsation, cette nouvelle
  // référence invalide le useMemo des extras à chaque rendu, qui relance le
  // useEffect de nettoyage, qui refait un setState... boucle infinie.
  const variantSelected = useMemo(() => variant?.combination ?? {}, [variant]);

  // availableExtras est peuplé par le backend (populate) — on écarte les
  // éventuels ID bruts et les extras non applicables à cette variante.
  const extras = useMemo(() => {
    const list = (item?.availableExtras ?? []).filter(
      (extra): extra is MenuExtra => typeof extra === "object",
    );
    return list.filter((extra) => isExtraSelectable(extra, variantSelected));
  }, [item, variantSelected]);

  const extrasByType = useMemo(() => {
    const groups = new Map<string, MenuExtra[]>();
    for (const extra of extras) {
      const typeName = getExtraTypeName(extra);
      const group = groups.get(typeName) ?? [];
      group.push(extra);
      groups.set(typeName, group);
    }
    return [...groups.entries()];
  }, [extras]);

  // Un extra devenu non sélectionnable après changement de variante (ex: on
  // passe d'une taille M à une variante sans taille) doit être décoché, sinon
  // il partirait dans la commande sans prix affiché.
  useEffect(() => {
    setSelectedExtraIds((prev) => {
      const next = prev.filter((id) =>
        extras.some((extra) => extra._id === id),
      );
      // On renvoie `prev` à l'identique quand rien n'a changé : .filter()
      // produit toujours un nouveau tableau, et une nouvelle référence
      // relancerait un rendu, donc cet effet, en boucle.
      return next.length === prev.length ? prev : next;
    });
  }, [extras]);

  if (!item || !variant) return null;

  const selectedExtras = extras
    .filter((extra) => selectedExtraIds.includes(extra._id))
    .map((extra) => ({
      extraId: extra._id,
      name: extra.name,
      price: resolveExtraPrice(extra, variantSelected),
    }));

  const unitPrice =
    variant.price + selectedExtras.reduce((sum, extra) => sum + extra.price, 0);

  function toggleExtra(extra: MenuExtra) {
    const typeName = getExtraTypeName(extra);
    const isSingleChoice = SINGLE_CHOICE_TYPES.includes(typeName);

    setSelectedExtraIds((prev) => {
      if (prev.includes(extra._id)) {
        return prev.filter((id) => id !== extra._id);
      }
      if (isSingleChoice) {
        // Remplace la sélection existante du même type
        const sameTypeIds = extras
          .filter((e) => getExtraTypeName(e) === typeName)
          .map((e) => e._id);
        return [...prev.filter((id) => !sameTypeIds.includes(id)), extra._id];
      }
      return [...prev, extra._id];
    });
  }

  function toggleExcluded(ingredient: string) {
    setExcluded((prev) =>
      prev.includes(ingredient)
        ? prev.filter((i) => i !== ingredient)
        : [...prev, ingredient],
    );
  }

  function handleConfirm() {
    onConfirm({
      menuItemId: item!._id,
      name: item!.name,
      variant: variant!,
      extras: selectedExtras,
      excludedIngredients: excluded,
      quantity,
    });
    onClose();
  }

  return (
    <Modal
      isOpen={item !== null}
      onClose={onClose}
      title={item.name}
      size="md"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-xl bg-surface-2 p-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Diminuer la quantité"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/60 hover:bg-surface hover:text-foreground"
            >
              <span className="icon-[mdi--minus] text-base" />
            </button>
            <span className="tabular-nums w-6 text-center font-bold text-foreground">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Augmenter la quantité"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/60 hover:bg-surface hover:text-foreground"
            >
              <span className="icon-[mdi--plus] text-base" />
            </button>
          </div>

          <Button icon="icon-[mdi--cart-plus]" onClick={handleConfirm}>
            Ajouter · {formatDA(unitPrice * quantity)}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Variantes */}
        {item.variants.length > 1 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-foreground">Choix</p>
            <div className="flex flex-wrap gap-2">
              {item.variants.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setVariantIndex(i)}
                  className={`rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${
                    variantIndex === i
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border-subtle text-foreground/60 hover:text-foreground"
                  }`}
                >
                  {formatVariantLabel(v.combination)}
                  <span className="tabular-nums ml-2 font-normal">
                    {formatDA(v.price)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Extras, groupés par type */}
        {extrasByType.map(([typeName, group]) => (
          <div key={typeName} className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-foreground">
              {typeName}
              {SINGLE_CHOICE_TYPES.includes(typeName) && (
                <span className="ml-2 text-xs font-normal text-foreground/50">
                  un seul choix
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.map((extra) => {
                const isSelected = selectedExtraIds.includes(extra._id);
                const price = resolveExtraPrice(extra, variantSelected);
                return (
                  <button
                    key={extra._id}
                    onClick={() => toggleExtra(extra)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                      isSelected
                        ? "border-accent-green bg-accent-green/10 text-accent-green"
                        : "border-border-subtle text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`${isSelected ? "icon-[mdi--check-circle]" : "icon-[mdi--plus-circle-outline]"} text-base`}
                    />
                    {extra.name}
                    {price > 0 && (
                      <span className="tabular-nums text-xs font-normal">
                        +{formatDA(price)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Ingrédients à retirer */}
        {item.removableIngredients && item.removableIngredients.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-foreground">Retirer</p>
            <div className="flex flex-wrap gap-2">
              {item.removableIngredients.map((ingredient) => {
                const isExcluded = excluded.includes(ingredient);
                return (
                  <button
                    key={ingredient}
                    onClick={() => toggleExcluded(ingredient)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                      isExcluded
                        ? "border-accent-bordeaux bg-accent-bordeaux/10 text-accent-bordeaux line-through"
                        : "border-border-subtle text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`${isExcluded ? "icon-[mdi--close-circle]" : "icon-[mdi--minus-circle-outline]"} text-base`}
                    />
                    {ingredient}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {extrasByType.length === 0 &&
          (!item.removableIngredients ||
            item.removableIngredients.length === 0) &&
          item.variants.length <= 1 && (
            <p className="py-2 text-sm text-foreground/50">
              Aucune option pour ce produit — ajuste la quantité et ajoute-le.
            </p>
          )}
      </div>
    </Modal>
  );
}
