"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { MenuItemsTab } from "@/components/menu/MenuItemsTab";
import { MenuCategoriesTab } from "@/components/menu/MenuCategoriesTab";
import { MenuExtrasTab } from "@/components/menu/MenuExtrasTab";
import { MenuExtraTypesTab } from "@/components/menu/MenuExtraTypesTab";

type MenuTab = "produits" | "categories" | "extras" | "types-extras";

const TABS: { value: MenuTab; label: string }[] = [
  { value: "produits", label: "Produits" },
  { value: "categories", label: "Catégories" },
  { value: "extras", label: "Extras" },
  { value: "types-extras", label: "Types d'extras" },
];

function MenuContent() {
  const [tab, setTab] = useState<MenuTab>("produits");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-1.5 overflow-x-auto border-b border-border-subtle pb-px">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`shrink-0 border-b-2 px-3 py-2 text-sm font-bold transition-colors ${
              tab === t.value
                ? "border-primary text-primary"
                : "border-transparent text-foreground/50 hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "produits" && <MenuItemsTab />}
      {tab === "categories" && <MenuCategoriesTab />}
      {tab === "extras" && <MenuExtrasTab />}
      {tab === "types-extras" && <MenuExtraTypesTab />}
    </div>
  );
}

export default function MenuPage() {
  return (
    <DashboardShell adminOnly>
      <MenuContent />
    </DashboardShell>
  );
}
