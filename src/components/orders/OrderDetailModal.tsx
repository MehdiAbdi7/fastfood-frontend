"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useSetDeliveryFeeMutation,
  useDeleteOrderMutation,
} from "@/features/orders/orderApi";
import { useAuth } from "@/features/auth/useAuth";
import { useToast } from "@/features/toast/useToast";
import { getApiErrorMessage } from "@/lib/apiError";
import { getPrimaryAction, canCancel } from "@/lib/orderTransitions";
import { formatDA, formatDateTime } from "@/lib/format";
import { formatVariantLabel } from "@/lib/variantLabel";
import { ORDER_TYPE_LABELS } from "@/lib/orderLabels";
import { printOrderTicket } from "@/lib/printTicket";

interface OrderDetailModalProps {
  orderId: string | null;
  onClose: () => void;
}

export function OrderDetailModal({ orderId, onClose }: OrderDetailModalProps) {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const toast = useToast();

  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useGetOrderByIdQuery(orderId ?? "", { skip: !orderId });
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();
  const [setDeliveryFee, { isLoading: isSavingFee }] = useSetDeliveryFeeMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();

  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [feeInput, setFeeInput] = useState("");
  const [isEditingFee, setIsEditingFee] = useState(false);

  const isOpen = orderId !== null;

  function handleClose() {
    setIsEditingFee(false);
    onClose();
  }

  async function handlePrimaryAction() {
    if (!order) return;
    const action = getPrimaryAction(order);
    if (!action) return;
    try {
      await updateStatus({ id: order._id, status: action.status }).unwrap();
      toast.success(`Commande #${order.dailyNumber} — ${action.label.toLowerCase()}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Impossible de mettre à jour la commande"));
    }
  }

  async function handleCancel() {
    if (!order) return;
    try {
      await updateStatus({ id: order._id, status: "cancelled" }).unwrap();
      toast.success("Commande annulée");
      setIsCancelConfirmOpen(false);
      handleClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Impossible d'annuler la commande"));
    }
  }

  async function handleDelete() {
    if (!order) return;
    try {
      await deleteOrder(order._id).unwrap();
      toast.success("Commande supprimée");
      setIsDeleteConfirmOpen(false);
      handleClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Impossible de supprimer la commande"));
    }
  }

  async function handleSaveFee(e: FormEvent) {
    e.preventDefault();
    if (!order) return;
    const parsed = Number(feeInput);
    if (Number.isNaN(parsed) || parsed < 0) return;

    try {
      await setDeliveryFee({ id: order._id, deliveryFee: parsed }).unwrap();
      toast.success("Prix de livraison mis à jour");
      setIsEditingFee(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Impossible de mettre à jour le prix"));
    }
  }

  const primaryAction = order ? getPrimaryAction(order) : null;
  const tableLabel =
    order?.type === "dine_in" && order.table && typeof order.table === "object"
      ? `Table ${order.table.tableN}`
      : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={order ? `Commande #${order.dailyNumber}` : "Commande"}
      size="lg"
      footer={
        order && (
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex gap-2">
              {canCancel(order) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCancelConfirmOpen(true)}
                >
                  Annuler la commande
                </Button>
              )}
              {/* Un admin peut supprimer à tout statut, y compris "completed" :
                  c'est le seul moyen de retirer une commande erronée de
                  l'historique, celui-ci n'étant qu'une agrégation sur orders. */}
              {isAdmin && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                >
                  Supprimer
                </Button>
              )}
            </div>
            {primaryAction && (
              <Button
                icon={primaryAction.icon}
                onClick={handlePrimaryAction}
                isLoading={isUpdatingStatus}
              >
                {primaryAction.label}
              </Button>
            )}
          </div>
        )
      }
    >
      {/* Ces trois états sont mutuellement exclusifs et couvrent tout le cycle
          de vie de la requête — avant ce correctif, une erreur réseau ou une
          permission refusée laissait la modale vide (en-tête affiché, corps
          totalement blanc), sans aucun message. */}
      {isLoading && (
        <div className="flex justify-center py-10">
          <span className="icon-[mdi--loading] animate-spin text-3xl text-primary" />
        </div>
      )}

      {!isLoading && isError && (
        <EmptyState
          icon="icon-[mdi--cloud-off-outline]"
          title="Impossible de charger cette commande"
          description="Vérifie ta connexion, ou que la commande n'a pas été supprimée entretemps."
          action={
            <Button variant="secondary" icon="icon-[mdi--refresh]" onClick={() => refetch()}>
              Réessayer
            </Button>
          }
        />
      )}

      {!isLoading && !isError && order && (
        <div className="flex flex-col gap-5">
          {/* En-tête */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-foreground">{order.client.fullName}</p>
              <p className="text-sm text-foreground/60">
                {tableLabel ?? ORDER_TYPE_LABELS[order.type]}
                {order.client.phone && ` · ${order.client.phone}`}
              </p>
              {order.client.address && (
                <p className="text-sm text-foreground/60">{order.client.address}</p>
              )}
              <p className="text-xs text-foreground/40">{formatDateTime(order.createdAt)}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={order.status} />
              <button
                onClick={() => printOrderTicket(order)}
                className="flex items-center gap-1.5 text-xs font-semibold text-foreground/60 hover:text-primary"
              >
                <span className="icon-[mdi--printer-outline] text-base" />
                Imprimer le ticket
              </button>
            </div>
          </div>

          {order.remark && (
            <div className="rounded-xl bg-accent-mustard/10 px-3 py-2 text-sm text-foreground/80">
              <span className="font-semibold">Remarque : </span>
              {order.remark}
            </div>
          )}

          {/* Items */}
          <div className="flex flex-col gap-2">
            {order.items.map((item, i) => {
              // Défensif : voir variantLabel.ts — d'anciennes commandes
              // peuvent avoir ces champs à null/undefined malgré le default
              // du schéma, qui ne s'applique qu'à la création.
              const selectedExtras = item.selectedExtras ?? [];
              const excludedIngredients = item.excludedIngredients ?? [];
              const extrasTotal = selectedExtras.reduce((s, e) => s + e.price, 0);
              const variantLabel = formatVariantLabel(item.variantSelected);
              return (
                <div key={i} className="rounded-xl border border-border-subtle p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      {item.quantity}x {item.name}
                      {variantLabel !== "Standard" && (
                        <span className="text-foreground/50"> ({variantLabel})</span>
                      )}
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatDA((item.unitPrice + extrasTotal) * item.quantity)}
                    </span>
                  </div>
                  {selectedExtras.length > 0 && (
                    <p className="mt-1 text-xs text-foreground/60">
                      + {selectedExtras.map((e) => e.name).join(", ")}
                    </p>
                  )}
                  {excludedIngredients.length > 0 && (
                    <p className="mt-1 text-xs text-accent-bordeaux">
                      Sans : {excludedIngredients.join(", ")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Livraison */}
          {order.type === "delivery" && (
            <div className="flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2">
              <span className="text-sm font-semibold text-foreground/80">
                Frais de livraison
              </span>
              {isEditingFee ? (
                <form onSubmit={handleSaveFee} className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    autoFocus
                    value={feeInput}
                    onChange={(e) => setFeeInput(e.target.value)}
                    className="h-9 w-24"
                  />
                  <Button type="submit" size="sm" isLoading={isSavingFee}>
                    OK
                  </Button>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setFeeInput(order.deliveryFee?.toString() ?? "");
                    setIsEditingFee(true);
                  }}
                  className="text-sm font-bold text-primary hover:underline"
                >
                  {order.deliveryFee !== undefined ? formatDA(order.deliveryFee) : "À définir"}
                </button>
              )}
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between border-t border-border-subtle pt-3">
            <span className="font-heading text-base font-bold text-foreground">Total</span>
            <span className="font-heading text-xl font-bold text-accent-green">
              {formatDA(order.totalPrice)}
            </span>
          </div>

          {/* Ajout d'articles */}
          {!["completed", "cancelled"].includes(order.status) && (
            <div className="border-t border-border-subtle pt-4">
              {/* Page dédiée plutôt qu'un panneau dans la modale : le choix
                  d'articles a besoin des images, des catégories et des extras,
                  impossibles à présenter correctement dans cet espace. */}
              <Button
                variant="secondary"
                icon="icon-[mdi--plus]"
                className="w-full"
                onClick={() => {
                  handleClose();
                  router.push(`/commandes/${order._id}/ajouter`);
                }}
              >
                Ajouter des articles
              </Button>
            </div>
          )}
        </div>
      )}

      {order && (
        <>
          <ConfirmDialog
            isOpen={isCancelConfirmOpen}
            onClose={() => setIsCancelConfirmOpen(false)}
            onConfirm={handleCancel}
            title={`Annuler la commande #${order.dailyNumber} ?`}
            description="Le client ne sera plus servi. Cette action est irréversible."
            confirmLabel="Annuler la commande"
            variant="danger"
            isLoading={isUpdatingStatus}
          />
          <ConfirmDialog
            isOpen={isDeleteConfirmOpen}
            onClose={() => setIsDeleteConfirmOpen(false)}
            onConfirm={handleDelete}
            title={`Supprimer la commande #${order.dailyNumber} ?`}
            description={
              order.status === "completed"
                ? `Cette vente de ${formatDA(order.totalPrice)} sera retirée du chiffre d'affaires et de l'historique, définitivement.`
                : "Suppression définitive, à réserver aux erreurs de saisie."
            }
            confirmLabel="Supprimer"
            variant="danger"
            isLoading={isDeleting}
          />
        </>
      )}
    </Modal>
  );
}
