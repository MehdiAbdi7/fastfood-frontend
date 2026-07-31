import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-dvh items-center overflow-hidden px-6">
      {/* Couche 1 : décoration, tout en fond */}
      <Image
        src="/deco-fastfood.png"
        alt=""
        fill
        priority
        aria-hidden="true"
        className="pointer-events-none -z-20 object-cover object-top "
      />

      {/* Couche 2 : fondu qui protège la lisibilité du texte, sans cacher totalement la déco */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-background/10 via-background/5 to-background/5 dark:from-background/10 dark:via-background/10 dark:to-background/10"
      />

      {/* Couche 3 : contenu réel */}
      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 py-28 md:grid-cols-2 md:gap-6">
        {/* Collage photos */}
        <div className="relative order-2 mx-auto aspect-square w-full max-w-120 sm:max-w-180 bg-accent-slate rounded-b-full rounded-tl-full ">
          <div
            className="absolute bottom-[6%] left-1/2 h-[8%] w-[70%] -translate-x-1/2 rounded-full blur-2xl bg-black/20 dark:bg-black/40"
            aria-hidden="true"
          />

          <Image
            src="/hero-pizza.png"
            alt="Pizza Niwa Food"
            width={400}
            height={400}
            className="absolute right-0 top-[14%] w-[62%]  object-contain shadow-food-sm transition-transform duration-300 ease-in-out hover:scale-130"
          />

          <Image
            src="/hero-tacos.png"
            alt="Tacos Niwa Food"
            width={400}
            height={400}
            className="absolute left-5 top-[10%] w-[58%]  rotate-6 object-contain shadow-food-md transition-transform duration-300 ease-in-out hover:scale-130"
          />

          <Image
            src="/hero-burger1.png"
            alt="Burger Niwa Food"
            width={400}
            height={400}
            className="absolute bottom-10 sm:bottom-20 right-[20%] w-[54%]  rotate-2 object-contain shadow-food-lg transition-transform duration-300 ease-in-out hover:scale-130"
          />
        </div>

        {/* Texte */}
        <div className="order-1 flex flex-col gap-6">
          <span className="text-sm font-heading font-bold uppercase tracking-wide text-primary">
            Fast-food fait maison
          </span>
          <h1 className="font-heading text-4xl font-bold leading-tight text-primary sm:text-5xl">
            Commandez vos plats préférés en toute simplicité
          </h1>
          <p className="max-w-md text-foreground">
            <span className="text-base text-accent-slate">
              Tacos, pizzas et burgers{" "}
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
              <p className="font-semibold text-accent-slate">1. Choisissez</p>
              <p className="text-foreground">
                Sur place, à emporter ou livraison
              </p>
            </div>
            <div>
              <p className="font-semibold text-accent-slate">2. Composez</p>
              <p className="text-foreground">Votre commande sur mesure</p>
            </div>
            <div>
              <p className="font-semibold text-accent-slate">3. Dégustez</p>
              <p className="text-foreground">Prêt en quelques minutes</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
