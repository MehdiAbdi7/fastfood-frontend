"use client";

import Image from "next/image";
import Link from "next/link";
import { useGetMenuItemsQuery } from "@/features/menu/menuApi";

const BEST_SELLERS_COUNT = 5;

export function BestSellers() {
  const { data: menuItems, isLoading, isError } = useGetMenuItemsQuery();

  const bestSellers = (menuItems ?? [])
    .filter((item) => item.available)
    .slice(0, BEST_SELLERS_COUNT);

  return (
    <section
      id="menu"
      className="relative isolate overflow-hidden px-6 py-10 bg-transparent backdrop-blur-lg shadow-2xl shadow-primary rounded-2xl mx-4 md:mx-18 my-4"
    >
      {/* Décoration — tout en dessous */}
      <Image
        src="/deco-fastfood2.png"
        alt=""
        fill
        priority
        aria-hidden="true"
        className="pointer-events-none -z-20 hidden -scale-y-100 object-cover object-top lg:block"
      />

      {/* Fondu — au-dessus de la déco, en dessous du contenu */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-linear-to-r from-background/10 via-background/5 to-background/5 dark:from-background/10 dark:via-background/10 dark:to-background/10"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-2 text-center">
          <span className="font-heading text-sm font-bold uppercase tracking-wide text-accent-green">
            Nos incontournables
          </span>
          <h2 className="font-heading text-3xl font-bold text-primary sm:text-4xl">
            Les best-sellers Niwa
          </h2>
          <p className="mx-auto max-w-md text-sm text-foreground/70">
            Les plats que nos clients recommandent le plus souvent.
          </p>
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
              <div
                key={item._id}
                className="group flex flex-col overflow-hidden rounded-3xl bg-primary shadow-food-sm transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-square w-full bg-primary/10">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="icon-[mdi--food] text-4xl text-primary/40" />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-1 p-3">
                  <p className="font-heading text-sm font-semibold text-foreground">
                    {item.name}
                  </p>
                  <p className="text-sm font-bold text-accent-green">
                    {item.variants[0]?.price ?? "—"} DA
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href="/commande"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-on-primary transition-all duration-300 ease-in-out hover:scale-105 hover:bg-accent-slate"
          >
            Voir tout le menu
            <span className="icon-[line-md--arrow-right-circle-twotone] text-xl" />
          </Link>
        </div>
      </div>
    </section>
  );
}
