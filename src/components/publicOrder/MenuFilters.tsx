"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  groupSelected,
  searchChanged,
  selectGroupLabel,
  selectSearch,
  selectSubCategoryId,
  subCategorySelected,
} from "@/features/publicOrder/browseSlice";
import type { MenuNavGroup } from "@/features/menu/menuNav";

interface MenuFiltersProps {
  nav: MenuNavGroup[];
}

// Niveau 1 : pilule pleine. C'est le repère principal.
function GroupTab({
  label,
  count,
  isSelected,
  onClick,
}: {
  label: string;
  count: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`shrink-0 rounded-full border px-4 py-2.5 font-heading text-sm font-bold transition-colors ${
        isSelected
          ? "border-primary bg-primary text-on-primary"
          : "border-primary/25 text-foreground hover:border-primary"
      }`}
    >
      {label}
      <span className="tabular-nums ml-2 text-xs opacity-60">{count}</span>
    </button>
  );
}

// Niveau 2 : forme volontairement différente (angles doux, souligné plutôt que
// rempli) pour qu'on lise une subdivision, pas un pair.
function SubTab({
  label,
  count,
  isSelected,
  onClick,
}: {
  label: string;
  count: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`shrink-0 rounded-lg border-b-2 px-3 py-1.5 text-xs font-bold transition-colors ${
        isSelected
          ? "border-primary bg-primary/10 text-primary"
          : "border-transparent text-foreground/50 hover:text-foreground"
      }`}
    >
      {label}
      {count > 0 && (
        <span className="tabular-nums ml-1.5 opacity-60">{count}</span>
      )}
    </button>
  );
}

export function MenuFilters({ nav }: MenuFiltersProps) {
  const dispatch = useAppDispatch();
  const search = useAppSelector(selectSearch);
  const groupLabel = useAppSelector(selectGroupLabel);
  const subCategoryId = useAppSelector(selectSubCategoryId);

  const activeGroup = nav.find((group) => group.label === groupLabel) ?? null;
  const totalCount = nav.reduce((sum, group) => sum + group.count, 0);

  return (
    // top-17 : juste sous la navbar fixe du layout public. Reste accessible
    // pendant tout le défilement — sur mobile, devoir remonter en haut pour
    // changer de catégorie fait abandonner.
    <div className="sticky top-17 z-20 -mx-4 mb-5 flex flex-col gap-3 bg-background/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
      <label className="relative block">
        <span className="sr-only">Rechercher un plat</span>
        <span className="icon-[mdi--magnify] pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-foreground/40" />
        <input
          type="search"
          value={search}
          onChange={(event) => dispatch(searchChanged(event.target.value))}
          placeholder="Un plat, un ingrédient..."
          className="h-12 w-full rounded-full border border-primary/25 bg-background pl-12 pr-4 text-foreground outline-none transition-colors placeholder:text-foreground/40 focus:border-primary"
        />
      </label>

      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
        <GroupTab
          label="Tout le menu"
          count={totalCount}
          isSelected={groupLabel === null}
          onClick={() => dispatch(groupSelected(null))}
        />
        {nav.map((group) => (
          <GroupTab
            key={group.label}
            label={group.label}
            count={group.count}
            isSelected={groupLabel === group.label}
            onClick={() => dispatch(groupSelected(group.label))}
          />
        ))}
      </div>

      {/* Second niveau, seulement si le groupe fusionne plusieurs catégories */}
      {activeGroup && activeGroup.subs.length > 1 && (
        <div className="scrollbar-hide flex items-center gap-1 overflow-x-auto rounded-xl bg-primary/5 px-2 py-1">
          <span className="icon-[mdi--subdirectory-arrow-right] shrink-0 text-base text-foreground/30" />
          <SubTab
            label="Tout"
            count={activeGroup.count}
            isSelected={subCategoryId === null}
            onClick={() => dispatch(subCategorySelected(null))}
          />
          {activeGroup.subs.map((sub) => (
            <SubTab
              key={sub.categoryId}
              label={sub.label}
              count={sub.count}
              isSelected={subCategoryId === sub.categoryId}
              onClick={() => dispatch(subCategorySelected(sub.categoryId))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
