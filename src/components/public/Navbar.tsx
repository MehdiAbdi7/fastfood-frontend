"use client";

import Image from "next/image";
import Link from "next/link";

import { useNavbar } from "@/features/navbar/useNavbar";
import { ThemeToggle } from "./themeToggle";
import { CartButton } from "./CartButton";

const NAV_LINKS = [
  { href: "/#accueil", label: "Accueil" },
  { href: "/commande", label: "Menu" },
  { href: "/#a-propos", label: "À propos" },
  { href: "/#contact", label: "Contact" },
];

const Navbar = () => {
  const { isScrolled, isMenuOpen, toggleMenu, closeMenu } = useNavbar();

  return (
    <header
      className={`fixed z-40 w-full transition-all duration-300 ease-in ${
        isScrolled || isMenuOpen ? "bg-primary shadow-md" : "bg-transparent"
      }`}
    >
      <nav
        className={`mx-auto max-w-5xl flex w-full items-center justify-between border-b border-primary lg:border-none px-2 py-2 transition-colors duration-300 ease-in-out sm:justify-between ${
          isScrolled || isMenuOpen ? "text-background" : "text-primary "
        }`}
      >
        <Link
          href="/"
          className="flex items-center justify-center gap-0.5 sm:gap-1 "
          onClick={closeMenu}
        >
          {/* Hauteur fixée en CSS, largeur en auto : le rapport d'aspect réel
              du fichier est respecté, et Next n'a plus de divergence à
              signaler entre les dimensions déclarées et le rendu. Même
              traitement que dans le Footer. */}
          <Image
            src="/logo-niwa.png"
            alt="Niwa Food"
            width={55}
            height={55}
            priority
            className="h-14 w-auto shrink-0"
          />
          <span className="font-heading text-sm text-accent-mustard font-semibold  sm:text-xl hover:scale-110">
            <span className="text-lg text-foreground sm:text-xl">NIWA</span>{" "}
            FOOD
          </span>
        </Link>

        {/* Liens desktop */}
        <div className="hidden items-center gap-8 font-heading text-sm font-bold shadow-[0_0_20px_5px_rgba(217,169,77,0.45)] shadow-primary/30 md:flex md:bg-background md:rounded-4xl md:px-6 md:py-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              className="group relative text-foreground dark:text-foreground py-1 transition-colors duration-300 ease-out hover:text-accent-mustard"
              href={link.href}
            >
              {link.label}
              <span className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-accent-mustard transition-transform duration-500 ease-out group-hover:scale-x-100" />
            </Link>
          ))}
        </div>

        {/* gap resserré sur mobile : le panier vient s'intercaler ici, et à
            gap-4 le trio panier/thème/hamburger débordait sur les petits
            écrans. */}
        <div className="flex items-center gap-2 sm:gap-4">
          <CartButton />
          <ThemeToggle />
          <Link
            href="/commande"
            className={`hidden rounded-full px-5 py-2 font-bold transition-all duration-200 ease-in-out sm:inline-block ${
              isScrolled || isMenuOpen
                ? "bg-background text-primary dark:text-foreground hover:text-accent-green hover:scale-105"
                : "bg-primary text-background dark:text-foreground hover:bg-accent-green hover:scale-105"
            }`}
          >
            Commander
          </Link>

          {/* Bouton hamburger — visible uniquement mobile */}
          <button
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-current/10 md:hidden"
          >
            <span
              className={`absolute h-0.5 w-5 rounded-full bg-foreground/80 transition-all duration-300 ease-in-out ${
                isMenuOpen ? "rotate-45" : "-translate-y-1.5"
              }`}
            />
            <span
              className={`absolute h-0.5 w-5 rounded-full bg-foreground/80 transition-all duration-300 ease-in-out ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute h-0.5 w-5 rounded-full bg-foreground/80 transition-all duration-300 ease-in-out ${
                isMenuOpen ? "-rotate-45" : "translate-y-1.5"
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Overlay sombre derrière le panneau */}
      <div
        onClick={closeMenu}
        className={`fixed inset-0 -z-10 bg-black/10 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* Panneau mobile — slide depuis la droite.
          aria-labelledby et non aria-label : un rôle "dialog" sans nom
          accessible est annoncé « dialogue » tout court, sans dire lequel.
          On pointe vers le titre visible du panneau plutôt que de dupliquer
          un libellé qui pourrait diverger. */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
        className={`fixed top-0 right-0 z-40 h-dvh w-full  bg-background text-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* En-tête du panneau : logo + croix de fermeture */}
          <div className="flex items-center justify-between border-b border-on-primary/10 px-4 py-4">
            <Link
              href="/"
              id="mobile-menu-title"
              className="flex items-center justify-center gap-0.5 sm:gap-1 shadow-[0_0_20px_5px_rgba(217,169,77,0.45)] shadow-primary/30 rounded-4xl px-4 "
              onClick={closeMenu}
            >
              <Image
                src="/logo-niwa.png"
                alt="Niwa Food"
                width={48}
                height={48}
                className="h-12 w-auto shrink-0"
              />
              <span className="font-heading text-sm text-accent-mustard font-semibold  sm:text-xl hover:scale-110">
                <span className="text-lg text-foreground sm:text-xl">NIWA</span>{" "}
                FOOD
              </span>
            </Link>
            <button
              onClick={closeMenu}
              aria-label="Fermer le menu"
              className="flex h-9 w-9 text-primary cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-on-primary/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Liens */}
          <div className="flex flex-1 flex-col gap-8 px-6 pt-6">
            {NAV_LINKS.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                // Hors du parcours clavier quand le panneau est refermé : il
                // reste dans le DOM, translaté hors écran, donc ses liens
                // seraient encore focalisables sans ce garde.
                tabIndex={isMenuOpen ? undefined : -1}
                style={{
                  transitionDelay: isMenuOpen ? `${index * 60}ms` : "0ms",
                }}
                className={`rounded-2xl px-4 py-3 font-heading text-lg text-foreground font-semibold border-b border-primary transition-all duration-300 ease-out ${
                  isMenuOpen
                    ? "translate-x-0 opacity-100"
                    : "translate-x-4 opacity-0"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA en bas du panneau */}
          <div className="px-6 pb-8">
            <Link
              href="/commande"
              onClick={closeMenu}
              tabIndex={isMenuOpen ? undefined : -1}
              className="block rounded-full border-b border-primary bg-on-primary px-5 py-3 text-center font-bold text-primary transition-colors duration-200 hover:bg-background hover:text-accent-slate"
            >
              Commander
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
