"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { nextHeroSlide } from "@/features/heroCarousel/heroCarouselSlice";

const SHARED_IMAGE_CLASSNAME =
  "absolute left-1/2 top-35 sm:top-50 w-[95%] -translate-x-1/2 object-contain shadow-food-md transition-[transform,opacity] duration-700 ease-out ";

const AUTOPLAY_INTERVAL_MS = 4000;
const SLIDE_START_OFFSET = "7rem";

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

  return (
    <div className="relative order-2 mx-auto aspect-square w-full max-w-80 sm:max-w-120 bg-linear-to-t from-transparent to-primary/60 lg:to-transparent backdrop-blur-lg shadow-2xl shadow-primary sm:-bg-linear-0  rounded-full ">
      <div
        className="absolute bottom-[6%] left-1/2 h-[8%] w-[70%] -translate-x-1/2 rounded-full blur-2xl bg-black/20 dark:bg-black/40"
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
          className={`absolute bottom-[13%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-background/70 px-4 py-1.5 text-xs font-semibold text-accent-green shadow-food-sm backdrop-blur-sm transition-opacity duration-700 ease-in-out sm:text-sm ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          {slide.label}
        </span>
      ))}

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
