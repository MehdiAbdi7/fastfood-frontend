import Image from "next/image";
import type { MenuItem } from "@/types/menuItem";

interface BestSellerCardProps {
  item: MenuItem;
}

export function BestSellerCard({ item }: BestSellerCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden border-2 border-primary rounded-2xl bg-background ring-1 ring-primary/10 backdrop-blur-2xl hover:shadow-[0_0_30px_5px_rgba(217,169,77,0.45)] hover:shadow-primary transition-all duration-300 motion-safe:hover:-translate-y-1.5 cursor-pointer ">
      {/* Photo */}
      <div className="relative aspect-square w-full overflow-hidden bg-primary/20">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105 "
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="icon-[mdi--food] text-4xl text-primary/40" />
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="relative flex flex-1 flex-col gap-1.5 p-4 pt-6">
        {/* Étiquette de prix, épinglée à cheval sur la photo et le contenu */}
        <div className="absolute -top-4 right-4 z-10 -rotate-3">
          <div
            className="flex items-center gap-1.5 bg-accent-green py-1.5 pl-4 pr-3 text-xs font-bold text-on-primary shadow-md"
            style={{
              clipPath: "polygon(14px 0, 100% 0, 100% 100%, 14px 100%, 0 50%)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-background/70" />
            {item.variants[0]?.price ?? "—"} DA
          </div>
        </div>

        <p className="font-heading text-sm font-semibold text-foreground">
          {item.name}
        </p>

        {item.description && (
          <p className="line-clamp-2 text-xs text-foreground/60">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}
