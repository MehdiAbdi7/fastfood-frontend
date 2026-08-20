"use client";

import { Children, isValidElement } from "react";
import { useReveal } from "@/features/reveal/useReveal";

interface RevealProps {
  children: React.ReactNode;
  /**
   * Anime les ENFANTS DIRECTS en cascade plutôt que le bloc entier.
   * C'est le mode à privilégier : révéler un conteneur de 600px de haut d'un
   * seul tenant produit un décalage, pas un mouvement. Révéler son surtitre,
   * puis son titre, puis son contenu produit une lecture.
   */
  stagger?: boolean;
  /** Écart entre deux enfants en mode cascade, en ms. */
  staggerStep?: number;
  /** Retard avant le départ, en ms. */
  delay?: number;
  /** Durée de la transition, en ms. */
  duration?: number;
  className?: string;
}

// État d'arrivée. Pas de constante symétrique pour l'état masqué : celui-ci
// porte des préfixes motion-safe: sur le déplacement et le flou, mais pas sur
// l'opacité — un visiteur qui a demandé la réduction des animations doit
// recevoir un fondu simple, jamais un contenu figé décalé de 14px. Les deux
// états ne sont donc pas de même forme, et les écrire en parallèle donnerait
// une fausse symétrie.
const SHOWN = "translate-y-0 opacity-100 blur-0";

// Déplacement vertical court plutôt qu'un glissement latéral : sur un bloc
// pleine largeur, 40px horizontaux se lisent comme un saut de mise en page.
// 14px verticaux accompagnés d'un flou se lisent comme une mise au point.
const HIDDEN_MOTION_SAFE =
  "opacity-0 motion-safe:translate-y-3.5 motion-safe:blur-[3px]";

// Courbe légèrement débordante : le contenu dépasse d'un cheveu sa position
// finale avant de se poser. C'est ce qui distingue une apparition d'un fondu.
const EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

const TRANSITION =
  "transition-[opacity,transform,filter] will-change-[opacity,transform]";

/**
 * Révèle son contenu à l'entrée dans le viewport.
 *
 * Transition CSS sur opacity/transform/filter plutôt qu'une @keyframes :
 * l'état de départ doit rester appliqué tant que l'élément n'est pas visible,
 * ce qu'une animation déclenchée au montage ne permet pas.
 *
 * duration et delay passent par le style inline : les classes Tailwind sont
 * générées à la compilation, donc une valeur arbitraire passée en prop ne
 * produirait aucune classe.
 */
export function Reveal({
  children,
  stagger = false,
  staggerStep = 110,
  delay = 0,
  duration = 900,
  className = "",
}: RevealProps) {
  const { ref, isRevealed } = useReveal();

  const stateClasses = isRevealed ? SHOWN : HIDDEN_MOTION_SAFE;

  if (!stagger) {
    return (
      <div
        ref={ref}
        className={`${TRANSITION} ${stateClasses} ${className}`}
        style={{
          transitionDuration: `${duration}ms`,
          transitionDelay: `${delay}ms`,
          transitionTimingFunction: EASING,
        }}
      >
        {children}
      </div>
    );
  }

  // En cascade, chaque enfant direct reçoit son propre délai. On enveloppe
  // plutôt que de cloner : cloneElement écraserait le className de l'enfant,
  // et beaucoup des nôtres en dépendent (grilles, flex).
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <div ref={ref} className={className}>
      {items.map((child, index) => (
        <div
          key={index}
          className={`${TRANSITION} ${stateClasses}`}
          style={{
            transitionDuration: `${duration}ms`,
            transitionDelay: `${delay + index * staggerStep}ms`,
            transitionTimingFunction: EASING,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
