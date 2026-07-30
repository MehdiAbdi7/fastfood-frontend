import Navbar from "@/components/Navbar";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-background text-foreground">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-primary/20 py-8 text-center text-sm text-foreground/60">
        © {new Date().getFullYear()} Niwa Food — Tous droits réservés
      </footer>
    </div>
  );
}
