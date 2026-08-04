"use client";

import Link from "next/link";
import { useGetMenuItemsQuery } from "@/features/menu/menuApi";
import { BestSellerCard } from "./BestSellerCard";

const BEST_SELLER_NAMES = [
  "PIRELLI",
  "HARLEY",
  "GILERA",
  "Frites Niwa",
  "Salade César",
];

export function BestSellers() {
  const { data: menuItems, isLoading, isError } = useGetMenuItemsQuery();

  const bestSellers = BEST_SELLER_NAMES.map((name) =>
    menuItems?.find((item) => item.name === name && item.available),
  ).filter((item): item is NonNullable<typeof item> => item !== undefined);

  return (
    <section
      id="menu"
      className="relative isolate overflow-hidden px-6 sm:px-8 py-16 sm:py-24 bg-transparent sm:bg-linear-to-bl from-primary/55 via-background to-primary/60 "
    >
      <div className="relative z-10 mx-auto max-w-6xl rounded-4xl shadow-[0_0_30px_5px_rgba(217,169,77,0.45)] shadow-primary backdrop-blur-md px-2 sm:px-8 py-8 bg-primary/50 dark:bg-primary/30 border border-foreground">
        <div className="mb-10 grid grid-cols-1 items-center gap-6 sm:mb-14 sm:grid-cols-[1fr_auto_1fr]">
          <div className="hidden sm:block" aria-hidden="true" />

          <div className="flex flex-col items-center gap-2 text-center">
            <span className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
              Nos incontournables
            </span>
            <h2 className="font-heading text-3xl font-bold text-accent-green sm:text-4xl">
              Les best-sellers Niwa
            </h2>
            <p className="mx-auto max-w-md text-sm text-foreground">
              Les plats que nos clients recommandent le plus souvent.
            </p>
          </div>

          <div className="flex justify-center sm:justify-end">
            <Link
              href="/commande"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-on-primary transition-all duration-300 ease-in-out hover:scale-105 hover:bg-accent-slate"
            >
              Voir tout le menu
              <span className="icon-[line-md--arrow-right-circle-twotone] text-xl" />
            </Link>
          </div>
        </div>

        {isLoading && (
          <p className="text-center text-sm text-foreground/60">
            Chargement des best-sellers...
          </p>
        )}

        {isError && (
          <p className="text-center text-sm text-accent-bordeaux">
            Impossible de charger le menu pour le moment.
          </p>
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {bestSellers.map((item) => (
              <BestSellerCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
