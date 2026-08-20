// page.tsx

import { About } from "@/components/public/About";
import { BestSellers } from "@/components/public/BestSellers";
import { Contact } from "@/components/public/Contact";
import { Hero } from "@/components/public/Hero";
import { HowItWorks } from "@/components/public/HowItWorks";
import { Testimonials } from "@/components/public/Testimonials";
import Image from "next/image";

// Toutes les décorations ci-dessous vivent dans un conteneur `w-56` visible à
// partir de xl uniquement : leur largeur d'affichage est donc constante, d'où
// un `sizes` fixe. Sans lui, Next suppose 100vw et sert la variante la plus
// large du srcset pour un rendu de 224 px.
const DECO_SIZES = "224px";

export default function Home() {
  return (
    <>
      <Hero />

      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-7 top-50 z-20 hidden h-96 w-48 -translate-y-1/2 sm:h-112 sm:w-56 xl:block"
        >
          <Image
            src="/sauces.png"
            alt=""
            fill
            sizes={DECO_SIZES}
            className="rounded-2xl object-cover object-center"
          />
        </div>
      </div>

      <HowItWorks />

      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 top-100 z-20 hidden -translate-y-1/2 sm:h-240 sm:w-56 xl:block"
        >
          {/* Pas de `priority` : ces images sont purement ornementales et
              masquées sous xl. Les précharger volait la priorité de la photo
              du hero, qui est le vrai contenu de la page. */}
          <Image
            src="/deco.png"
            alt=""
            fill
            sizes={DECO_SIZES}
            className="object-contain object-center"
          />
        </div>
      </div>

      <BestSellers />

      <About />

      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-7 top-0 z-20 hidden -translate-y-1/2 sm:h-240 sm:w-56 xl:block"
        >
          <Image
            src="/deco.png"
            alt=""
            fill
            sizes={DECO_SIZES}
            className="object-contain object-center"
          />
        </div>
      </div>

      <Testimonials />

      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-7 top-125 z-20 hidden -translate-y-1/2 -scale-x-100 sm:h-112 sm:w-56 xl:block"
        >
          <Image
            src="/sauces2.png"
            alt=""
            fill
            sizes={DECO_SIZES}
            className="rounded-2xl object-cover object-center"
          />
        </div>
      </div>

      <Contact />
    </>
  );
}
