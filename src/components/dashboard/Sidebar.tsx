"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/useAuth";
import { NAV_ITEMS } from "./navConfig";

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto border-r border-border-subtle bg-surface lg:flex">
      <Link href="/dashboard" className="flex items-center gap-2 px-5 py-5">
        <Image src="/logo-niwa.png" alt="Niwa Food" width={36} height={36} />
        <span className="font-heading text-base font-bold text-foreground">
          NIWA <span className="text-accent-mustard">FOOD</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 px-3">
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

      <div className="flex items-center gap-3 border-t border-border-subtle px-4 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 font-heading text-sm font-bold text-primary">
          {user?.firstname[0]}
          {user?.lastname[0]}
        </div>
        <div className="flex min-w-0 flex-col">
          <p className="truncate text-sm font-semibold text-foreground">
            {user?.firstname} {user?.lastname}
          </p>
          <p className="truncate text-xs text-foreground/50">
            {isAdmin ? "Administrateur" : "Employé"}
          </p>
        </div>
        <button
          onClick={logout}
          aria-label="Se déconnecter"
          className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground/50 transition-colors hover:bg-accent-bordeaux/10 hover:text-accent-bordeaux"
        >
          <span className="icon-[mdi--logout] text-lg" />
        </button>
      </div>
    </aside>
  );
}
