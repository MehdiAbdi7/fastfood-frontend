// src/components/public/Testimonials.tsx

"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  nextTestimonial,
  prevTestimonial,
} from "@/features/testimonials/testimonialsSlice";

const AUTOPLAY_INTERVAL_MS = 5000;
const SWIPE_THRESHOLD_PX = 40;

interface Testimonial {
  name: string;
  location: "Kouba" | "Chéraga";
  rating: number;
  text: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sofiane B.",
    location: "Chéraga",
    rating: 5,
    text: "Le burger PIRELLI est devenu mon rituel du vendredi soir. Pain toasté, viande juteuse, rien à dire. La livraison a mis 25 minutes montre en main.",
  },
  {
    name: "Amina K.",
    location: "Kouba",
    rating: 5,
    text: "On a commandé pour toute la famille un dimanche, tacos et pizza. Tout est arrivé chaud et bien emballé. Les enfants ont adoré les frites Niwa.",
  },
  {
    name: "Yacine M.",
    location: "Chéraga",
    rating: 4,
    text: "Très bon rapport qualité-prix. J'ai mangé sur place, service rapide même en heure de pointe. Petit bémol sur l'attente un vendredi soir, sinon rien à redire.",
  },
  {
    name: "Lina H.",
    location: "Kouba",
    rating: 5,
    text: "La salade César est vraiment fraîche, pas comme certains fast-foods qui la préparent la veille. On sent que c'est fait minute.",
  },
  {
    name: "Nabil A.",
    location: "Chéraga",
    rating: 5,
    text: "Client depuis l'ouverture. La sauce maison sur le tacos GILERA est unique, je ne l'ai trouvée nulle part ailleurs à Alger.",
  },
  {
    name: "Meriem D.",
    location: "Kouba",
    rating: 4,
    text: "Bonne pizza, pâte bien fine et croustillante. On a commandé à emporter, prêt en 15 minutes comme annoncé. Je recommande.",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} sur 5 étoiles`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={`icon-[mdi--star] text-lg ${
            index < rating ? "text-accent-mustard" : "text-foreground/20"
          }`}
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  const currentIndex = useAppSelector(
    (state) => state.testimonials.currentIndex,
  );
  const dispatch = useAppDispatch();
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      dispatch(nextTestimonial(TESTIMONIALS.length));
    }, AUTOPLAY_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [dispatch]);

  const goToNext = () => dispatch(nextTestimonial(TESTIMONIALS.length));
  const goToPrev = () => dispatch(prevTestimonial(TESTIMONIALS.length));

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;

    if (deltaX > SWIPE_THRESHOLD_PX) goToNext();
    else if (deltaX < -SWIPE_THRESHOLD_PX) goToPrev();

    touchStartX.current = null;
  };

  return (
    <section
      id="avis"
      className="relative isolate overflow-hidden px-6 py-16 sm:px-8 sm:py-20"
    >
      <div className="mx-auto max-w-4xl rounded-4xl bg-background dark:bg-primary/30 px-4 py-8 shadow-[0_0_15px_5px_rgba(217,169,77,0.45)] shadow-primary backdrop-blur-md sm:px-8 sm:py-12 border border-foreground">
        <div className="mb-10 flex flex-col items-center gap-2 text-center">
          <span className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
            Ils nous font confiance
          </span>
          <h2 className="font-heading text-3xl font-bold text-accent-green sm:text-4xl">
            Ce que disent nos clients
          </h2>
        </div>

        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative mx-auto min-h-64 w-full max-w-2xl sm:min-h-56"
        >
          {TESTIMONIALS.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className={`absolute inset-0 flex flex-col items-center gap-4 rounded-3xl border border-primary bg-background p-6 text-center shadow-food-sm transition-[transform,opacity] duration-700 ease-out sm:p-8 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
              style={{
                transform:
                  index === currentIndex
                    ? "translateY(0)"
                    : "translateY(1.5rem)",
              }}
              aria-hidden={index !== currentIndex}
            >
              <span className="icon-[mdi--format-quote-open] text-3xl text-accent-green/60" />

              <p className="text-sm font-medium leading-relaxed text-foreground sm:text-base">
                {testimonial.text}
              </p>

              <StarRating rating={testimonial.rating} />

              <div className="flex flex-col items-center gap-0.5">
                <span className="font-heading text-sm font-bold text-foreground">
                  {testimonial.name}
                </span>
                <span className="flex items-center gap-1 text-xs text-accent-green">
                  <span className="icon-[mdi--map-marker] text-sm" />
                  {testimonial.location}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Flèches */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Avis précédent"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary/10 text-primary shadow-food-sm transition-transform hover:scale-110"
          >
            <span className="icon-[mdi--chevron-left] text-2xl" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {TESTIMONIALS.map((testimonial, index) => (
              <span
                key={testimonial.name}
                aria-hidden="true"
                className={`rounded-full transition-opacity duration-300 ${
                  index === currentIndex
                    ? "bg-accent-green opacity-100 h-2.5 w-2.5"
                    : "bg-primary opacity-80 h-2 w-2"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goToNext}
            aria-label="Avis suivant"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary/10 text-primary shadow-food-sm transition-transform hover:scale-110"
          >
            <span className="icon-[mdi--chevron-right] text-2xl" />
          </button>
        </div>
      </div>
    </section>
  );
}
