import Footer from "@/components/public/Footer";
import Navbar from "@/components/public/Navbar";
import { CartSheet } from "@/components/publicOrder/CartSheet";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-background text-foreground">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />

      {/* Monté ici et non dans /commande : le bouton panier de la navbar est
          présent sur toutes les pages publiques, il lui faut un ticket à
          ouvrir partout. Le composant ne rend rien tant qu'il est fermé. */}
      <CartSheet />
    </div>
  );
}
