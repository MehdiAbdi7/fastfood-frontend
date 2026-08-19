"use client";

import type {
  ResolvedGroup,
  SectionDef,
} from "@/features/menu/useCategoryGroups";

type CategorySection = Extract<SectionDef, { kind: "category" }>;

interface MenuNavProps {
  groups: ResolvedGroup[];
  countByGroup: Record<string, number>;
  totalCount: number;
  selectedLabel: string | null;
  onSelect: (label: string | null) => void;
  subCategories: CategorySection[];
  countByCategory: Record<string, number>;
  selectedSubId: string | null;
  onSelectSub: (id: string | null) => void;
}

export function MenuNav({
  groups,
  countByGroup,
  totalCount,
  selectedLabel,
  onSelect,
  subCategories,
  countByCategory,
  selectedSubId,
  onSelectSub,
}: MenuNavProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* top-[68px] : sous la navbar fixe du layout public. Reste accessible
          pendant tout le défilement — sur mobile, remonter en haut pour
          changer de catégorie fait abandonner. */}
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => onSelect(null)}
          className={`shrink-0 rounded-full border px-4 py-2.5 font-heading text-sm font-bold transition-colors ${
            selectedLabel === null
              ? "border-primary bg-primary text-on-primary"
              : "border-primary/25 text-foreground hover:border-primary"
          }`}
        >
          Tout le menu
          <span className="tabular-nums ml-2 text-xs opacity-60">
            {totalCount}
          </span>
        </button>

        {groups.map((group) => (
          <button
            key={group.label}
            onClick={() => onSelect(group.label)}
            className={`shrink-0 rounded-full border px-4 py-2.5 font-heading text-sm font-bold transition-colors ${
              selectedLabel === group.label
                ? "border-primary bg-primary text-on-primary"
                : "border-primary/25 text-foreground hover:border-primary"
            }`}
          >
            {group.label}
            <span className="tabular-nums ml-2 text-xs opacity-60">
              {countByGroup[group.label] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Second niveau : forme volontairement différente (angles doux, souligné
          plutôt que rempli) pour qu'on lise une subdivision, pas un pair. */}
      {subCategories.length > 1 && (
        <div className="scrollbar-hide flex items-center gap-1 overflow-x-auto rounded-xl bg-primary/5 px-2 py-1">
          <span className="icon-[mdi--subdirectory-arrow-right] shrink-0 text-base text-foreground/30" />

          <button
            onClick={() => onSelectSub(null)}
            className={`shrink-0 rounded-lg border-b-2 px-3 py-1.5 text-xs font-bold transition-colors ${
              selectedSubId === null
                ? "border-primary bg-primary/10 text-primary"
                : "border-transparent text-foreground/50 hover:text-foreground"
            }`}
          >
            Tout
          </button>

          {subCategories.map((sub) => (
            <button
              key={sub.categoryId}
              onClick={() => onSelectSub(sub.categoryId)}
              className={`shrink-0 rounded-lg border-b-2 px-3 py-1.5 text-xs font-bold transition-colors ${
                selectedSubId === sub.categoryId
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent text-foreground/50 hover:text-foreground"
              }`}
            >
              {sub.label}
              <span className="tabular-nums ml-1.5 opacity-60">
                {countByCategory[sub.categoryId] ?? 0}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
