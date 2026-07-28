import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background px-6 mt-10 md:py-24 min-h-screen">
      {/* Feuilles décoratives */}
      <Image
        src="/feuille-verte.png"
        alt=""
        width={750}
        height={750}
        aria-hidden="true"
        className="pointer-events-none hidden lg:block absolute -left-30 bottom-0 scale-x-100 object-contain opacity-80"
      />
      <Image
        src="/feuille-verte.png"
        alt=""
        width={750}
        height={750}
        aria-hidden="true"
        className="pointer-events-none hidden lg:block absolute -right-20 top-0 -scale-x-100 object-contain opacity-80"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        {/* Collage photos — EN PREMIER sur mobile */}
        <div className="relative order-1 mx-auto h-80 w-full max-w-sm sm:h-96 md:order-2 md:h-112 md:max-w-md">
          <Image
            src="/hero-pizza.png"
            alt="Pizza Niwa Food"
            width={500}
            height={500}
            className="absolute -right-10 top-20 sm:-right-25 sm:-top-10 w-[75%] sm:w-full object-contain drop-shadow-xl"
          />
          <Image
            src="/hero-tacos.png"
            alt="Tacos Niwa Food"
            width={450}
            height={450}
            className="absolute -left-10 top-15 sm:-left-25 sm:-top-5 w-[70%] sm:w-[95%] rotate-10 object-contain drop-shadow-xl"
          />
          <Image
            src="/hero-burger.png"
            alt="Burger Niwa Food"
            width={400}
            height={400}
            className="absolute -bottom-5 right-20 sm:bottom-0 sm:-right-10 w-[55%] sm:w-[90%] rotate-2 object-contain drop-shadow-2xl"
          />
        </div>

        {/* Texte — EN SECOND sur mobile */}
        <div className="order-2 flex flex-col gap-6 md:order-1">
          <span className="text-sm font-bold uppercase tracking-wide text-primary">
            Fast-food fait maison
          </span>
          <h1 className="text-4xl font-bold leading-tight text-accent-slate md:text-5xl">
            Commandez vos plats préférés en toute simplicité
          </h1>
          <p className="max-w-md text-foreground">
            Tacos, pizzas et burgers préparés minute, 100% faits maison. Sur
            place, à emporter, ou livrés directement chez vous.
          </p>
          <div>
            <Link
              href="/commande"
              className="inline-block rounded-full bg-primary px-7 py-3 font-bold text-on-primary transition-colors duration-300 ease-in-out hover:text-accent-slate"
            >
              Voir le menu
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
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
