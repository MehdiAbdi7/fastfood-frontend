"use client";

import { usePathname } from "next/navigation";
import { StoreSwitcher } from "./StoreSwitcher";
import { ServiceBadge } from "./ServiceBadge";
import { UserMenu } from "./UserMenu";
import { NAV_ITEMS } from "./navConfig";

// Le titre de page est dérivé de navConfig plutôt que passé en prop par
// chaque page : ça évite un titre oublié/désynchronisé du lien de nav actif.
function usePageTitle(): string {
  const pathname = usePathname();
  const match = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  return match?.label ?? "Dashboard";
}

export function Topbar() {
  const title = usePageTitle();

  return (
    // z-30 et non z-20 : le panneau du UserMenu s'ancre dans ce header, donc
    // toute la barre doit passer au-dessus du contenu de la page, sinon une
    // carte en z-20 viendrait recouvrir le menu déroulé.
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border-subtle bg-surface/90 px-4 py-3 backdrop-blur-md sm:px-6">
      <h1 className="font-heading text-lg font-bold text-foreground sm:text-xl">
        {title}
      </h1>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:block">
          <ServiceBadge />
        </div>
        <StoreSwitcher />
        {/* Le ThemeToggle a rejoint le UserMenu : à trois contrôles plus le
            titre, la barre débordait sur un écran de 360 px. */}
        <UserMenu />
      </div>
    </header>
  );
}
