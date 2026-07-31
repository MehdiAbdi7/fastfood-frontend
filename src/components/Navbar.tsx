"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./themeToggle";

const NAV_LINKS = [
  { href: "/#accueil", label: "Accueil" },
  { href: "/#menu", label: "Menu" },
  { href: "/#a-propos", label: "À propos" },
  { href: "/#contact", label: "Contact" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Bloque le scroll du body quand le menu mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Ferme le menu automatiquement si on repasse en desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header
      className={`fixed z-50 w-full transition-all duration-300 ease-in ${
        isScrolled || isMenuOpen ? "bg-primary shadow-md" : "bg-transparent"
      }`}
    >
      <nav
        className={`mx-auto flex w-full items-center justify-between border-b px-6 py-2 transition-colors duration-300 ease-in-out sm:justify-evenly ${
          isScrolled || isMenuOpen
            ? "border-on-primary/10 text-background"
            : "border-primary text-primary sm:border-transparent"
        }`}
      >
        <Link
          href="/"
          className="flex items-center justify-center gap-0.5 sm:gap-1"
          onClick={() => setIsMenuOpen(false)}
        >
          <Image
            src="/logo-niwa.png"
            alt="Niwa Food"
            width={55}
            height={55}
            priority
          />
          <span className="font-heading text-sm font-semibold sm:text-xl">
            <span className="text-lg text-accent-slate sm:text-xl">Niwa</span>{" "}
            Food
          </span>
        </Link>

        {/* Liens desktop */}
        <div className="hidden items-center gap-8 font-heading text-sm font-bold md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              className="transition-colors duration-300 ease-out hover:text-accent-slate"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/commande"
            className={`hidden rounded-full px-5 py-2 font-bold transition-all duration-200 ease-in-out sm:inline-block ${
              isScrolled || isMenuOpen
                ? "bg-background text-primary hover:bg-background hover:text-accent-slate"
                : "bg-primary text-on-primary hover:bg-accent-slate"
            }`}
          >
            Commander
          </Link>

          {/* Bouton hamburger — visible uniquement mobile */}
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isMenuOpen}
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-current/10 md:hidden"
          >
            <span
              className={`absolute h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-in-out ${
                isMenuOpen ? "rotate-45" : "-translate-y-1.5"
              }`}
            />
            <span
              className={`absolute h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-in-out ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-in-out ${
                isMenuOpen ? "-rotate-45" : "translate-y-1.5"
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Overlay sombre derrière le panneau */}
      <div
        onClick={() => setIsMenuOpen(false)}
        className={`fixed inset-0 -z-10 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* Panneau mobile — slide depuis la droite */}
      <div
        className={`fixed top-0 right-0 z-40 h-dvh w-72 max-w-[80vw] bg-primary text-on-primary shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col gap-2 px-6 pt-24">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg px-3 py-3 font-heading text-lg font-semibold transition-colors duration-200 hover:bg-on-primary/10 hover:text-accent-slate"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/commande"
            onClick={() => setIsMenuOpen(false)}
            className="mt-4 rounded-full bg-on-primary px-5 py-3 text-center font-bold text-primary transition-colors duration-200 hover:bg-background hover:text-accent-slate"
          >
            Commander
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
