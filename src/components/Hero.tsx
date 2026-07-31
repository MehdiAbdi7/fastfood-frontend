import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex min-h-dvh items-center overflow-hidden px-6">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 py-32 md:grid-cols-2 md:gap-6">
        {/* Collage photos */}
        <div className="relative order-2 mx-auto aspect-square w-full max-w-120 sm:max-w-140">
          <div
            className="absolute bottom-[6%] left-1/2 h-[8%] w-[70%] -translate-x-1/2 rounded-full blur-2xl bg-black/20 dark:bg-black/40"
            aria-hidden="true"
          />

          <Image
            src="/hero-pizza.png"
            alt="Pizza Niwa Food"
            width={400}
            height={400}
            className="absolute right-0 top-[4%] w-[72%] object-contain shadow-food-sm transition-transform duration-300 ease-in-out hover:scale-110"
          />

          <Image
            src="/hero-tacos.png"
            alt="Tacos Niwa Food"
            width={400}
            height={400}
            className="absolute left-[-4%] top-[8%] w-[68%] rotate-6 object-contain shadow-food-md transition-transform duration-300 ease-in-out hover:scale-110"
          />

          <Image
            src="/hero-burger1.png"
            alt="Burger Niwa Food"
            width={400}
            height={400}
            className="absolute bottom-10 right-[2%] w-[64%] rotate-2 object-contain shadow-food-lg transition-transform duration-300 ease-in-out hover:scale-110"
          />
        </div>

        {/* Texte */}
        <div className="order-1 flex flex-col gap-6">
          <span className="text-sm font-heading font-bold uppercase tracking-wide text-primary">
            Fast-food fait maison
          </span>
          <h1 className="font-heading text-4xl font-bold leading-tight text-accent-slate sm:text-5xl">
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
              className="inline-block rounded-full bg-primary px-7 py-3 font-bold text-on-primary transition-colors duration-300 ease-in-out hover:bg-accent-slate"
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
