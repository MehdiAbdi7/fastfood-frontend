import type {
  ResolvedGroup,
  SectionDef,
} from "@/features/menu/useCategoryGroups";

type CategorySection = Extract<SectionDef, { kind: "category" }>;

interface CategoryChipsProps {
  groups: ResolvedGroup[];
  countByGroup: Record<string, number>;
  totalCount: number;
  selectedLabel: string | null; // null = "Tout le menu"
  onSelect: (label: string | null) => void;
  subCategories: CategorySection[];
  countByCategory: Record<string, number>;
  selectedSubId: string | null;
  onSelectSub: (id: string | null) => void;
}

// Niveau 1 : pilule pleine, bordure marquée. C'est le repère principal.
function GroupChip({
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
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
        isSelected
          ? "border-primary bg-primary text-on-primary"
          : "border-border-subtle bg-surface text-foreground/70 hover:border-primary hover:text-foreground"
      }`}
    >
      {label}
      <span
        className={`tabular-nums rounded-full px-1.5 text-xs ${
          isSelected ? "bg-on-primary/20" : "bg-surface-2 text-foreground/50"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

// Niveau 2 : onglet à coins carrés, sans bordure, souligné quand actif.
// Forme et poids différents du niveau 1 — la hiérarchie se lit sans avoir à
// comparer deux nuances de la même couleur.
function SubChip({
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
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-lg border-b-2 px-3 py-1.5 text-sm font-semibold transition-colors ${
        isSelected
          ? "border-primary bg-primary/10 text-primary"
          : "border-transparent text-foreground/90 hover:bg-surface-2 hover:text-primary/80"
      }`}
    >
      {label}
      <span className="tabular-nums text-xs opacity-60">{count}</span>
    </button>
  );
}

export function CategoryChips({
  groups,
  countByGroup,
  totalCount,
  selectedLabel,
  onSelect,
  subCategories,
  countByCategory,
  selectedSubId,
  onSelectSub,
}: CategoryChipsProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Scroll horizontal sur mobile (swipe naturel), retour à la ligne dès
          qu'il y a de la place : sur desktop on ne swipe pas, et une catégorie
          coupée hors écran serait tout simplement introuvable. */}
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        <GroupChip
          label="Tout le menu"
          count={totalCount}
          isSelected={selectedLabel === null}
          onClick={() => onSelect(null)}
        />
        {groups.map((group) => (
          <GroupChip
            key={group.label}
            label={group.label}
            count={countByGroup[group.label] ?? 0}
            isSelected={selectedLabel === group.label}
            onClick={() => onSelect(group.label)}
          />
        ))}
      </div>

      {/* Sous-catégories du groupe ouvert. Décalée et posée sur un fond creux,
          la rangée se lit comme un contenu du groupe, pas comme un pair. */}
      {subCategories.length > 1 && (
        <div className="scrollbar-hide ml-3 flex items-center gap-1 overflow-x-auto rounded-xl bg-surface-2/60 px-2 py-1 sm:flex-wrap sm:overflow-visible">
          <span className="icon-[mdi--subdirectory-arrow-right] shrink-0 text-base text-foreground/30" />
          <SubChip
            label="Toutes"
            count={selectedLabel ? (countByGroup[selectedLabel] ?? 0) : 0}
            isSelected={selectedSubId === null}
            onClick={() => onSelectSub(null)}
          />
          {subCategories.map((sub) => (
            <SubChip
              key={sub.categoryId}
              label={sub.label}
              count={countByCategory[sub.categoryId] ?? 0}
              isSelected={selectedSubId === sub.categoryId}
              onClick={() => onSelectSub(sub.categoryId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
