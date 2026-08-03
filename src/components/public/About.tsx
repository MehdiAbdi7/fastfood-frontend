"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export function About() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section
      id="a-propos"
      className="relative isolate overflow-hidden contain-paint px-8 py-16 sm:px-6 sm:py-24"
    >
      {/* Décoration */}
      <Image
        src="/deco-fastfood2.png"
        alt=""
        fill
        priority
        aria-hidden="true"
        className="pointer-events-none -z-20 -scale-x-100 hidden object-cover object-top lg:block"
      />
      {/* Fondu */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-linear-to-r from-background/10 via-background/5 to-background/5 dark:from-background/10 dark:via-background/10 dark:to-background/10"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-8 rounded-4xl bg-accent-green/70 px-4 py-8 shadow-[0_0_20px_10px_rgba(217,169,77,0.45)] shadow-accent-green backdrop-blur-2xl sm:gap-10 sm:px-8 sm:py-12 md:grid-cols-2 md:gap-16">
        <div className="flex flex-col items-center gap-4 text-center sm:text-left md:items-start">
          <span className="font-heading text-lg font-bold uppercase tracking-wide text-accent-mustard sm:text-base">
            Notre histoire
          </span>
          <h2 className="font-heading text-2xl font-bold leading-tight text-foreground/90 wrap-break-words sm:text-3xl md:text-4xl">
            Le burger artisanal, c&apos;est notre spécialité
          </h2>
          <p className="text-md leading-relaxed text-background wrap-break-words sm:text-base">
            Chez Niwa Food, tout part d&apos;une idée simple : préparer chaque
            burger, tacos et pizza comme s&apos;il était le premier. Pain toasté
            minute, viande fraîche, sauces maison — rien n&apos;est préparé à
            l&apos;avance et laissé à attendre.
          </p>
          <p className="text-md leading-relaxed text-background wrap-break-words sm:text-base">
            Depuis nos cuisines à Kouba et Chéraga, on sert celles et ceux qui
            veulent manger vite sans sacrifier le goût — sur place, à emporter,
            ou livré directement chez vous.
          </p>

          {/* Stats — cols-3 forcé, texte adaptatif pour jamais déborder */}
          <div className="mt-4 grid w-full grid-cols-3 gap-1 sm:gap-3 md:gap-4">
            <div className="rounded-2xl text-center bg-accent-green/60 p-2 sm:p-3 md:p-4">
              <p className="font-heading text-xl font-bold text-foreground/90 sm:text-2xl">
                2
              </p>
              <p className="text-[10px] leading-tight text-foreground/80 wrap-break-words sm:text-xs">
                Adresses à Alger
              </p>
            </div>
            <div className="rounded-2xl text-center bg-accent-green/60 p-2 sm:p-3 md:p-4">
              <p className="font-heading text-xl font-bold text-foreground/90 sm:text-2xl">
                100%
              </p>
              <p className="text-[10px] leading-tight text-foreground/80 wrap-break-words sm:text-xs">
                Fait maison
              </p>
            </div>
            <div className="rounded-2xl text-center bg-accent-green/60 p-2 sm:p-3 md:p-4">
              <p className="font-heading text-xl font-bold text-foreground/90 sm:text-2xl">
                13h+
              </p>
              <p className="text-[10px] leading-tight text-foreground/80 wrap-break-words sm:text-xs">
                D&apos;ouverture/jour
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={togglePlay}
          aria-label={
            isPlaying ? "Mettre la vidéo en pause" : "Lancer la vidéo"
          }
          className="group relative aspect-square w-full cursor-pointer overflow-hidden contain-paint rounded-[2.5rem] bg-primary/10 shadow-food-lg will-change-transform"
        >
          <video
            ref={videoRef}
            src="/niwa-video.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />

          {/* Bouton play/pause */}
          <div
            className={`absolute inset-0 flex items-center justify-center rounded-4xl bg-black/30 transition-opacity duration-300 ${
              isPlaying
                ? "opacity-0 backdrop-blur-none group-hover:opacity-100 group-hover:backdrop-blur-sm"
                : "opacity-100 backdrop-blur-sm"
            }`}
          >
            <span
              className={`flex h-16 w-16 items-center justify-center rounded-full bg-background/90 text-primary ${
                isPlaying
                  ? "icon-[mdi--pause] text-3xl"
                  : "icon-[mdi--play] text-3xl"
              }`}
            />
          </div>
        </button>
      </div>
    </section>
  );
}
