import type { MenuCategory } from "@/types/menuItem";

interface CategoryChipsProps {
  categories: MenuCategory[];
  countByCategory: Record<string, number>;
  totalCount: number;
  selectedId: string | null; // null = "Tout le menu"
  onSelect: (id: string | null) => void;
}

// Le compte de produits sur chaque onglet évite d'ouvrir une catégorie vide
// en plein service — l'information est là avant le clic.
function Chip({
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

export function CategoryChips({
  categories,
  countByCategory,
  totalCount,
  selectedId,
  onSelect,
}: CategoryChipsProps) {
  return (
    // Scroll horizontal sur mobile (swipe naturel), retour à la ligne dès
    // qu'il y a de la place : sur desktop on ne swipe pas, et une catégorie
    // coupée hors écran serait tout simplement introuvable.
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
      <Chip
        label="Tout le menu"
        count={totalCount}
        isSelected={selectedId === null}
        onClick={() => onSelect(null)}
      />
      {categories.map((category) => (
        <Chip
          key={category._id}
          label={category.name}
          count={countByCategory[category._id] ?? 0}
          isSelected={selectedId === category._id}
          onClick={() => onSelect(category._id)}
        />
      ))}
    </div>
  );
}
