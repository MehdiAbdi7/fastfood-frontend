export interface NavItem {
  href: string;
  label: string;
  icon: string; // classe iconify
  adminOnly?: boolean;
}

// Ordre = ordre d'affichage, dans la sidebar comme dans la bottom-nav.
// Un seul endroit à modifier pour ajouter/retirer une section du dashboard.
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Accueil", icon: "icon-[mdi--view-dashboard-outline]" },
  { href: "/commandes", label: "Commandes", icon: "icon-[mdi--receipt-text-outline]" },
  { href: "/tables", label: "Tables", icon: "icon-[mdi--table-furniture]" },
  { href: "/menu", label: "Menu", icon: "icon-[mdi--food-outline]" },
  { href: "/historique", label: "Historique", icon: "icon-[mdi--history]" },
  {
    href: "/utilisateurs",
    label: "Équipe",
    icon: "icon-[mdi--account-group-outline]",
    adminOnly: true,
  },
  { href: "/parametres", label: "Paramètres", icon: "icon-[mdi--cog-outline]" },
];

// La bottom-nav (tablette/mobile) n'a la place que pour 5 icônes ; le reste
// passe par "Plus" -> sidebar en overlay. Sélection des items les plus
// utilisés en service (pas Historique/Équipe, consultés hors coup de feu).
export const BOTTOM_NAV_PRIMARY_HREFS = [
  "/dashboard",
  "/commandes",
  "/tables",
  "/menu",
];
