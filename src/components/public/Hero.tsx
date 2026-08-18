import Link from "next/link";
import { HeroCarousel, type HeroSlide } from "./HeroCarousel";

const heroSlides: HeroSlide[] = [
  {
    src: "/hero-pizza.png",
    alt: "Pizza Niwa Food",
    label: "Pizza maison, pâte du jour",
  },
  {
    src: "/tacos-gilera.png",
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
    <section className="background relative isolate overflow-hidden px-4 sm:px-2 py-14 sm:py-16 ">
      {/* Contenu */}
      <div className="relative z-10 mx-auto flex flex-col sm:flex-row w-full max-w-7xl justify-evenly py-20 gap-10 sm:gap-0">
        <HeroCarousel slides={heroSlides} />

        <div className="flex flex-col justify-between items-center">
          {/* Texte avec stagger */}
          <div className="flex flex-col items-center text-center md:text-left gap-5  md:items-start">
            <span className="animate-[slideInLeft_0.6s_ease-out_0.1s_both] font-heading text-md md:text-lg font-bold uppercase tracking-wide text-accent-green">
              Fast-food fait maison
            </span>

            <h1 className="animate-[slideInLeft_0.6s_ease-out_0.2s_both] font-heading text-4xl font-bold leading-tight text-foreground sm:text-6xl">
              Commandez vos
              <br /> <span className="text-primary">plats préférés</span>
              <br /> en toute simplicité
            </h1>

            <p className="animate-[slideInLeft_0.6s_ease-out_0.3s_both] mx-auto max-w-md text-foreground font-semibold md:mx-0">
              <span className="text-lg  text-accent-green">
                Tacos, pizzas, burgers et salades{" "}
              </span>
              préparés minute, 100% faits maison. Sur place, à emporter, ou
              livrés directement chez vous.
            </p>

            <Link
              href="/commande"
              className="animate-[slideInLeft_0.6s_ease-out_0.4s_both] inline-flex w-fit items-center gap-2 rounded-full bg-primary my-4 px-3 py-3 font-bold text-background dark:text-foreground transition-all duration-300 ease-in-out hover:scale-105 hover:bg-accent-slate"
            >
              Passer votre commande
              <span className="icon-[line-md--arrow-right-circle-twotone] text-2xl" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
