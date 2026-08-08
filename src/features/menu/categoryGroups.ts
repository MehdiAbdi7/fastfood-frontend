// src/features/menu/categoryGroups.ts

import type { MenuItem } from "@/types/menuItem";

export interface CategorySection {
  label: string;
  test: (item: MenuItem) => boolean;
}

export interface SubCategoryLabel {
  categoryName: string; // nom EXACT de la MenuCategory backend
  displayLabel: string; // ce qui s'affiche comme titre de section
}

export interface CategoryGroupConfig {
  label: string;
  categoryNames: string[];
  subLabels?: SubCategoryLabel[]; // labels explicites si plusieurs catégories fusionnées
  sections?: CategorySection[]; // sections par mot-clé (ex: Pizzas)
}

function descriptionIncludes(item: MenuItem, keyword: string): boolean {
  return (item.description ?? "").toLowerCase().includes(keyword.toLowerCase());
}

export const CATEGORY_GROUPS: CategoryGroupConfig[] = [
  {
    label: "Burgers",
    categoryNames: ["Burgers", "Burgers Signature"],
    subLabels: [
      { categoryName: "Burgers", displayLabel: "Classique" },
      { categoryName: "Burgers Signature", displayLabel: "Signature" },
    ],
  },
  {
    label: "Tacos",
    categoryNames: ["Tacos Classique", "Tacos Signature"],
    subLabels: [
      { categoryName: "Tacos Classique", displayLabel: "Classique" },
      { categoryName: "Tacos Signature", displayLabel: "Signature" },
    ],
  },
  {
    label: "Pizzas",
    categoryNames: ["Pizzas"],
    sections: [
      {
        label: "Sauce Blanche",
        test: (item) => descriptionIncludes(item, "blanche"),
      },
      {
        label: "Sauce Tomate",
        test: (item) => descriptionIncludes(item, "tomate"),
      },
    ],
  },
];
