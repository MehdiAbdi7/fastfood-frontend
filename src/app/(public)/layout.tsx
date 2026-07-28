import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/themeToggle";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-background text-foreground">
      <header className="fixed z-50 bg-primary backdrop-blur">
        <nav className="mx-auto flex min-w-screen items-center justify-evenly border-b border-on-primary/10 px-6 py-2 text-on-primary">
          <Link href="/" className="flex items-center justify-center gap-2">
            <Image
              src="/logo-niwa.png"
              alt="Niwa Food"
              width={55}
              height={55}
              priority
            />
            <span className="text-lg font-heading font-semibold">
              <span className="text-xl text-accent-slate">Niwa</span> Food
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-background font-medium md:flex ">
            <Link
              className="transition-colors duration-200 ease-in hover:text-accent-slate"
              href="/#accueil"
            >
              Accueil
            </Link>
            <Link
              className="transition-colors duration-200 ease-in hover:text-accent-slate"
              href="/#menu"
            >
              Menu
            </Link>
            <Link
              className="transition-colors duration-200 ease-in hover:text-accent-slate"
              href="/#a-propos"
            >
              À propos
            </Link>
            <Link
              className="transition-colors duration-200 ease-in hover:text-accent-slate"
              href="/#contact"
            >
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/commande"
              className="rounded-full bg-on-primary px-5 py-2 text-primary font-bold hover:text-accent-slate hover:bg-background transition-all duration-200 ease-in-out"
            >
              Commander
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-primary/20 py-8 text-center text-sm text-foreground/60">
        © {new Date().getFullYear()} Niwa Food — Tous droits réservés
      </footer>
    </div>
  );
}
