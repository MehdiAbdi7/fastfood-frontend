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
// Sur lg elle occupe toute la largeur de la colonne et son compteur part à
// droite — une liste verticale se lit par sa marge gauche, l'alignement des
// compteurs à droite crée la seconde colonne visuelle qui la structure.
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
      className={`shrink-0 rounded-full border px-4 py-2.5 font-heading text-sm font-bold transition-colors lg:flex lg:w-full lg:items-center lg:justify-between lg:rounded-xl lg:text-left ${
        isSelected
          ? "border-primary bg-primary text-on-primary shadow-sm"
          : "border-primary/25 bg-background/50 text-foreground hover:border-primary hover:bg-background/70"
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
      className={`shrink-0 rounded-lg border-b-2 px-3 py-1.5 text-xs font-bold transition-colors lg:flex lg:w-full lg:items-center lg:justify-between lg:border-b-0 lg:border-l-2 lg:text-left ${
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
    // Deux dispositions, un seul composant : bandeau collant en haut sur
    // mobile, colonne latérale à partir de lg. Un composant par disposition
    // dupliquerait la logique Redux et le risque de désynchronisation.
    //
    // max-h + overflow-y-auto sur lg : avec beaucoup de catégories, une
    // colonne plus haute que l'écran rendrait les dernières inatteignables,
    // puisqu'elle est collée et ne défile pas avec la page.
    <aside className="sticky top-20 z-20 mb-6 flex flex-col gap-2.5 rounded-3xl border border-primary/20 bg-background/55 p-2.5 shadow-[0_10px_35px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-3 lg:top-24 lg:mb-0 lg:max-h-[calc(100vh-8rem)] lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:p-4">
      <label className="relative block">
        <span className="sr-only">Rechercher un plat</span>
        <span className="icon-[mdi--magnify] pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-foreground/40" />
        <input
          type="search"
          value={search}
          onChange={(event) => dispatch(searchChanged(event.target.value))}
          placeholder="Un plat, un ingrédient..."
          className="h-12 w-full rounded-full border border-primary/20 bg-background/60 pl-12 pr-4 text-foreground outline-none transition-colors placeholder:text-foreground/40 focus:border-primary focus:bg-background/80 lg:h-11 lg:rounded-xl lg:pl-11 lg:text-sm"
        />
      </label>

      {/* Titre réservé au format colonne : en bandeau horizontal il ferait un
          niveau de hiérarchie de trop pour trois pilules. */}
      <p className="hidden font-heading text-xs font-bold uppercase tracking-wide text-foreground/45 lg:mt-1 lg:block">
        Catégories
      </p>

      <div className="scrollbar-hide flex gap-2 overflow-x-auto lg:flex-col lg:gap-1.5 lg:overflow-x-visible">
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
        <div className="scrollbar-hide flex items-center gap-1 overflow-x-auto rounded-2xl bg-primary/5 px-2 py-1 lg:ml-2 lg:flex-col lg:items-stretch lg:gap-0.5 lg:overflow-x-visible lg:rounded-xl lg:px-1.5 lg:py-1.5">
          {/* La flèche indique l'imbrication en ligne ; en colonne, le retrait
              et la barre latérale des SubTab la disent déjà. */}
          <span className="icon-[mdi--subdirectory-arrow-right] shrink-0 text-base text-foreground/30 lg:hidden" />
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
    </aside>
  );
}
