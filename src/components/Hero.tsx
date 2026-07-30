import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="bg-background relative overflow-hidden px-6 min-h-dvh">
      {/* Frites décoratives */}
      <div
        aria-hidden="true"
        className="pointer-events-none hidden lg:block absolute left-0 inset-y-0 w-32 xl:w-40 opacity-90"
      >
        <Image
          src="/frites-deco.png"
          alt=""
          fill
          loading="eager"
          className="object-contain object-left"
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none hidden lg:block absolute right-0 inset-y-0 w-32 xl:w-40 opacity-90"
      >
        <Image
          src="/frites-deco.png"
          alt=""
          width={284}
          height={750}
          loading="eager"
          className="object-contain object-right -scale-x-100"
        />
      </div>

      <div className="mx-auto py-32 grid max-w-6xl items-center gap-2 md:grid-cols-2">
        {/* Collage photos */}
        <div className="relative order-2 h-80 w-full sm:h-96 md:h-112 md:max-w-md">
          {/* Contact shadow au sol — ancre le collage, visible dans les 2 thèmes */}
          <div
            className="absolute bottom-2 left-1/2 h-10 w-4/5 -translate-x-1/2 rounded-full blur-2xl bg-black/20 dark:bg-black/40"
            aria-hidden="true"
          />

          {/* Pizza — arrière-plan, ombre la plus légère */}
          <Image
            src="/hero-pizza.png"
            alt="Pizza Niwa Food"
            width={400}
            height={400}
            className="absolute -right-10 top-15 sm:-right-40 sm:top-0 w-[75%] sm:w-[80%] lg:w-full object-contain filter-[drop-shadow(0_10px_8px_rgb(139_69_19_/_0.35))_drop-shadow(0_4px_3px_rgb(0_0_0_/_0.2))] transition-transform duration-300 ease-in-out hover:scale-110"
          />

          {/* Tacos — plan intermédiaire */}
          <Image
            src="/hero-tacos.png"
            alt="Tacos Niwa Food"
            width={400}
            height={400}
            className="absolute -left-10 top-10 sm:-left-25 sm:-top-5 w-[70%] sm:w-[70%] lg:w-[95%] rotate-10 object-contain filter-[drop-shadow(0_14px_10px_rgb(139_69_19_/_0.4))_drop-shadow(0_5px_4px_rgb(0_0_0_/_0.25))] transition-transform duration-300 ease-in-out hover:scale-110"
          />

          {/* Burger — premier plan, ombre la plus marquée */}
          <Image
            src="/hero-burger1.png"
            alt="Burger Niwa Food"
            width={400}
            height={400}
            className="absolute -bottom-5 right-20 sm:-bottom-20 sm:-right-10 w-[55%] sm:w-[70%] lg:w-[90%] rotate-2 object-contain filter-[drop-shadow(0_20px_14px_rgb(139_69_19_/_0.45))_drop-shadow(0_8px_6px_rgb(0_0_0_/_0.3))] transition-transform duration-300 ease-in-out hover:scale-110"
          />
        </div>

        {/* Texte — EN SECOND sur mobile */}
        <div className="order-1 flex flex-col gap-6 ">
          <span className="text-sm font-bold uppercase tracking-wide text-primary">
            Fast-food fait maison
          </span>
          <h1 className="text-4xl font-bold leading-tight text-accent-slate md:text-5xl">
            Commandez vos plats préférés en toute simplicité
          </h1>
          <p className="max-w-md text-foreground">
            <span className="text-accent-slate text-md">
              Tacos, pizzas et burgers{" "}
            </span>
            préparés minute, 100% faits maison. Sur place, à emporter, ou livrés
            directement chez vous.
          </p>
          <div>
            <Link
              href="/commande"
              className="inline-block rounded-full bg-primary px-7 py-3 font-bold text-on-primary transition-colors duration-300 ease-in-out hover:text-accent-slate"
            >
              Voir le menu
            </Link>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-4 text-sm sm:grid-cols-3">
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
