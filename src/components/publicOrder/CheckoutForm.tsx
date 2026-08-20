"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckoutSummary } from "./CheckoutSummary";
import { useCart } from "@/features/publicOrder/useCart";
import {
  useGetPublicTablesQuery,
  useCreatePublicOrderMutation,
} from "@/features/publicOrder/publicOrderApi";
import { useOrderContext } from "@/features/orders/useOrderContext";
import { toOrderItemsPayload } from "@/lib/cartLine";
import { writeLastOrder } from "@/lib/lastOrder";
import { getApiErrorMessage } from "@/lib/apiError";
import { ORDER_TYPE_ICONS, ORDER_TYPE_LABELS } from "@/lib/orderLabels";
import { STORES, STORE_LABELS, type Store } from "@/types/store";
import type { CreateOrderPayload, OrderType } from "@/types/order";

const TYPE_OPTIONS: OrderType[] = ["dine_in", "takeaway", "delivery"];

const TYPE_HINTS: Record<OrderType, string> = {
  dine_in: "Vous êtes installé en salle, on vous apporte votre commande.",
  takeaway: "Vous passez la récupérer au comptoir.",
  delivery: "On vous livre. Les frais seront calculés selon votre adresse.",
};

interface CheckoutFormProps {
  /** IDs des produits encore commandables, résolus côté serveur. */
  availableItemIds: string[];
}

/* ---------- Champs, au style du site public ---------- */
// Volontairement locaux et non components/ui/Input : ces composants-là sont
// calibrés pour le dashboard (bg-surface, angles serrés). La carte publique a
// sa propre grammaire — champs hauts, bordures primary, cibles tactiles larges.

function Label({
  htmlFor,
  children,
  optional = false,
}: {
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-baseline gap-2 font-heading text-sm font-bold text-foreground"
    >
      {children}
      {optional && (
        <span className="text-xs font-semibold text-foreground/40">
          facultatif
        </span>
      )}
    </label>
  );
}

// bg-background/85 et non bg-background : le fond fixe doit rester perceptible
// derrière les champs, sinon la page ressemble à un formulaire posé sur une
// image plutôt qu'à un écran unifié.
const FIELD_CLASSES =
  "h-12 w-full rounded-xl border border-primary/25 bg-background/85 px-4 text-foreground outline-none transition-colors placeholder:text-foreground/40 focus:border-primary";

function LoadingScreen() {
  return (
    <div className="relative z-10 flex min-h-[60vh] items-center justify-center">
      <span
        aria-hidden="true"
        className="icon-[mdi--loading] animate-spin text-4xl text-primary"
      />
    </div>
  );
}

export function CheckoutForm({ availableItemIds }: CheckoutFormProps) {
  const router = useRouter();
  const { store: contextStore, tableId: contextTable } = useOrderContext();

  const { lines, total, count, isHydrated, reconcile, clear } = useCart();

  const [createOrder, { isLoading: isSubmitting }] =
    useCreatePublicOrderMutation();

  /**
   * Faux pendant le rendu serveur ET pendant l'hydratation.
   *
   * Sans ce garde, le branchement sur `isHydrated` casse l'hydratation :
   * CartHydrator est monté par le layout public, donc AU-DESSUS de cette page,
   * et son effet dispatche `cartRestored` avant que React n'hydrate ce
   * composant. Le serveur a rendu le spinner (store vide), le client rendrait
   * déjà le formulaire (store rempli) — les deux arbres divergent.
   *
   * Avec ce drapeau, le premier rendu client reproduit le HTML serveur à
   * l'identique, et le formulaire n'apparaît qu'au rendu suivant.
   */
  const [isMounted, setIsMounted] = useState(false);

  // Le rendu supplémentaire est précisément l'objectif : il sépare le rendu
  // d'hydratation (identique au HTML serveur) du rendu suivant, où le panier
  // restauré peut enfin être pris en compte.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // Le QR ne porte rien aujourd'hui (generateQRCode.ts produit un /commande
  // nu), mais si un jour tu passes à un QR par table, le contexte pré-remplit
  // ces deux champs et le client n'a plus qu'à donner son nom.
  const [type, setType] = useState<OrderType>(
    contextTable ? "dine_in" : "dine_in",
  );
  const [store, setStore] = useState<Store | null>(contextStore);
  const [tableId, setTableId] = useState(contextTable ?? "");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [remark, setRemark] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Sans ce drapeau, le clear() qui suit l'envoi viderait le panier, l'effet
  // ci-dessous verrait lines.length === 0 et renverrait vers /commande avant
  // que la navigation vers le suivi n'aboutisse.
  const hasSubmitted = useRef(false);

  const { data: tables, isLoading: isLoadingTables } = useGetPublicTablesQuery(
    { store: store as Store },
    { skip: type !== "dine_in" || !store },
  );

  // Deuxième passe de réconciliation : un produit peut avoir été retiré du
  // menu entre la carte et cet écran. Mieux vaut le voir ici qu'au 404 du POST.
  useEffect(() => {
    if (!isHydrated) return;
    reconcile(availableItemIds);
    // reconcile est recréé à chaque rendu et le reducer est idempotent :
    // le sortir des dépendances évite une boucle sans rien changer au résultat.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, availableItemIds]);

  // Panier vide = rien à finaliser. La garde attend l'hydratation, sinon elle
  // renverrait systématiquement à la carte au premier rendu.
  useEffect(() => {
    if (!isHydrated || hasSubmitted.current) return;
    if (lines.length === 0) router.replace("/commande");
  }, [isHydrated, lines.length, router]);

  function selectStore(next: Store) {
    setStore(next);
    // La liste des tables dépend du magasin : garder l'ancienne sélection
    // enverrait un ObjectId appartenant à l'autre restaurant.
    setTableId("");
  }

  function validate(): string | null {
    if (!store) return "Choisissez d'abord un restaurant";
    if (!fullName.trim()) return "Votre nom est requis";
    if (type === "dine_in" && !tableId) return "Choisissez votre table";
    if (type !== "dine_in" && phone.trim().length < 10) {
      return "Un numéro de téléphone est requis (10 chiffres minimum)";
    }
    if (type === "delivery" && !address.trim()) {
      return "L'adresse de livraison est requise";
    }
    return null;
  }

  async function handleSubmit() {
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const items = toOrderItemsPayload(lines);
    let payload: CreateOrderPayload;

    if (type === "dine_in") {
      // Pas de `store` ici : le backend le dérive de la table, précisément
      // pour qu'un client ne puisse pas le falsifier.
      payload = {
        type: "dine_in",
        table: tableId,
        client: { fullName: fullName.trim() },
        remark: remark.trim() || undefined,
        items,
      };
    } else if (type === "takeaway") {
      payload = {
        type: "takeaway",
        store: store as Store,
        client: { fullName: fullName.trim(), phone: phone.trim() },
        remark: remark.trim() || undefined,
        items,
      };
    } else {
      payload = {
        type: "delivery",
        store: store as Store,
        client: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
        },
        remark: remark.trim() || undefined,
        items,
      };
    }

    try {
      // Cas particulier : si la table portait déjà une commande active, le
      // backend fusionne et renvoie CETTE commande (200, pas 201). L'_id reçu
      // est alors celui de la commande existante — c'est voulu, le client
      // suivra bien le ticket qui sortira en cuisine.
      const created = await createOrder(payload).unwrap();

      hasSubmitted.current = true;
      writeLastOrder(created._id, created.dailyNumber);
      clear();

      router.replace(`/commande/suivi/${created._id}`);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Impossible d'envoyer la commande. Réessayez dans un instant.",
        ),
      );
    }
  }

  // Écran d'attente le temps que le panier soit relu du disque : afficher le
  // formulaire puis le faire disparaître serait plus déroutant.
  // isMounted en premier : voir plus haut, c'est ce qui garantit que le
  // premier rendu client est identique au HTML serveur.
  if (!isMounted || !isHydrated || lines.length === 0) {
    return <LoadingScreen />;
  }

  return (
    // relative z-10 obligatoire : FixedBackground est en z-0, donc positionné,
    // donc peint APRÈS les fonds des éléments non positionnés. Sans cette
    // remontée, tout le formulaire passerait derrière le motif.
    //
    // pb-16 et non pb-32 : le bouton n'est plus flottant, il n'y a plus de
    // hauteur à réserver sous le contenu.
    <div className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-16 pt-28">
      <header className="mb-6 flex items-center gap-3">
        <Link
          href="/commande"
          aria-label="Retour à la carte"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-background/60 text-foreground/60 backdrop-blur-sm transition-colors hover:border-primary hover:text-foreground"
        >
          <span aria-hidden="true" className="icon-[mdi--arrow-left] text-xl" />
        </Link>

        <div>
          <span className="font-heading text-xs font-bold uppercase tracking-wide text-accent-green">
            Dernière étape
          </span>
          <h1 className="font-heading text-2xl font-bold leading-tight text-foreground">
            Finaliser ma commande
          </h1>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        <CheckoutSummary lines={lines} total={total} count={count} />

        {/* ---------- Restaurant ---------- */}
        {/* En premier, et pas par hasard : la liste des tables en dépend, et
            les commandes à emporter comme en livraison exigent un magasin
            explicite côté backend. */}
        <section className="flex flex-col gap-2.5">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-foreground/70">
            Quel restaurant ?
          </h2>

          <div className="grid grid-cols-2 gap-2">
            {STORES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => selectStore(option)}
                aria-pressed={store === option}
                className={`flex min-h-14 items-center justify-center gap-2 rounded-xl border font-heading text-sm font-bold backdrop-blur-sm transition-colors ${
                  store === option
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-primary/25 bg-background/60 text-foreground/70 hover:border-primary/50"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="icon-[mdi--map-marker] text-lg"
                />
                {STORE_LABELS[option]}
              </button>
            ))}
          </div>
        </section>

        {/* ---------- Mode ---------- */}
        <section className="flex flex-col gap-2.5">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-foreground/70">
            Comment souhaitez-vous être servi ?
          </h2>

          <div className="grid grid-cols-3 gap-2">
            {TYPE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setType(option)}
                aria-pressed={type === option}
                className={`flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-bold backdrop-blur-sm transition-colors ${
                  type === option
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-primary/25 bg-background/60 text-foreground/70 hover:border-primary/50"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`${ORDER_TYPE_ICONS[option]} text-2xl`}
                />
                {ORDER_TYPE_LABELS[option]}
              </button>
            ))}
          </div>

          <p className="text-xs text-foreground/55">{TYPE_HINTS[type]}</p>
        </section>

        {/* ---------- Coordonnées ---------- */}
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-foreground/70">
            Vos informations
          </h2>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName">Votre nom</Label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Ex : Yacine"
              className={FIELD_CLASSES}
            />
            <p className="text-xs text-foreground/45">
              C&apos;est le nom qui sera appelé pour votre commande.
            </p>
          </div>

          {type === "dine_in" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="table">Votre table</Label>

              {!store ? (
                <p className="rounded-xl bg-background/70 px-4 py-3 text-sm text-foreground/55 backdrop-blur-sm">
                  Choisissez d&apos;abord un restaurant.
                </p>
              ) : isLoadingTables ? (
                <p className="rounded-xl bg-background/70 px-4 py-3 text-sm text-foreground/55 backdrop-blur-sm">
                  Chargement des tables…
                </p>
              ) : !tables || tables.length === 0 ? (
                <p className="rounded-xl bg-accent-bordeaux/10 px-4 py-3 text-sm text-accent-bordeaux backdrop-blur-sm">
                  Aucune table disponible ici. Choisissez « à emporter », ou
                  demandez à un membre de l&apos;équipe.
                </p>
              ) : (
                <>
                  <select
                    id="table"
                    value={tableId}
                    onChange={(event) => setTableId(event.target.value)}
                    className={`${FIELD_CLASSES} appearance-none`}
                  >
                    <option value="" disabled>
                      Choisir une table
                    </option>
                    {[...tables]
                      .sort((a, b) => a.tableN - b.tableN)
                      .map((table) => (
                        <option key={table._id} value={table._id}>
                          Table {table.tableN}
                          {table.status === "occupied" ? " — occupée" : ""}
                        </option>
                      ))}
                  </select>

                  {/* Le backend fusionne silencieusement avec la commande en
                      cours d'une table occupée. C'est le comportement voulu
                      pour un groupe qui commande en deux fois, mais il doit
                      être annoncé — sinon le client croit avoir sa propre
                      commande et se retrouve sur le ticket d'inconnus. */}
                  {tableId &&
                    tables.find((table) => table._id === tableId)?.status ===
                      "occupied" && (
                      <p className="flex items-start gap-2 rounded-xl bg-accent-mustard/10 px-3 py-2 text-xs text-foreground/75 backdrop-blur-sm">
                        <span
                          aria-hidden="true"
                          className="icon-[mdi--information-outline] mt-0.5 shrink-0 text-sm text-accent-mustard"
                        />
                        Une commande est déjà en cours sur cette table : vos
                        articles y seront ajoutés.
                      </p>
                    )}
                </>
              )}
            </div>
          )}

          {type !== "dine_in" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Téléphone</Label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="05 00 00 00 00"
                className={FIELD_CLASSES}
              />
              <p className="text-xs text-foreground/45">
                Pour vous joindre si besoin.
              </p>
            </div>
          )}

          {type === "delivery" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address">Adresse de livraison</Label>
              <textarea
                id="address"
                rows={2}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Rue, immeuble, étage, repère…"
                className="w-full rounded-xl border border-primary/25 bg-background/85 px-4 py-3 text-foreground outline-none transition-colors placeholder:text-foreground/40 focus:border-primary"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="remark" optional>
              Une précision ?
            </Label>
            <input
              id="remark"
              type="text"
              value={remark}
              onChange={(event) => setRemark(event.target.value)}
              placeholder="Bien cuit, sonner deux fois…"
              className={FIELD_CLASSES}
            />
          </div>
        </section>

        {type === "delivery" && (
          <p className="flex items-start gap-2 rounded-xl bg-background/70 px-4 py-3 text-xs text-foreground/65 backdrop-blur-sm">
            <span
              aria-hidden="true"
              className="icon-[mdi--moped-outline] mt-0.5 shrink-0 text-base text-primary"
            />
            Les frais de livraison dépendent de votre adresse : ils seront
            ajoutés par l&apos;équipe et visibles sur votre suivi.
          </p>
        )}

        {/* ---------- Envoi ---------- */}
        {/* En flux normal, en fin de formulaire. Le message d'erreur est
            remonté ICI, juste au-dessus du bouton : un client qui clique en bas
            de page doit voir immédiatement ce qui bloque. */}
        <section className="flex flex-col gap-3 border-t border-dashed border-primary/25 pt-6">
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-accent-bordeaux/10 px-4 py-3 text-sm font-semibold text-accent-bordeaux backdrop-blur-sm"
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 font-heading text-base font-bold text-on-primary transition-all hover:bg-accent-slate active:scale-[0.99] disabled:opacity-60 disabled:active:scale-100"
          >
            {isSubmitting ? (
              <>
                <span
                  aria-hidden="true"
                  className="icon-[mdi--loading] animate-spin text-xl"
                />
                Envoi en cours…
              </>
            ) : (
              <>
                Envoyer ma commande
                <span className="tabular-nums">
                  · {total.toLocaleString("fr-FR")} DA
                </span>
              </>
            )}
          </button>

          <p className="text-center text-xs text-foreground/45">
            En envoyant, votre commande part directement en cuisine.
          </p>
        </section>
      </div>
    </div>
  );
}
