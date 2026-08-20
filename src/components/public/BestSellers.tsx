"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useGetMenuItemsQuery } from "@/features/menu/menuApi";
import { useInfiniteCarousel } from "@/features/carousel/useInfiniteCarousel";
import { BestSellerCard } from "./BestSellerCard";

// L'ordre fait foi : c'est l'ordre d'affichage dans le carrousel.
// Les noms doivent correspondre EXACTEMENT au champ `name` en base — un produit
// renommé côté dashboard fait disparaître la carte en silence, d'où le contrôle
// de développement plus bas.
const BEST_SELLER_NAMES = [
  "PIRELLI",
  "HARLEY",
  "GILERA",
  "Frites Niwa",
  "Salade César",
  "À REMPLACER 1",
  "À REMPLACER 2",
  "À REMPLACER 3",
];

export function BestSellers() {
  const { data: menuItems, isLoading, isError } = useGetMenuItemsQuery();

  // useMemo obligatoire : sans lui, `bestSellers` serait un tableau neuf à
  // chaque rendu, et l'effet de recentrage du hook se rejouerait — le
  // carrousel sauterait à sa position initiale pendant que le client scrolle.
  const bestSellers = useMemo(() => {
    const resolved = BEST_SELLER_NAMES.map((name) =>
      menuItems?.find((item) => item.name === name && item.available),
    ).filter((item): item is NonNullable<typeof item> => item !== undefined);

    // Le filtrage par nom échoue silencieusement : sans ce signal, un produit
    // renommé ou épuisé se traduit juste par une carte manquante que personne
    // ne remarque avant une capture d'écran client.
    if (process.env.NODE_ENV !== "production" && menuItems) {
      const missing = BEST_SELLER_NAMES.filter(
        (name) => !menuItems.some((item) => item.name === name),
      );
      if (missing.length > 0) {
        console.warn(
          `[BestSellers] Introuvables au menu : ${missing.join(", ")}`,
        );
      }
    }

    return resolved;
  }, [menuItems]);

  const { scrollerRef, handleScroll, scrollByCard, scrollerHandlers } =
    useInfiniteCarousel(bestSellers.length);

  return (
    <section
      id="menu"
      className="relative isolate overflow-hidden px-6 py-16 sm:px-8 sm:py-24"
    >
      <div className="relative z-10 mx-auto max-w-6xl rounded-4xl border border-primary bg-background px-2 py-8 shadow-[0_0_30px_5px_rgba(217,169,77,0.45)] shadow-primary/30 backdrop-blur-md dark:bg-primary/30 sm:px-8">
        <div className="mb-10 flex flex-col items-center gap-2 text-center sm:mb-14">
          <span className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
            Nos incontournables
          </span>
          <h2 className="font-heading text-3xl font-bold text-accent-green sm:text-4xl">
            Les best-sellers Niwa
          </h2>
          <p className="mx-auto max-w-md text-sm text-foreground">
            Touchez un plat pour le composer.
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

        {!isLoading && !isError && bestSellers.length > 0 && (
          <div className="relative">
            {/* Flèches masquées sous sm : le swipe suffit au doigt, et deux
                pastilles de plus encombreraient une carte déjà dense.
                Jamais désactivées — en boucle, il n'y a plus de bord. */}
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Produits précédents"
              className="absolute -left-1 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-primary shadow-food-sm backdrop-blur-sm transition-transform hover:scale-110 sm:-left-4 sm:flex"
            >
              <span className="icon-[mdi--chevron-left] text-2xl" />
            </button>

            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Produits suivants"
              className="absolute -right-1 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-primary shadow-food-sm backdrop-blur-sm transition-transform hover:scale-110 sm:-right-4 sm:flex"
            >
              <span className="icon-[mdi--chevron-right] text-2xl" />
            </button>

            {/* NI scroll-snap NI scroll-smooth ici — voir l'avertissement en
                tête de useInfiniteCarousel : le setter scrollLeft respecte
                scroll-behavior, donc `scroll-smooth` en CSS fige totalement la
                dérive sur Safari iOS. La fluidité des flèches est demandée
                explicitement dans scrollByCard.

                py-6 -my-6 : overflow-x-auto force implicitement overflow-y à
                "auto", ce qui rognerait le -translate-y-1.5 et le glow de 30px
                des cartes au survol. On rend l'espace sans décaler la page. */}
            <div
              ref={scrollerRef}
              onScroll={handleScroll}
              {...scrollerHandlers}
              role="region"
              aria-label="Carrousel des best-sellers"
              className="scrollbar-hide -my-6 flex gap-4 overflow-x-auto overscroll-x-contain px-1 py-6"
            >
              {/* Trois copies : c'est ce qui donne la boucle. Les deux
                  latérales sont aria-hidden ET hors parcours clavier — un
                  lecteur d'écran ne doit entendre la liste qu'une seule fois,
                  et la tabulation ne doit pas traverser 24 liens. */}
              {[0, 1, 2].map((copy) =>
                bestSellers.map((item) => (
                  <div
                    key={`${copy}-${item._id}`}
                    aria-hidden={copy !== 1}
                    className="shrink-0 basis-[42%] sm:basis-[28%] lg:basis-[21%]"
                  >
                    <BestSellerCard item={item} isDuplicate={copy !== 1} />
                  </div>
                )),
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center">
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
