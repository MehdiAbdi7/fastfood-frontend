"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { MenuItemVariant } from "@/types/menuItem";

interface VariantEditorProps {
  variants: MenuItemVariant[];
  onChange: (variants: MenuItemVariant[]) => void;
}

// Défensif comme formatVariantLabel : des produits créés avant le dashboard
// (Postman, imports) peuvent avoir `combination` absent en base — le default
// {} de Mongoose ne s'applique qu'à la création. Object.keys(undefined) lève
// une exception qui casse toute la modale d'édition.
function readCombination(
  variant: MenuItemVariant,
): { attribute: string; value: string } {
  const combination = variant.combination ?? {};
  return {
    attribute: Object.keys(combination)[0] ?? "",
    value: Object.values(combination)[0] ?? "",
  };
}

// Chaque variante = un attribut optionnel (ex: "taille") + sa valeur (ex: "M")
// + un prix. Un attribut vide = variante "Standard" (combination: {}).
// Couvre tous les cas présents dans le menu actuel (une seule dimension de
// variation à la fois) ; une combinaison multi-attributs resterait éditable
// uniquement via l'API directement si un jour le besoin apparaît.
export function VariantEditor({ variants, onChange }: VariantEditorProps) {
  function updateVariant(
    index: number,
    patch: Partial<{ attribute: string; value: string; price: number }>,
  ) {
    const next = variants.map((variant, i) => {
      if (i !== index) return variant;

      const current = readCombination(variant);
      const attribute = patch.attribute ?? current.attribute;
      const value = patch.value ?? current.value;
      const price = patch.price ?? variant.price;

      return {
        combination: attribute && value ? { [attribute]: value } : {},
        price,
      };
    });
    onChange(next);
  }

  function addVariant() {
    onChange([...variants, { combination: {}, price: 0 }]);
  }

  function removeVariant(index: number) {
    onChange(variants.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-foreground">Variantes / prix</label>

      {variants.map((variant, index) => {
        const { attribute, value } = readCombination(variant);

        return (
          <div key={index} className="flex items-end gap-2">
            <Input
              placeholder="Attribut (ex: taille)"
              value={attribute}
              onChange={(e) => updateVariant(index, { attribute: e.target.value, value })}
              className="flex-1"
            />
            <Input
              placeholder="Valeur (ex: M)"
              value={value}
              onChange={(e) => updateVariant(index, { attribute, value: e.target.value })}
              className="flex-1"
            />
            <Input
              type="number"
              min={0}
              placeholder="Prix"
              value={variant.price || ""}
              onChange={(e) => updateVariant(index, { price: Number(e.target.value) })}
              className="w-28"
            />
            <button
              type="button"
              onClick={() => removeVariant(index)}
              aria-label="Retirer cette variante"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-foreground/40 hover:bg-accent-bordeaux/10 hover:text-accent-bordeaux"
            >
              <span className="icon-[mdi--trash-can-outline] text-lg" />
            </button>
          </div>
        );
      })}

      <Button type="button" variant="secondary" size="sm" icon="icon-[mdi--plus]" onClick={addVariant}>
        Ajouter une variante
      </Button>
    </div>
  );
}
