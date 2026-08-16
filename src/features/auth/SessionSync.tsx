"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { sessionLoaded } from "./authSlice";
import type { User } from "@/types/user";

/**
 * Pousse dans Redux la session déjà résolue par le layout serveur.
 *
 * Le dispatch est dans un useEffect, pas pendant le rendu : Redux notifie ses
 * abonnés de façon synchrone, donc dispatcher pendant le rendu revient à
 * mettre à jour d'autres composants (LoginPage, la sidebar...) alors que
 * celui-ci n'a pas fini de se rendre — ce que React signale par
 * « Cannot update a component while rendering a different component ».
 *
 * Contrairement à l'ancien AuthHydrator, ça ne réintroduit pas d'écran de
 * chargement : le user arrive du serveur, déjà résolu. Il n'y a aucune lecture
 * asynchrone à attendre, juste un aller-retour de rendu imperceptible.
 */
export function SessionSync({ user }: { user: User | null }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(sessionLoaded(user));
  }, [dispatch, user]);

  return null;
}
