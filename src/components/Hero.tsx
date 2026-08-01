"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const SHARED_IMAGE_CLASSNAME =
  "absolute left-1/2 top-40 sm:top-50 w-[100%] -translate-x-1/2 object-contain shadow-food-md transition-[transform,opacity] duration-700 ease-out ";

const heroImages = [
  {
    src: "/hero-pizza.png",
    alt: "Pizza Niwa Food",
    className: SHARED_IMAGE_CLASSNAME,
    label: "Pizza maison, pâte du jour",
  },
  {
    src: "/hero-tacos.png",
    alt: "Tacos Niwa Food",
    className: SHARED_IMAGE_CLASSNAME,
    label: "Tacos généreux, sauce signature",
  },
  {
    src: "/hero-burger1.png",
    alt: "Burger Niwa Food",
    className: SHARED_IMAGE_CLASSNAME,
    label: "Burger juteux, pain toasté",
  },
  {
    src: "/salade.png",
    alt: "Salade César Niwa Food",
    className: SHARED_IMAGE_CLASSNAME,
    label: "Salade César, croquante et fraîche",
  },
];

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

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
        {/* Collage photos en carousel */}
        <div className="relative order-2 mx-auto aspect-square w-full max-w-100 sm:max-w-120 bg-primary/10 backdrop-blur-2xl rounded-full ">
          <div
            className="absolute bottom-[6%] left-1/2 h-[8%] w-[70%] -translate-x-1/2 rounded-full blur-2xl bg-black/20 dark:bg-black/40"
            aria-hidden="true"
          />

          {heroImages.map((img, index) => (
            <Image
              key={img.src}
              src={img.src}
              alt={img.alt}
              width={400}
              height={400}
              className={`${img.className} ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
              style={{
                transform:
                  index === currentIndex
                    ? "translateY(-50%)"
                    : "translateY(calc(-50% - 7rem))",
              }}
            />
          ))}

          {/* Label texte par image, en overlay */}
          {heroImages.map((img, index) => (
            <span
              key={`label-${img.src}`}
              className={`absolute bottom-[13%] left-1/2 -translate-x-1/2 whitespace-nowrap bg-background/70 rounded-full px-4 py-1.5 text-xs font-semibold text-accent-green shadow-food-sm backdrop-blur-sm transition-opacity duration-700 ease-in-out sm:text-sm ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              {img.label}
            </span>
          ))}

          {/* Dots indicateurs, non cliquables, juste un repère visuel - à l'intérieur du cercle pour rester toujours visibles */}
          <div className="absolute bottom-[5%] left-1/2 z-10 flex -translate-x-1/2 gap-1.5 sm:gap-2">
            {heroImages.map((img, index) => (
              <span
                key={img.src}
                aria-hidden="true"
                className={`h-2 w-2 rounded-full bg-primary transition-opacity duration-300 ${
                  index === currentIndex ? "opacity-100" : "opacity-40"
                }`}
              />
            ))}
          </div>
        </div>

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
