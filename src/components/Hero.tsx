import Image from "next/image";
import Link from "next/link";
import { HeroCarousel, type HeroSlide } from "./HeroCarousel";

const heroSlides: HeroSlide[] = [
  {
    src: "/hero-pizza.png",
    alt: "Pizza Niwa Food",
    label: "Pizza maison, pâte du jour",
  },
  {
    src: "/hero-tacos.png",
    alt: "Tacos Niwa Food",
    label: "Tacos généreux, sauce signature",
  },
  {
    src: "/hero-burger1.png",
    alt: "Burger Niwa Food",
    label: "Burger juteux, pain toasté",
  },
  {
    src: "/salade.png",
    alt: "Salade César Niwa Food",
    label: "Salade César, croquante et fraîche",
  },
];

export function Hero() {
  return (
    <section className="relative isolate flex min-h-dvh items-center overflow-hidden px-6">
      {/* Couche 1 : décoration, tout en fond */}
      <Image
        src="/deco-fastfood2.png"
        alt=""
        fill
        priority
        aria-hidden="true"
        className="pointer-events-none hidden lg:block -z-20 object-cover object-top "
      />

      {/* Couche 2 : fondu qui protège la lisibilité du texte, sans cacher totalement la déco */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-background/10 via-background/5 to-background/5 dark:from-background/10 dark:via-background/10 dark:to-background/10"
      />

      {/* Couche 3 : contenu réel */}
      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 py-28 md:grid-cols-2 md:gap-6">
        <HeroCarousel slides={heroSlides} />

        {/* Texte */}
        <div className="order-1 flex flex-col gap-6">
          <span className="text-sm font-heading font-bold uppercase tracking-wide text-accent-green">
            Fast-food fait maison
          </span>
          <h1 className="font-heading text-4xl font-bold leading-tight text-primary sm:text-5xl">
            Commandez vos plats préférés en toute simplicité
          </h1>
          <p className="max-w-md text-foreground">
            <span className="text-base text-accent-green">
              Tacos, pizzas, burgers et salades{" "}
            </span>
            préparés minute, 100% faits maison. Sur place, à emporter, ou livrés
            directement chez vous.
          </p>
          <div>
            <Link
              href="/commande"
              className="inline-block rounded-full bg-primary px-7 py-3 font-bold text-on-primary transition-colors duration-300 ease-in-out hover:bg-accent-slate hover:scale-105"
            >
              Voir le menu
            </Link>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold text-primary">1. Choisissez</p>
              <p className="text-foreground">
                Sur place, à emporter ou livraison
              </p>
            </div>
            <div>
              <p className="font-semibold text-primary">2. Composez</p>
              <p className="text-foreground">Votre commande sur mesure</p>
            </div>
            <div>
              <p className="font-semibold text-primary">3. Dégustez</p>
              <p className="text-foreground">Prêt en quelques minutes</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
