import Image from "next/image";
import Navbar from "@/components/Navbar";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-background text-foreground">
      {/* Frites décoratives — couvrent Navbar + Hero (premier écran) */}
      <div
        aria-hidden="true"
        className="pointer-events-none hidden lg:block absolute left-0 top-0 h-dvh w-32 xl:w-40 opacity-90 z-0"
      >
        <Image
          src="/frites-deco.png"
          alt=""
          fill
          loading="eager"
          className="object-cover object-left"
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none hidden lg:block absolute right-0 top-0 h-dvh w-32 xl:w-40 opacity-90 z-0"
      >
        <Image
          src="/frites-deco.png"
          alt=""
          fill
          loading="eager"
          className="object-cover object-right -scale-x-100"
        />
      </div>

      <Navbar />
      <main className="relative z-10 flex-1">{children}</main>
      <footer className="relative z-10 border-t border-primary/20 py-8 text-center text-sm text-foreground/60">
        © {new Date().getFullYear()} Niwa Food — Tous droits réservés
      </footer>
    </div>
  );
}
