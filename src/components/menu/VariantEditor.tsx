"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { MenuItemVariant } from "@/types/menuItem";

interface VariantEditorProps {
  variants: MenuItemVariant[];
  onChange: (variants: MenuItemVariant[]) => void;
}

interface VariantDraft {
  attribute: string;
  value: string;
}

// Défensif comme formatVariantLabel : des produits créés avant le dashboard
// (Postman, imports) peuvent avoir `combination` absent en base — le default
// {} de Mongoose ne s'applique qu'à la création.
function readCombination(variant: MenuItemVariant): VariantDraft {
  const combination = variant.combination ?? {};
  return {
    attribute: Object.keys(combination)[0] ?? "",
    value: Object.values(combination)[0] ?? "",
  };
}

// Chaque variante = un attribut optionnel (ex: "taille") + sa valeur (ex: "M")
// + un prix. Les deux champs vides = variante "Standard" (combination: {}),
// ce qui est le cas normal d'une boisson ou d'un produit à format unique.
//
// La saisie est conservée dans un état local séparé : `combination` ne peut
// représenter qu'une paire complète, donc s'y fier pendant la frappe reviendrait
// à effacer l'attribut à chaque caractère tant que la valeur reste vide.
export function VariantEditor({ variants, onChange }: VariantEditorProps) {
  const [drafts, setDrafts] = useState<VariantDraft[]>(() =>
    variants.map(readCombination),
  );

  // Filet si le parent remplace la liste (ouverture sur un autre produit) :
  // on retombe sur ce que dit la base plutôt que d'afficher un brouillon
  // appartenant au produit précédent.
  const rows =
    drafts.length === variants.length ? drafts : variants.map(readCombination);

  function commit(nextDrafts: VariantDraft[], nextVariants: MenuItemVariant[]) {
    setDrafts(nextDrafts);
    onChange(nextVariants);
  }

  function updateDraft(index: number, patch: Partial<VariantDraft>) {
    const nextDrafts = rows.map((draft, i) =>
      i === index ? { ...draft, ...patch } : draft,
    );

    const nextVariants = variants.map((variant, i) => {
      if (i !== index) return variant;
      const { attribute, value } = nextDrafts[index]!;
      return {
        // Une paire incomplète n'est pas une variante valide : on la garde en
        // "Standard" côté données, l'utilisateur voit sa saisie dans les inputs.
        combination: attribute && value ? { [attribute]: value } : {},
        price: variant.price,
      };
    });

    commit(nextDrafts, nextVariants);
  }

  function updatePrice(index: number, price: number) {
    onChange(
      variants.map((variant, i) =>
        i === index ? { ...variant, price } : variant,
      ),
    );
  }

  function addVariant() {
    commit(
      [...rows, { attribute: "", value: "" }],
      [...variants, { combination: {}, price: 0 }],
    );
  }

  function removeVariant(index: number) {
    commit(
      rows.filter((_, i) => i !== index),
      variants.filter((_, i) => i !== index),
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-foreground">
        Variantes / prix
      </label>

      <p className="text-xs text-foreground/50">
        Attribut et valeur sont optionnels : laisse-les vides pour un produit à
        format unique (canette, salade...). Seul le prix est requis.
      </p>

      {rows.map((draft, index) => (
        <div key={index} className="flex flex-col gap-1">
          <div className="flex items-end gap-2">
            <Input
              placeholder="Attribut (ex: taille)"
              value={draft.attribute}
              onChange={(e) =>
                updateDraft(index, { attribute: e.target.value })
              }
              className="flex-1"
            />
            <Input
              placeholder="Valeur (ex: M)"
              value={draft.value}
              onChange={(e) => updateDraft(index, { value: e.target.value })}
              className="flex-1"
            />
            <Input
              type="number"
              min={0}
              placeholder="Prix"
              value={variants[index]?.price || ""}
              onChange={(e) => updatePrice(index, Number(e.target.value))}
              className="w-28"
            />
            <button
              type="button"
              onClick={() => removeVariant(index)}
              aria-label="Retirer cette variante"
              disabled={variants.length <= 1}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-foreground/40 hover:bg-accent-bordeaux/10 hover:text-accent-bordeaux disabled:cursor-not-allowed disabled:opacity-30"
            >
              <span className="icon-[mdi--trash-can-outline] text-lg" />
            </button>
          </div>

          {/* Signale la paire incomplète, qui serait sinon silencieusement
              enregistrée comme "Standard" sans que l'utilisateur comprenne. */}
          {Boolean(draft.attribute) !== Boolean(draft.value) && (
            <p className="text-xs text-accent-mustard">
              Remplis l&apos;attribut ET la valeur, ou laisse les deux vides.
            </p>
          )}
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        icon="icon-[mdi--plus]"
        onClick={addVariant}
      >
        Ajouter une variante
      </Button>
    </div>
  );
}
