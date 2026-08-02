"use client";

import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./themeToggle";
import { useNavbar } from "@/features/navbar/useNavbar";

const NAV_LINKS = [
  { href: "/#accueil", label: "Accueil" },
  { href: "/#menu", label: "Menu" },
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
        className={`mx-auto flex w-full items-center justify-between border border-primary lg:border-none px-6 py-2 transition-colors duration-300 ease-in-out sm:justify-evenly ${
          isScrolled || isMenuOpen ? "text-background" : "text-primary "
        }`}
      >
        <Link
          href="/"
          className="flex items-center justify-center gap-0.5 sm:gap-1 px-4 py-0.5 bg-linear-to-bl from-transparent via-transparent to-primary backdrop-blur-2xl rounded-4xl shadow-sm sm:shadow-lg shadow-primary"
          onClick={closeMenu}
        >
          <Image
            src="/logo-niwa.png"
            alt="Niwa Food"
            width={55}
            height={55}
            priority
          />
          <span className="font-heading text-sm font-semibold sm:text-xl hover:scale-110">
            <span className="text-lg text-foreground sm:text-xl">Niwa</span>{" "}
            Food
          </span>
        </Link>

        {/* Liens desktop */}
        <div className="hidden items-center gap-8 font-heading text-sm font-bold md:flex md:bg-primary md:rounded-4xl md:px-4 md:py-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              className="group relative text-on-primary py-1 transition-colors duration-300 ease-out hover:text-accent-slate"
              href={link.href}
            >
              {link.label}
              <span className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-accent-slate transition-transform duration-500 ease-out group-hover:scale-x-100" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/commande"
            className={`hidden rounded-full px-5 py-2 font-bold transition-all duration-200 ease-in-out sm:inline-block ${
              isScrolled || isMenuOpen
                ? "bg-background text-primary hover:bg-background hover:text-accent-slate hover:scale-105"
                : "bg-primary text-on-primary hover:text-accent-slate hover:scale-105"
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
        className={`fixed inset-0 -z-10 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* Panneau mobile — slide depuis la droite */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        className={`fixed top-0 right-0 z-40 h-dvh w-72 max-w-[80vw] bg-primary-dark text-on-primary shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* En-tête du panneau : logo + croix de fermeture */}
          <div className="flex items-center justify-between border-b border-on-primary/10 px-6 py-4">
            <span className="font-heading text-lg font-semibold">
              <span className="text-accent-slate">Niwa</span> Food
            </span>

            <button
              onClick={closeMenu}
              aria-label="Fermer le menu"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-on-primary/10"
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
                style={{
                  transitionDelay: isMenuOpen ? `${index * 60}ms` : "0ms",
                }}
                className={`rounded-full px-3 py-1 font-heading text-lg font-semibold border-b border-l border-accent-slate transition-all duration-300 ease-out hover:bg-on-primary/10 hover:text-accent-slate ${
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
              className="block rounded-full bg-on-primary px-5 py-3 text-center font-bold text-primary transition-colors duration-200 hover:bg-background hover:text-accent-slate"
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
