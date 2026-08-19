import Link from "next/link";
import { publicFetch } from "@/lib/publicFetch";
import { buildMenuNav } from "@/features/menu/menuNav";
import { MenuFilters } from "@/components/publicOrder/MenuFilters";
import { DishList } from "@/components/publicOrder/DishList";
import { CartBar } from "@/components/publicOrder/CartBar";
import type { MenuCategory, MenuItem } from "@/types/menuItem";

export const metadata = {
  title: "Commander — Niwa Food",
  description:
    "Composez votre commande Niwa Food : sur place, à emporter ou en livraison à Kouba et Chéraga.",
};

// Le menu change quelques fois par jour, pas par minute : une minute de cache
// suffit largement et évite de taper le backend Render à chaque scan de QR.
export const revalidate = 60;

/**
 * Server Component : c'est ici que le menu est chargé et la navigation
 * calculée, donc le client reçoit du HTML déjà rempli — pas de skeleton, pas
 * d'attente du JS. Les trois îlots ci-dessous sont les seuls morceaux
 * interactifs, et ils ne se parlent qu'à travers Redux.
 *
 * Le ticket (CartSheet) n'est plus monté ici mais dans le layout public : il
 * doit rester ouvrable depuis le bouton panier de la navbar, sur toutes les
 * pages.
 */
export default async function CommandePage() {
  const [items, categories] = await Promise.all([
    publicFetch<MenuItem[]>("/menu-items"),
    publicFetch<MenuCategory[]>("/menu-categories"),
  ]);

  if (!items || !categories) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="icon-[mdi--wifi-off] text-5xl text-foreground/25" />
        <h1 className="font-heading text-xl font-bold text-foreground">
          Le menu est momentanément indisponible
        </h1>
        <p className="text-sm text-foreground/60">
          Rechargez la page dans un instant, ou appelez-nous directement.
        </p>
        {/* <a> natif : cette page peut s'afficher avant même le chargement du JS */}
        <a
          href="/commande"
          className="mt-2 rounded-full bg-primary px-6 py-3 font-bold text-on-primary"
        >
          Réessayer
        </a>
        <Link
          href="/#contact"
          className="text-sm font-semibold text-accent-green"
        >
          Voir nos numéros
        </Link>
      </div>
    );
  }

  // Filtré côté serveur : un produit épuisé n'est ni commandable ni affiché,
  // autant ne pas l'envoyer du tout au navigateur.
  const availableItems = items.filter((item) => item.available);
  const nav = buildMenuNav(categories, availableItems);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-40 pt-24 sm:px-6 sm:pt-28">
      <header className="mb-6 flex flex-col gap-1.5">
        <span className="font-heading text-sm font-bold uppercase tracking-wide text-accent-green">
          Notre carte
        </span>
        <h1 className="font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          Composez votre commande
        </h1>
        <p className="text-sm text-foreground/60">
          Sur place, à emporter ou en livraison. Vous choisirez à la fin.
        </p>
      </header>

      <MenuFilters nav={nav} />
      <DishList items={availableItems} nav={nav} />

      <CartBar />
    </div>
  );
}
