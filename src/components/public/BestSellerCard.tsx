import Image from "next/image";
import type { MenuItem } from "@/types/menuItem";

interface BestSellerCardProps {
  item: MenuItem;
}

// Décrit la largeur d'AFFICHAGE de la vignette, pas le poids du fichier : le
// navigateur choisit la variante du srcset avec cette seule information, avant
// même d'avoir appliqué le CSS. Elle suit les `basis` du carrousel (≈42% de la
// largeur écran sur mobile, ≈28% en sm, ≈210 px en lg dans un max-w-6xl).
const CARD_IMAGE_SIZES =
  "(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 210px";

export function BestSellerCard({ item }: BestSellerCardProps) {
  return (
    // h-full : le wrapper est déjà étiré à la hauteur de la rangée par le flex
    // parent, mais la carte, elle, garderait sa hauteur de contenu. C'est ce
    // h-full qui lui fait remplir la place offerte, donc qui aligne les cartes.
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border-2 border-primary bg-background ring-1 ring-primary/10 backdrop-blur-2xl transition-all duration-300 hover:shadow-[0_0_30px_5px_rgba(217,169,77,0.45)] hover:shadow-primary motion-safe:hover:-translate-y-1.5">
      {/* Photo — shrink-0 indispensable : un enfant de flex en aspect-ratio se
          laisse comprimer quand la carte est étirée par une voisine plus haute,
          et les photos perdent alors leur alignement d'une carte à l'autre. */}
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-primary/20">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes={CARD_IMAGE_SIZES}
            className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="icon-[mdi--food] text-4xl text-primary/40" />
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="relative flex flex-1 flex-col gap-1 p-3 pt-5">
        {/* Étiquette de prix, épinglée à cheval sur la photo et le contenu */}
        <div className="absolute -top-3.5 right-3 z-10 -rotate-3">
          <div
            className="flex items-center gap-1.5 bg-accent-green py-1 pl-3.5 pr-2.5 text-[11px] font-bold text-on-primary shadow-md"
            style={{
              clipPath: "polygon(12px 0, 100% 0, 100% 100%, 12px 100%, 0 50%)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-background/70" />
            {item.variants[0]?.price ?? "—"} DA
          </div>
        </div>

        <p className="font-heading text-sm font-semibold leading-snug text-foreground">
          {item.name}
        </p>

        {/* min-h : une carte sans description laisserait un creux là où ses
            voisines ont deux lignes. On réserve la place même à vide. */}
        <p className="min-h-8 line-clamp-2 text-xs leading-snug text-foreground/60">
          {item.description}
        </p>
      </div>
    </div>
  );
}
