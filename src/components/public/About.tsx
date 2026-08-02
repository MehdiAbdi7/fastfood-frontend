"use client";

import { useRef, useState } from "react";
import Image from "next/image";

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
      className="relative isolate overflow-hidden px-6 py-10"
    >
      {/* Décoration — tout en dessous */}
      <Image
        src="/deco-fastfood2.png"
        alt=""
        fill
        priority
        aria-hidden="true"
        className="pointer-events-none -z-20 hidden -scale-x-100 object-cover object-top lg:block"
      />

      {/* Fondu — au-dessus de la déco, en dessous du contenu */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-linear-to-r from-background/10 via-background/5 to-background/5 dark:from-background/10 dark:via-background/10 dark:to-background/10"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className="flex flex-col gap-4">
          <span className="font-heading text-sm font-bold uppercase tracking-wide text-accent-green">
            Notre histoire
          </span>
          <h2 className="font-heading text-3xl font-bold text-primary sm:text-4xl">
            Le burger artisanal, c&apos;est notre spécialité
          </h2>
          <p className="text-foreground/80">
            Chez Niwa Food, tout part d&apos;une idée simple : préparer chaque
            burger, tacos et pizza comme s&apos;il était le premier. Pain toasté
            minute, viande fraîche, sauces maison — rien n&apos;est préparé à
            l&apos;avance et laissé à attendre.
          </p>
          <p className="text-foreground/80">
            Depuis nos cuisines à Kouba et Chéraga, on sert celles et ceux qui
            veulent manger vite sans sacrifier le goût — sur place, à emporter,
            ou livré directement chez vous.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="rounded-2xl bg-primary/5 p-4">
              <p className="font-heading text-2xl font-bold text-accent-green">
                2
              </p>
              <p className="text-xs text-foreground/70">Adresses à Alger</p>
            </div>
            <div className="rounded-2xl bg-primary/5 p-4">
              <p className="font-heading text-2xl font-bold text-accent-green">
                100%
              </p>
              <p className="text-xs text-foreground/70">Fait maison</p>
            </div>
            <div className="rounded-2xl bg-primary/5 p-4">
              <p className="font-heading text-2xl font-bold text-accent-green">
                13h+
              </p>
              <p className="text-xs text-foreground/70">
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
          className="group relative aspect-square w-full cursor-pointer overflow-hidden rounded-[2.5rem] bg-primary/10 shadow-food-lg"
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

          {/* Bouton play/pause, visible au survol ou quand en pause */}
          <div
            className={`absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
              isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
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
