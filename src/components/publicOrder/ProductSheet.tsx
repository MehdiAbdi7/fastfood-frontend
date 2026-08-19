/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Sheet } from "./Sheet";
import { useCart } from "@/features/publicOrder/useCart";
import { formatDA } from "@/lib/format";
import { formatVariantLabel } from "@/lib/variantLabel";
import {
  getExtraTypeName,
  isExtraSelectable,
  resolveExtraPrice,
} from "@/lib/extraPrice";
import { getEligibleFormulas, resolveEffectiveSize } from "@/lib/formulaRules";
import type { CartLine, NewCartLine } from "@/lib/cartLine";
import type { MenuExtra, MenuItem } from "@/types/menuItem";

// Types d'extras où un seul choix est permis. Le backend ne l'impose pas
// (décision produit portée par l'interface) — un tacos ne reçoit qu'un
// seul gratinage.
const SINGLE_CHOICE_TYPES = ["Gratinage"];

interface ProductSheetProps {
  item: MenuItem;
  optionsByCategory: Record<string, string[]>;
  /** Non nul = modification d'une ligne déjà au panier. */
  initialLine: CartLine | null;
  onClose: () => void;
}

type Tone = "primary" | "green" | "mustard";

const TONE_SELECTED: Record<Tone, string> = {
  primary: "border-primary bg-primary/10 text-primary",
  green: "border-accent-green bg-accent-green/10 text-accent-green",
  mustard: "border-accent-mustard bg-accent-mustard/10 text-accent-mustard",
};

function Field({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: { label: string; required?: boolean };
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-baseline gap-2">
        <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-foreground/70">
          {title}
        </h3>
        {hint && (
          <span
            className={`text-xs font-semibold ${
              hint.required ? "text-accent-bordeaux" : "text-foreground/40"
            }`}
          >
            {hint.label}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

// Cible tactile de 44px minimum : tout le monde commande au téléphone, souvent
// debout, souvent d'une main.
function Choice({
  isSelected,
  tone = "primary",
  onClick,
  children,
}: {
  isSelected: boolean;
  tone?: Tone;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`flex min-h-11 items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ${
        isSelected
          ? TONE_SELECTED[tone]
          : "border-border-subtle text-foreground/70 hover:border-primary/50 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function findVariantIndex(item: MenuItem, line: CartLine | null): number {
  if (!line) return 0;
  const target = JSON.stringify(line.variant.combination ?? {});
  const index = item.variants.findIndex(
    (variant) => JSON.stringify(variant.combination ?? {}) === target,
  );
  return index === -1 ? 0 : index;
}

export function ProductSheet({
  item,
  optionsByCategory,
  initialLine,
  onClose,
}: ProductSheetProps) {
  const { addLine, replaceLine, removeLine } = useCart();
  const isEditing = initialLine !== null;

  // Initialiseurs paresseux, pas d'effet de reset : le composant est remonté
  // par sa key à chaque produit (voir DishList).
  const [variantIndex, setVariantIndex] = useState(() =>
    findVariantIndex(item, initialLine),
  );
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>(
    () => initialLine?.extras.map((extra) => extra.extraId) ?? [],
  );
  const [excluded, setExcluded] = useState<string[]>(
    () => initialLine?.excludedIngredients ?? [],
  );
  const [quantity, setQuantity] = useState(() => initialLine?.quantity ?? 1);
  const [formulaId, setFormulaId] = useState<string | null>(
    () => initialLine?.formula?.formulaId ?? null,
  );
  const [formulaChoices, setFormulaChoices] = useState<Record<string, string>>(
    () => initialLine?.formula?.choices ?? {},
  );

  const eligibleFormulas = useMemo(() => getEligibleFormulas(item), [item]);

  const selectedFormula = useMemo(
    () => eligibleFormulas.find((formula) => formula.id === formulaId) ?? null,
    [eligibleFormulas, formulaId],
  );

  const isFixed = selectedFormula?.pricingMode === "fixed";
  const variant = item.variants[variantIndex];

  // useMemo indispensable : `?? {}` crée un objet neuf à chaque rendu, dont la
  // nouvelle référence relancerait le useMemo des extras en boucle.
  const variantSelected = useMemo(
    () => (isFixed ? {} : (variant?.combination ?? {})),
    [isFixed, variant],
  );

  // Chaîne primitive, donc stable d'un rendu à l'autre.
  const effectiveSize = resolveEffectiveSize(selectedFormula, variantSelected);

  const extras = useMemo(() => {
    const list = (item.availableExtras ?? []).filter(
      (extra): extra is MenuExtra => typeof extra === "object",
    );
    return list.filter((extra) => isExtraSelectable(extra, effectiveSize));
  }, [item, effectiveSize]);

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

  // Un extra devenu non sélectionnable après changement de variante ou de
  // formule doit être décoché, sinon il partirait sans prix affiché.
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

  if (!variant) return null;

  const selectedExtras = extras
    .filter((extra) => selectedExtraIds.includes(extra._id))
    .map((extra) => ({
      extraId: extra._id,
      name: extra.name,
      price: resolveExtraPrice(extra, effectiveSize),
    }));

  const extrasTotal = selectedExtras.reduce(
    (sum, extra) => sum + extra.price,
    0,
  );

  const basePrice = isFixed
    ? selectedFormula!.price
    : variant.price + (selectedFormula?.price ?? 0);

  const unitPrice = basePrice + extrasTotal;

  // Le backend refuse une formule dont un choix manque : on bloque avant
  // l'envoi plutôt que de laisser le client se prendre un 400.
  const missingChoice = (selectedFormula?.choices ?? []).some(
    (choice) => !formulaChoices[choice.label],
  );

  // Catégorie vide ou entièrement en rupture : la formule est incommandable.
  const unavailableChoice = (selectedFormula?.choices ?? []).some(
    (choice) => (optionsByCategory[choice.fromCategoryName] ?? []).length === 0,
  );

  const isBlocked = missingChoice || unavailableChoice;

  function selectFormula(id: string | null) {
    setFormulaId(id);
    setFormulaChoices({}); // les choix d'une formule n'ont pas de sens sur l'autre
  }

  function toggleExtra(extra: MenuExtra) {
    const typeName = getExtraTypeName(extra);
    const isSingleChoice = SINGLE_CHOICE_TYPES.includes(typeName);

    setSelectedExtraIds((prev) => {
      if (prev.includes(extra._id)) {
        return prev.filter((id) => id !== extra._id);
      }
      if (isSingleChoice) {
        const sameTypeIds = extras
          .filter((candidate) => getExtraTypeName(candidate) === typeName)
          .map((candidate) => candidate._id);
        return [...prev.filter((id) => !sameTypeIds.includes(id)), extra._id];
      }
      return [...prev, extra._id];
    });
  }

  function toggleExcluded(ingredient: string) {
    setExcluded((prev) =>
      prev.includes(ingredient)
        ? prev.filter((current) => current !== ingredient)
        : [...prev, ingredient],
    );
  }

  function buildLine(): NewCartLine {
    return {
      menuItemId: item._id,
      name: item.name,
      imageUrl: item.imageUrl,
      variant: variant!,
      extras: selectedExtras,
      excludedIngredients: excluded,
      quantity,
      ...(selectedFormula
        ? {
            formula: {
              formulaId: selectedFormula.id,
              name: selectedFormula.name,
              price: selectedFormula.price,
              pricingMode: selectedFormula.pricingMode,
              includes: [
                ...selectedFormula.includedNames,
                ...selectedFormula.choices.map(
                  (choice) => formulaChoices[choice.label]!,
                ),
              ],
              choices: formulaChoices,
            },
          }
        : {}),
    };
  }

  return (
    <Sheet onClose={onClose} labelledBy="product-sheet-title">
      {(close) => {
        function confirm() {
          if (isBlocked) return;
          if (isEditing) replaceLine(initialLine!.key, buildLine());
          else addLine(buildLine());
          close();
        }

        return (
          <>
            {/* ---------- Visuel d'en-tête ---------- */}
            <div className="relative h-100 sm:h-85 w-full shrink-0 overflow-hidden bg-primary/10 ">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="icon-[mdi--food] text-5xl text-primary/30" />
                </div>
              )}

              {/* Dégradé, et non voile uniforme : le titre reste lisible sans
                  ternir la photo, qui est l'argument de vente. */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />

              <button
                type="button"
                onClick={close}
                aria-label="Fermer"
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
              >
                <span className="icon-[mdi--close] text-xl" />
              </button>

              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4">
                <h2
                  id="product-sheet-title"
                  className="font-heading text-2xl font-bold leading-tight text-white"
                >
                  {item.name}
                </h2>
                {item.description && (
                  <p className="text-sm leading-snug text-white/80">
                    {item.description}
                  </p>
                )}
              </div>
            </div>

            {/* ---------- Options ---------- */}
            <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-5">
              {eligibleFormulas.length > 0 && (
                <Field title="Formule">
                  <div className="flex flex-wrap gap-2">
                    <Choice
                      isSelected={formulaId === null}
                      onClick={() => selectFormula(null)}
                    >
                      Seul
                      <span className="tabular-nums text-xs font-normal opacity-70">
                        {formatDA(variant.price)}
                      </span>
                    </Choice>

                    {eligibleFormulas.map((formula) => (
                      <Choice
                        key={formula.id}
                        tone="mustard"
                        isSelected={formulaId === formula.id}
                        onClick={() => selectFormula(formula.id)}
                      >
                        {formula.name}
                        <span className="tabular-nums text-xs font-normal opacity-70">
                          {formula.pricingMode === "fixed"
                            ? formatDA(formula.price)
                            : `+${formatDA(formula.price)}`}
                        </span>
                      </Choice>
                    ))}
                  </div>

                  {selectedFormula &&
                    selectedFormula.includedNames.length > 0 && (
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-accent-green">
                        <span className="icon-[mdi--check-circle] text-sm" />
                        Inclus : {selectedFormula.includedNames.join(", ")}
                      </p>
                    )}
                </Field>
              )}

              {/* Choix imposés par la formule (boisson...) — les options
                  viennent du menu réel, pas d'une liste figée. */}
              {(selectedFormula?.choices ?? []).map((choice) => {
                const options =
                  optionsByCategory[choice.fromCategoryName] ?? [];

                return (
                  <Field
                    key={choice.label}
                    title={choice.label}
                    hint={{ label: "à choisir", required: true }}
                  >
                    {options.length === 0 ? (
                      <p className="rounded-xl bg-accent-bordeaux/10 px-3 py-2 text-xs text-accent-bordeaux">
                        Aucune option disponible pour le moment. Choisissez une
                        autre formule.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {options.map((option) => (
                          <Choice
                            key={option}
                            tone="green"
                            isSelected={formulaChoices[choice.label] === option}
                            onClick={() =>
                              setFormulaChoices((prev) => ({
                                ...prev,
                                [choice.label]: option,
                              }))
                            }
                          >
                            {option}
                          </Choice>
                        ))}
                      </div>
                    )}
                  </Field>
                );
              })}

              {/* Variantes — masquées quand la formule impose un format unique */}
              {!isFixed && item.variants.length > 1 && (
                <Field title="Taille">
                  <div className="flex flex-wrap gap-2">
                    {item.variants.map((current, index) => (
                      <Choice
                        key={index}
                        isSelected={variantIndex === index}
                        onClick={() => setVariantIndex(index)}
                      >
                        {formatVariantLabel(current.combination)}
                        <span className="tabular-nums text-xs font-normal opacity-70">
                          {formatDA(current.price)}
                        </span>
                      </Choice>
                    ))}
                  </div>
                </Field>
              )}

              {isFixed && item.variants.length > 1 && (
                <p className="rounded-xl bg-surface-2 px-3 py-2 text-xs text-foreground/60">
                  Format unique en {selectedFormula!.name} — pas de taille à
                  choisir.
                </p>
              )}

              {extrasByType.map(([typeName, group]) => (
                <Field
                  key={typeName}
                  title={typeName}
                  hint={
                    SINGLE_CHOICE_TYPES.includes(typeName)
                      ? { label: "un seul choix" }
                      : { label: "facultatif" }
                  }
                >
                  <div className="flex flex-wrap gap-2">
                    {group.map((extra) => {
                      const isSelected = selectedExtraIds.includes(extra._id);
                      const price = resolveExtraPrice(extra, effectiveSize);

                      return (
                        <Choice
                          key={extra._id}
                          tone="green"
                          isSelected={isSelected}
                          onClick={() => toggleExtra(extra)}
                        >
                          <span
                            className={`${
                              isSelected
                                ? "icon-[mdi--check-circle]"
                                : "icon-[mdi--plus-circle-outline]"
                            } text-base`}
                          />
                          {extra.name}
                          {price > 0 && (
                            <span className="tabular-nums text-xs font-normal opacity-70">
                              +{formatDA(price)}
                            </span>
                          )}
                        </Choice>
                      );
                    })}
                  </div>
                </Field>
              ))}

              {item.removableIngredients &&
                item.removableIngredients.length > 0 && (
                  <Field title="Retirer" hint={{ label: "facultatif" }}>
                    <div className="flex flex-wrap gap-2">
                      {item.removableIngredients.map((ingredient) => {
                        const isExcluded = excluded.includes(ingredient);

                        return (
                          <button
                            key={ingredient}
                            type="button"
                            onClick={() => toggleExcluded(ingredient)}
                            aria-pressed={isExcluded}
                            className={`flex min-h-11 items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ${
                              isExcluded
                                ? "border-accent-bordeaux bg-accent-bordeaux/10 text-accent-bordeaux line-through"
                                : "border-border-subtle text-foreground/70 hover:border-primary/50"
                            }`}
                          >
                            <span
                              className={`${
                                isExcluded
                                  ? "icon-[mdi--close-circle]"
                                  : "icon-[mdi--minus-circle-outline]"
                              } text-base`}
                            />
                            {ingredient}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                )}

              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    removeLine(initialLine!.key);
                    close();
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-accent-bordeaux/30 py-3 text-sm font-bold text-accent-bordeaux transition-colors hover:bg-accent-bordeaux/10"
                >
                  <span className="icon-[mdi--trash-can-outline] text-base" />
                  Retirer du panier
                </button>
              )}
            </div>

            {/* ---------- Pied fixe : quantité + ajout ---------- */}
            <div
              className="flex shrink-0 items-center gap-3 border-t border-border-subtle bg-background p-4"
              style={{
                paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
              }}
            >
              <div className="flex shrink-0 items-center gap-1 rounded-xl bg-surface-2 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Diminuer la quantité"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground/70 transition-colors hover:bg-background disabled:opacity-30"
                >
                  <span className="icon-[mdi--minus] text-lg" />
                </button>
                <span className="tabular-nums w-7 text-center font-heading text-base font-bold text-foreground">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Augmenter la quantité"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground/70 transition-colors hover:bg-background"
                >
                  <span className="icon-[mdi--plus] text-lg" />
                </button>
              </div>

              <button
                type="button"
                onClick={confirm}
                disabled={isBlocked}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 font-bold text-on-primary transition-all hover:bg-accent-slate active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
              >
                {missingChoice ? (
                  "Choisissez d'abord vos options"
                ) : (
                  <>
                    {isEditing ? "Mettre à jour" : "Ajouter"}
                    <span className="tabular-nums">
                      · {formatDA(unitPrice * quantity)}
                    </span>
                  </>
                )}
              </button>
            </div>
          </>
        );
      }}
    </Sheet>
  );
}
