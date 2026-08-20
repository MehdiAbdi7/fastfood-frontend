"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

const EXIT_MS = 220;

interface SheetProps {
  onClose: () => void;
  /** La fermeture animée est fournie aux enfants : un bouton "Ajouter" doit
   *  pouvoir sortir proprement, pas disparaître d'un coup. */
  children: (close: () => void) => ReactNode;
  labelledBy?: string;
  width?: "md" | "sm";
  /**
   * "center" — boîte centrée à toutes les tailles. Le défaut : une fiche
   *   produit est un objet qu'on examine, on le pose au milieu du champ.
   * "bottom" — collée en bas sur mobile, centrée au-dessus de sm. Réservé au
   *   ticket, où le geste de tirer depuis le bas fait partie de la métaphore.
   */
  placement?: "center" | "bottom";
}

/**
 * Boîte modale du parcours de commande.
 *
 * Le composant n'est monté que lorsqu'il est ouvert — d'où le triptyque
 * enter → open → exit : "enter" pose l'état de départ, un rAF bascule sur
 * "open" pour que la transition CSS ait quelque chose à interpoler, et "exit"
 * rejoue l'inverse avant de rendre la main au parent.
 */
export function Sheet({
  onClose,
  children,
  labelledBy,
  width = "md",
  placement = "center",
}: SheetProps) {
  const [phase, setPhase] = useState<"enter" | "open" | "exit">("enter");

  useEffect(() => {
    const frame = requestAnimationFrame(() => setPhase("open"));
    return () => cancelAnimationFrame(frame);
  }, []);

  const close = useCallback(() => {
    setPhase("exit");
    setTimeout(onClose, EXIT_MS);
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", handleKeyDown);

    // Verrou centralisé : un simple `body.style.overflow = "hidden"` est sans
    // effet ici, l'overflow-x-clip du <html> coupant la propagation au
    // viewport. Voir lib/scrollLock.ts.
    lockScroll();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      unlockScroll();
    };
  }, [close]);

  if (typeof document === "undefined") return null;

  const isOpen = phase === "open";
  const isCentered = placement === "center";

  // Au centre, l'entrée se joue en échelle plutôt qu'en glissement : une boîte
  // qui monte du bas pour s'arrêter au milieu de l'écran donne l'impression
  // d'un tiroir mal fermé.
  const motionClasses = isCentered
    ? isOpen
      ? "translate-y-0 scale-100 opacity-100"
      : "translate-y-3 scale-95 opacity-0"
    : isOpen
      ? "translate-y-0 opacity-100 sm:scale-100"
      : "translate-y-full opacity-0 sm:translate-y-0 sm:scale-95";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      className={`fixed inset-0 z-50 flex justify-center ${
        isCentered ? "items-center p-4" : "items-end sm:items-center sm:p-6"
      }`}
    >
      <button
        type="button"
        aria-label="Fermer"
        onClick={close}
        className={`absolute inset-0 cursor-default bg-black/50 backdrop-blur-[2px] transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`relative flex w-full flex-col overflow-hidden border border-primary/15 bg-background shadow-2xl transition-all duration-200 ease-out ${
          isCentered
            ? "max-h-[88dvh] rounded-3xl"
            : "max-h-[92dvh] rounded-t-3xl sm:max-h-[86vh] sm:rounded-3xl"
        } ${width === "sm" ? "sm:max-w-md" : "sm:max-w-lg"} ${motionClasses}`}
      >
        {children(close)}
      </div>
    </div>,
    document.body,
  );
}
