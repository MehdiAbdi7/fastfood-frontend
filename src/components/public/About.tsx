"use client";

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
      className="relative isolate overflow-hidden contain-paint px-6 py-16 sm:px-8 sm:py-24 bg-transparent sm:bg-linear-to-tl from-primary/40 via-background to-primary/60"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-8 rounded-4xl bg-accent-green/60 dark:bg-accent-green/30 px-4 py-8 shadow-[0_0_30px_5px_rgba(217,169,77,0.45)] shadow-accent-green backdrop-blur-2xl sm:gap-10 sm:px-8 sm:py-12 md:grid-cols-2 md:gap-16 border border-foreground">
        <div className="flex flex-col items-center gap-4 text-center sm:text-left md:items-start">
          <span className="font-heading text-lg font-bold uppercase tracking-wide text-foreground ">
            Notre histoire
          </span>
          <h2 className="font-heading text-2xl font-bold leading-tight text-accent-green wrap-break-words sm:text-3xl md:text-4xl">
            Le burger artisanal, c&apos;est notre spécialité
          </h2>
          <p className="text-md font-semibold leading-relaxed text-foreground wrap-break-words">
            Chez Niwa Food, tout part d&apos;une idée simple : préparer chaque
            burger, tacos et pizza comme s&apos;il était le premier. Pain toasté
            minute, viande fraîche, sauces maison — rien n&apos;est préparé à
            l&apos;avance et laissé à attendre.
          </p>
          <p className="text-md font-semibold leading-relaxed text-foreground wrap-break-words">
            Depuis nos cuisines à Kouba et Chéraga, on sert celles et ceux qui
            veulent manger vite sans sacrifier le goût — sur place, à emporter,
            ou livré directement chez vous.
          </p>

          <div className="mt-4 grid w-full grid-cols-3 gap-1 sm:gap-3 md:gap-4">
            <div className="min-w-0 rounded-2xl text-center border border-accent-green p-2 sm:p-3 md:p-4">
              <p className="font-heading text-xl font-bold text-primary/80 sm:text-2xl">
                2
              </p>
              <p className="text-xs font-semibold leading-tight text-foreground/80 wrap-break-words sm:text-sm">
                Adresses à Alger
              </p>
            </div>
            <div className="min-w-0 rounded-2xl text-center border border-accent-green p-2 sm:p-3 md:p-4">
              <p className="font-heading text-xl font-bold text-primary/80 sm:text-2xl">
                100%
              </p>
              <p className="text-xs font-semibold leading-tight text-foreground/80 wrap-break-words sm:text-sm">
                Fait maison
              </p>
            </div>
            <div className="min-w-0 rounded-2xl text-center border border-accent-green p-2 sm:p-3 md:p-4">
              <p className="font-heading text-xl font-bold text-primary/80 sm:text-2xl">
                13h+
              </p>
              <p className="text-xs font-semibold leading-tight text-foreground/80 wrap-break-words sm:text-sm">
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
