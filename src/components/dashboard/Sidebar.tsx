"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/useAuth";
import { NAV_ITEMS } from "./navConfig";

export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto border-r border-border-subtle bg-surface lg:flex">
      <Link href="/dashboard" className="flex items-center gap-2 px-5 py-5">
        <Image src="/logo-niwa.png" alt="Niwa Food" width={36} height={36} />
        <span className="font-heading text-base font-bold text-foreground">
          NIWA <span className="text-accent-mustard">FOOD</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 px-3 pb-4">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-primary text-on-primary"
                  : "text-foreground/70 hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <span className={`${item.icon} text-lg`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Le bloc profil/déconnexion a été retiré : il vit désormais dans le
          UserMenu de la topbar, donc accessible aussi sur mobile — où cette
          sidebar n'est jamais rendue (hidden lg:flex). */}
    </aside>
  );
}
