"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./themeToggle";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll(); // vérifie l'état initial (au cas où on recharge la page déjà scrollée)
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed z-50 w-full transition-all duration-300 ease-in ${
        isScrolled ? "bg-primary shadow-md" : "bg-transparent"
      }`}
    >
      <nav
        className={`mx-auto flex min-w-screen items-center justify-evenly border-b px-6 py-2 transition-colors duration-300 ease-in-out ${
          isScrolled
            ? "border-on-primary/10 text-background"
            : "border-primary sm:border-transparent text-primary"
        }`}
      >
        <Link
          href="/"
          className="flex items-center justify-center gap-1 sm:gap-2"
        >
          <Image
            src="/logo-niwa.png"
            alt="Niwa Food"
            width={55}
            height={55}
            priority
          />
          <span className="text-sm sm:text-lg font-heading font-semibold">
            <span className="text-lg sm:text-xl text-accent-slate">Niwa</span>{" "}
            Food
          </span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-bold md:flex">
          <Link
            className="transition-colors duration-300 ease-out hover:text-accent-slate"
            href="/#accueil"
          >
            Accueil
          </Link>
          <Link
            className="transition-colors duration-300 ease-out hover:text-accent-slate"
            href="/#menu"
          >
            Menu
          </Link>
          <Link
            className="transition-colors duration-300 ease-out hover:text-accent-slate"
            href="/#a-propos"
          >
            À propos
          </Link>
          <Link
            className="transition-colors duration-300 ease-out hover:text-accent-slate"
            href="/#contact"
          >
            Contact
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/commande"
            className={`rounded-full px-5 py-2 font-bold transition-all duration-200 ease-in-out ${
              isScrolled
                ? "bg-background text-primary hover:bg-background hover:text-accent-slate"
                : "bg-primary text-on-primary hover:bg-accent-slate"
            }`}
          >
            Commander
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
