"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { MenuBrowser } from "@/components/orders/newOrder/MenuBrowser";
import { hasOptions } from "@/components/orders/newOrder/ProductGrid";
import { ProductConfigModal } from "@/components/orders/newOrder/ProductConfigModal";
import { useItemCart, getLineUnitPrice } from "@/components/orders/useItemCart";
import type { NewCartLine } from "@/components/orders/useItemCart";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useCreateOrderMutation } from "@/features/orders/orderApi";
import { useGetTablesQuery } from "@/features/tables/tableApi";
import { useActiveStore } from "@/features/store/useActiveStore";
import { useAuth } from "@/features/auth/useAuth";
import { useToast } from "@/features/toast/useToast";
import { getApiErrorMessage } from "@/lib/apiError";
import { formatDA } from "@/lib/format";
import { formatVariantLabel } from "@/lib/variantLabel";
import { ORDER_TYPE_ICONS, ORDER_TYPE_LABELS } from "@/lib/orderLabels";
import { STORE_LABELS, type Store } from "@/types/store";
import type { MenuItem } from "@/types/menuItem";
import type { CreateOrderPayload, OrderType } from "@/types/order";

const TYPE_OPTIONS: OrderType[] = ["dine_in", "takeaway", "delivery"];

function NewOrderContent() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { activeStore } = useActiveStore();
  const toast = useToast();

  const [type, setType] = useState<OrderType>("dine_in");
  const [manualStore, setManualStore] = useState<Store | "">("");
  const [tableId, setTableId] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [remark, setRemark] = useState("");
  const [error, setError] = useState<string | null>(null);

  const {
    cart,
    addLine,
    removeFromCart,
    setQuantity,
    toPayload,
    itemsCount,
    total,
  } = useItemCart();

  const [configuringItem, setConfiguringItem] = useState<MenuItem | null>(null);

  const [createOrder, { isLoading: isSubmitting }] = useCreateOrderMutation();

  const impliedStore = activeStore ?? user?.store;
  const needsStoreSelector = isAdmin && !impliedStore;
  const resolvedStore = impliedStore ?? (manualStore || undefined);

  const { data: tables } = useGetTablesQuery(
    { store: resolvedStore },
    {
      skip: type !== "dine_in" || !resolvedStore,
    },
  );

  const quantityByItem = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const line of cart) {
      counts[line.menuItemId] = (counts[line.menuItemId] ?? 0) + line.quantity;
    }

    return counts;
  }, [cart]);

  // Ajout direct si le produit n'a rien à configurer, sinon ouverture de la
  // modale d'options (variante, extras, retraits).
  function handleSelectProduct(item: MenuItem) {
    if (hasOptions(item)) {
      setConfiguringItem(item);
      return;
    }

    addLine({
      menuItemId: item._id,
      name: item.name,
      imageUrl: item.imageUrl,
      variant: item.variants[0],
      extras: [],
      excludedIngredients: [],
      quantity: 1,
    });
  }

  // Ajout d'un produit après configuration dans la modale.
  // On récupère ici l'image depuis le MenuItem original afin que
  // les produits configurés aient eux aussi leur image dans le ticket.
  function handleConfirmConfiguredLine(line: NewCartLine) {
    addLine({
      ...line,
      imageUrl: configuringItem?.imageUrl ?? line.imageUrl,
    });

    setConfiguringItem(null);
  }

  async function handleSubmit() {
    setError(null);

    if (!fullName.trim()) {
      return setError("Le nom du client est requis");
    }

    if (cart.length === 0) {
      return setError("Ajoute au moins un article au panier");
    }

    if (type === "dine_in" && !tableId) {
      return setError("Choisis une table");
    }

    if (type !== "dine_in" && !resolvedStore) {
      return setError("Choisis un magasin");
    }

    if (type !== "dine_in" && phone.trim().length < 10) {
      return setError("Le téléphone est requis (10 chiffres minimum)");
    }

    if (type === "delivery" && !address.trim()) {
      return setError("L'adresse est requise pour une livraison");
    }

    const items = toPayload();
    let payload: CreateOrderPayload;

    if (type === "dine_in") {
      payload = {
        type: "dine_in",
        table: tableId,
        client: { fullName },
        remark: remark || undefined,
        items,
      };
    } else if (type === "takeaway") {
      payload = {
        type: "takeaway",
        store: resolvedStore as Store,
        client: { fullName, phone },
        remark: remark || undefined,
        items,
      };
    } else {
      payload = {
        type: "delivery",
        store: resolvedStore as Store,
        client: {
          fullName,
          phone,
          address,
        },
        remark: remark || undefined,
        items,
      };
    }

    try {
      const created = await createOrder(payload).unwrap();

      toast.success(`Commande #${created.dailyNumber} créée`);

      router.push("/commandes");
    } catch (err) {
      setError(getApiErrorMessage(err, "Impossible de créer la commande"));
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-6">
      {/* ---------- Colonne menu ---------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-5 flex items-center gap-3">
          <Link
            href="/commandes"
            aria-label="Retour aux commandes"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface text-foreground/60 transition-colors hover:border-primary hover:text-foreground"
          >
            <span className="icon-[mdi--arrow-left] text-xl" />
          </Link>

          <div>
            <h1 className="font-heading text-xl font-bold leading-tight text-foreground">
              Prise de commande
            </h1>

            <p className="text-sm text-foreground/55">
              Pour un client au comptoir ou au téléphone
            </p>
          </div>
        </div>

        <MenuBrowser
          quantityByItem={quantityByItem}
          onSelect={handleSelectProduct}
        />
      </div>

      {/* ---------- Ticket ---------- */}
      <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-88">
        <div className="ticket-notch surface-card relative flex flex-col gap-4 p-5 pb-7">
          <div className="flex items-baseline justify-between">
            <h2 className="font-heading text-base font-bold text-foreground">
              Ticket
            </h2>

            <span className="tabular-nums text-xs font-semibold text-foreground/50">
              {itemsCount} article
              {itemsCount > 1 ? "s" : ""}
            </span>
          </div>

          {/* Type de commande */}
          <div className="grid grid-cols-3 gap-1.5">
            {TYPE_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 text-[11px] font-bold transition-colors ${
                  type === t
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border-subtle text-foreground/55 hover:text-foreground"
                }`}
              >
                <span className={`${ORDER_TYPE_ICONS[t]} text-lg`} />

                {ORDER_TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {needsStoreSelector && (
              <Select
                id="store"
                label="Magasin"
                value={manualStore}
                onChange={(e) => {
                  setManualStore(e.target.value as Store);
                  setTableId("");
                }}
                placeholder="Choisir un magasin"
                options={Object.entries(STORE_LABELS).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
            )}

            {type === "dine_in" && (
              <Select
                id="table"
                label="Table"
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                placeholder={
                  resolvedStore
                    ? "Choisir une table"
                    : "Choisis d'abord un magasin"
                }
                disabled={!resolvedStore}
                options={(tables ?? [])
                  .slice()
                  .sort((a, b) => a.tableN - b.tableN)
                  .map((t) => ({
                    value: t._id,
                    label: `Table ${t.tableN} — ${
                      t.status === "occupied" ? "occupée" : "libre"
                    }`,
                  }))}
              />
            )}

            <Input
              id="fullName"
              label="Nom du client"
              placeholder="Ex : Yacine"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            {type !== "dine_in" && (
              <Input
                id="phone"
                label="Téléphone"
                placeholder="05 00 00 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            )}

            {type === "delivery" && (
              <Input
                id="address"
                label="Adresse"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            )}

            <Input
              id="remark"
              label="Remarque"
              placeholder="Sans oignons, bien cuit..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>

          {/* Lignes du ticket */}
          <div className="flex flex-col gap-2.5 border-t border-dashed border-border-subtle pt-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 py-6 text-center">
                <span className="icon-[mdi--receipt-text-plus-outline] text-2xl text-foreground/25" />

                <p className="text-sm font-semibold text-foreground/60">
                  Ticket vide
                </p>

                <p className="text-xs text-foreground/40">
                  Touche un produit pour l&apos;ajouter
                </p>
              </div>
            ) : (
              cart.map((line) => {
                const variantLabel = formatVariantLabel(
                  line.variant.combination,
                );

                return (
                  <div key={line.key} className="flex items-center gap-2.5">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                      {line.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={line.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="icon-[mdi--food] text-base text-foreground/30" />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="truncate text-xs font-bold text-foreground">
                        {line.name}
                      </p>

                      <p className="tabular-nums text-xs text-foreground/50">
                        {variantLabel !== "Standard"
                          ? `${variantLabel} · `
                          : ""}
                        {formatDA(getLineUnitPrice(line))}
                      </p>

                      {/* La cuisine doit voir les options sur le ticket,
                          pas seulement leur effet sur le prix. */}
                      {line.extras.length > 0 && (
                        <p className="truncate text-xs text-accent-green">
                          + {line.extras.map((extra) => extra.name).join(", ")}
                        </p>
                      )}

                      {line.excludedIngredients.length > 0 && (
                        <p className="truncate text-xs text-accent-bordeaux">
                          sans {line.excludedIngredients.join(", ")}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1 rounded-lg bg-surface-2 p-0.5">
                      <button
                        onClick={() => setQuantity(line.key, line.quantity - 1)}
                        aria-label={`Retirer un ${line.name}`}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-foreground/60 hover:bg-surface hover:text-accent-bordeaux"
                      >
                        <span className="icon-[mdi--minus] text-sm" />
                      </button>

                      <span className="tabular-nums w-5 text-center text-xs font-bold text-foreground">
                        {line.quantity}
                      </span>

                      <button
                        onClick={() => setQuantity(line.key, line.quantity + 1)}
                        aria-label={`Ajouter un ${line.name}`}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-foreground/60 hover:bg-surface hover:text-accent-green"
                      >
                        <span className="icon-[mdi--plus] text-sm" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(line.key)}
                      aria-label={`Supprimer ${line.name} du ticket`}
                      className="shrink-0 text-foreground/25 hover:text-accent-bordeaux"
                    >
                      <span className="icon-[mdi--close] text-base" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Total */}
          <div className="flex items-baseline justify-between border-t border-dashed border-border-subtle pt-4">
            <span className="font-heading text-sm font-bold uppercase tracking-wide text-foreground/70">
              Total
            </span>

            <span className="tabular-nums font-heading text-2xl font-bold text-accent-green">
              {formatDA(total)}
            </span>
          </div>

          {type === "delivery" && (
            <p className="-mt-2 text-xs text-foreground/45">
              Les frais de livraison seront ajoutés depuis la fiche commande.
            </p>
          )}

          {error && (
            <p className="rounded-lg bg-accent-bordeaux/10 px-3 py-2 text-sm text-accent-bordeaux">
              {error}
            </p>
          )}

          <Button
            size="lg"
            icon="icon-[mdi--check-circle-outline]"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={cart.length === 0}
            className="w-full"
          >
            Envoyer en cuisine
          </Button>
        </div>
      </aside>

      <ProductConfigModal
        item={configuringItem}
        onClose={() => setConfiguringItem(null)}
        onConfirm={handleConfirmConfiguredLine}
      />
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <DashboardShell>
      <NewOrderContent />
    </DashboardShell>
  );
}
