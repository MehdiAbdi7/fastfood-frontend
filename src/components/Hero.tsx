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
    src: "/frites.png",
    alt: "Frites Niwa Food",
    label: "Frites croustillantes dorées",
  },
  {
    src: "/salade.png",
    alt: "Salade César Niwa Food",
    label: "Salade César, croquante et fraîche",
  },
];

export function Hero() {
  return (
    <section className="relative isolate flex min-h-dvh items-center overflow-hidden py-3 px-6">
      {/* Décoration */}
      <Image
        src="/deco-fastfood2.png"
        alt=""
        fill
        priority
        aria-hidden="true"
        className="pointer-events-none -z-20 hidden object-cover object-top lg:block"
      />

      {/* Fondu */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-background/10 via-background/5 to-background/5 dark:from-background/10 dark:via-background/10 dark:to-background/10"
      />

      {/* Contenu */}
      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-1 py-20 md:grid-cols-2 md:gap-6">
        <HeroCarousel slides={heroSlides} />

        {/* Texte avec stagger */}
        <div className="order-1 flex flex-col gap-2">
          <span className="animate-[slideInLeft_0.6s_ease-out_0.1s_both] font-heading text-sm font-bold uppercase tracking-wide text-accent-green">
            Fast-food fait maison
          </span>

          <h1 className="animate-[slideInLeft_0.6s_ease-out_0.2s_both] font-heading text-4xl font-bold leading-tight text-primary sm:text-5xl">
            Commandez vos plats préférés en toute simplicité
          </h1>

          <p className="animate-[slideInLeft_0.6s_ease-out_0.3s_both] max-w-md text-foreground">
            <span className="text-base text-accent-green">
              Tacos, pizzas, burgers et salades{" "}
            </span>
            préparés minute, 100% faits maison. Sur place, à emporter, ou livrés
            directement chez vous.
          </p>

          <Link
            href="/commande"
            className="animate-[slideInLeft_0.6s_ease-out_0.4s_both] inline-flex w-fit items-center gap-2 rounded-full bg-primary my-4 px-3 py-3 font-bold text-on-primary transition-all duration-300 ease-in-out hover:scale-105 hover:bg-accent-slate"
          >
            Passer votre commande
            <span className="icon-[line-md--arrow-right-circle-twotone] text-2xl" />
          </Link>

          <div className="animate-[slideInLeft_0.6s_ease-out_0.5s_both] mt-2 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold text-accent-green">1. Choisissez</p>
              <p className="text-foreground">
                Sur place, à emporter ou livraison
              </p>
            </div>
            <div>
              <p className="font-semibold text-accent-green">2. Composez</p>
              <p className="text-foreground">Votre commande sur mesure</p>
            </div>
            <div>
              <p className="font-semibold text-accent-green">3. Dégustez</p>
              <p className="text-foreground">Prêt en quelques minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badges de confiance */}
      <div className="absolute bottom-6 left-0 right-0 z-10 px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-3 sm:gap-4 md:justify-between">
          {[
            { icon: "icon-[line-md--home]", text: "Livraison à domicile" },
            { icon: "icon-[mdi--food]", text: "100% frais & maison" },
            { icon: "icon-[mdi--cash-check]", text: "Paiement à la livraison" },
            {
              icon: "icon-[line-md--star-alt-filled]",
              text: "4.2/5 Avis Google ",
            },
          ].map((badge, i) => (
            <div
              key={badge.text}
              className="animate-[slideInLeft_0.6s_ease-out_both] flex items-center gap-2.5 rounded-full bg-accent-green/15 px-4 py-2 backdrop-blur-sm sm:px-5 sm:py-2.5"
              style={{ animationDelay: `${0.6 + i * 0.1}s` }}
            >
              <span className={badge.icon} />
              <span className="text-xs font-medium text-accent-green sm:text-sm">
                {badge.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
