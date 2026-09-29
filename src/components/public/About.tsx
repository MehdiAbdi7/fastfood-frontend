"use client";

import { useEffect, useRef, useState } from "react";

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [stats, setStats] = useState({ addresses: 0, homemade: 0, hours: 0 });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const finalStats = { addresses: 2, homemade: 100, hours: 13 };
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      const frameId = requestAnimationFrame(() => setStats(finalStats));
      return () => cancelAnimationFrame(frameId);
    }

    let frameId = 0;
    let hasStarted = false;

    const animate = () => {
      if (hasStarted) return;
      hasStarted = true;
      const startTime = performance.now();
      const duration = 2200;

      const update = (time: number) => {
        const progress = Math.min((time - startTime) / duration, 1);
        const easedProgress = 1 - (1 - progress) ** 3;

        setStats({
          addresses: Math.round(finalStats.addresses * easedProgress),
          homemade: Math.round(finalStats.homemade * easedProgress),
          hours: Math.round(finalStats.hours * easedProgress),
        });

        if (progress < 1) frameId = requestAnimationFrame(update);
      };

      frameId = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, []);

  // La vidéo ne se télécharge qu'à l'approche de la section (preload="none"
  // + lecture déclenchée ici) : avec autoPlay, elle pesait sur le premier
  // chargement de l'accueil alors qu'elle est sous la ligne de flottaison.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => setIsPlaying(false));
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

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
      ref={sectionRef}
      className="relative isolate overflow-hidden contain-paint px-2 py-16 sm:px-8 sm:py-20"
    >
      <div className="mx-auto flex flex-col lg:flex-row max-w-6xl items-center gap-8 rounded-4xl background dark:bg-primary/30 px-4 py-8 shadow-[0_0_25px_5px_rgba(217,169,77,0.45)] shadow-primary/30 backdrop-blur-2xl sm:gap-10 sm:px-8 sm:py-12  md:gap-16 border border-primary">
        <div className="flex flex-col items-center gap-4 text-center sm:text-left md:items-start">
          <span className="font-heading text-sm font-bold uppercase tracking-[0.18em] text-foreground/70">
            L&apos;esprit Niwa
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

          <div className="mt-4 grid w-full grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            <div className="min-w-0 rounded-2xl border border-primary/60 bg-background/70 p-2 text-center sm:p-3 md:p-4">
              <p className="font-heading text-2xl font-bold text-accent-green sm:text-3xl">
                {stats.addresses}
              </p>
              <p className="text-xs font-semibold leading-tight text-foreground/80 wrap-break-words sm:text-sm">
                Adresses à Alger
              </p>
            </div>
            <div className="min-w-0 rounded-2xl border border-primary/60 bg-background/70 p-2 text-center sm:p-3 md:p-4">
              <p className="font-heading text-2xl font-bold text-accent-green sm:text-3xl">
                {stats.homemade}%
              </p>
              <p className="text-xs font-semibold leading-tight text-foreground/80 wrap-break-words sm:text-sm">
                Fait maison
              </p>
            </div>
            <div className="min-w-0 rounded-2xl border border-primary/60 bg-background/70 p-2 text-center sm:p-3 md:p-4">
              <p className="font-heading text-2xl font-bold text-accent-green sm:text-3xl">
                {stats.hours}h+
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
            poster="/niwa-video-poster.webp"
            preload="none"
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
