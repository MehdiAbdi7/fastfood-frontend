"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  nextHeroSlide,
  prevHeroSlide,
} from "@/features/heroCarousel/heroCarouselSlice";

const SHARED_IMAGE_CLASSNAME =
  "absolute left-1/2 top-35 sm:top-50 w-[70%] sm:w-[80%] -translate-x-1/2 object-contain shadow-food-md transition-[transform,opacity] duration-700 ease-out ";

const AUTOPLAY_INTERVAL_MS = 4000;
const SLIDE_START_OFFSET = "7rem";
const SWIPE_THRESHOLD_PX = 40;

export interface HeroSlide {
  src: string;
  alt: string;
  label: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const currentIndex = useAppSelector(
    (state) => state.heroCarousel.currentIndex,
  );
  const dispatch = useAppDispatch();
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      dispatch(nextHeroSlide(slides.length));
    }, AUTOPLAY_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [dispatch, slides.length]);

  const goToNextSlide = () => {
    dispatch(nextHeroSlide(slides.length));
  };

  const goToPrevSlide = () => {
    dispatch(prevHeroSlide(slides.length));
  };

  // Swipe tactile — on ne touche qu'à l'axe horizontal,
  // donc le scroll vertical de la page n'est jamais bloqué
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const deltaX = touchStartX.current - e.changedTouches[0].clientX;

    if (deltaX > SWIPE_THRESHOLD_PX) {
      goToNextSlide(); // swipe vers la gauche → photo suivante
    } else if (deltaX < -SWIPE_THRESHOLD_PX) {
      goToPrevSlide(); // swipe vers la droite → photo précédente
    }

    touchStartX.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative order-2 mx-auto sm:mx-0 aspect-square w-full max-w-80 max-h-80 sm:max-w-120 sm:max-h-120 bg-linear-to-t from-accent-mustard/50 via-transparent to-transparent rounded-full  shadow-[0_0_30px_5px_rgba(217,169,77,0.45)] shadow-accent-mustard/50"
    >
      <div
        className="absolute bottom-[6%] left-1/2 h-[8%] w-[70%]  rounded-full "
        aria-hidden="true"
      />

      {slides.map((slide, index) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          width={400}
          height={400}
          className={`${SHARED_IMAGE_CLASSNAME} ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transform:
              index === currentIndex
                ? "translateY(-50%)"
                : `translateY(calc(-50% - ${SLIDE_START_OFFSET}))`,
          }}
        />
      ))}

      {/* Label texte par slide, en overlay */}
      {slides.map((slide, index) => (
        <span
          key={`label-${slide.src}`}
          className={`absolute bottom-[17%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-background/70 px-4 py-1.5 text-xs font-semibold text-primary border-0.5 border-primary backdrop-blur-sm transition-opacity duration-700 ease-in-out sm:text-sm ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          {slide.label}
        </span>
      ))}

      {/* Flèche "photo précédente" */}
      <button
        type="button"
        onClick={goToPrevSlide}
        aria-label="Photo précédente"
        className="absolute left-[2%] top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-background/70 text-primary shadow-food-sm backdrop-blur-sm transition-transform hover:scale-110 sm:h-10 sm:w-10"
      >
        <span className="icon-[mdi--chevron-left] text-2xl" />
      </button>

      {/* Flèche "photo suivante" */}
      <button
        type="button"
        onClick={goToNextSlide}
        aria-label="Photo suivante"
        className="absolute right-[2%] top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-background/70 text-primary shadow-food-sm backdrop-blur-sm transition-transform hover:scale-110 sm:h-10 sm:w-10"
      >
        <span className="icon-[mdi--chevron-right] text-2xl" />
      </button>

      {/* Dots indicateurs, non cliquables, juste un repère visuel */}
      <div className="absolute bottom-[5%] left-1/2 z-10 flex -translate-x-1/2 gap-1.5 sm:gap-2">
        {slides.map((slide, index) => (
          <span
            key={slide.src}
            aria-hidden="true"
            className={` rounded-full transition-opacity duration-300 ${
              index === currentIndex
                ? "bg-accent-green opacity-100 h-2.5 w-2.5"
                : "bg-primary opacity-80 h-2 w-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
