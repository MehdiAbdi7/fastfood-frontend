// page.tsx

import { About } from "@/components/public/About";
import { BestSellers } from "@/components/public/BestSellers";
import { Contact } from "@/components/public/Contact";
import { Hero } from "@/components/public/Hero";
import { HowItWorks } from "@/components/public/HowItWorks";
import { Testimonials } from "@/components/public/Testimonials";
import Image from "next/image";

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
            priority
            className="object-cover object-center rounded-2xl"
          />
        </div>
      </div>

      <HowItWorks />
      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 top-0 z-20 hidden -translate-y-1/2 sm:h-240 sm:w-56 xl:block"
        >
          <Image
            src="/deco.png"
            alt=""
            fill
            priority
            className="object-contain object-center"
          />
        </div>
      </div>
      <BestSellers />
      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 top-0 z-20 hidden -translate-y-1/2 sm:h-240 sm:w-56 xl:block"
        >
          <Image
            src="/deco.png"
            alt=""
            fill
            priority
            className="object-contain object-center"
          />
        </div>
      </div>
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
            priority
            className="object-contain object-center"
          />
        </div>
      </div>

      <Testimonials />

      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-7 top-125 z-20 -scale-x-100 hidden -translate-y-1/2 sm:h-112 sm:w-56 xl:block"
        >
          <Image
            src="/sauces2.png"
            alt=""
            fill
            priority
            className="object-cover object-center rounded-2xl"
          />
        </div>
      </div>
      <Contact />
    </>
  );
}
