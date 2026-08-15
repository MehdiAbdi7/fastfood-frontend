"use client";

import type { Order } from "@/types/order";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ElapsedTimer } from "./ElapsedTimer";
import { Button } from "@/components/ui/Button";
import { useUpdateOrderStatusMutation } from "@/features/orders/orderApi";
import { useToast } from "@/features/toast/useToast";
import { getApiErrorMessage } from "@/lib/apiError";
import { getPrimaryAction } from "@/lib/orderTransitions";
import { formatDA } from "@/lib/format";
import { ORDER_TYPE_ICONS, ORDER_TYPE_LABELS } from "@/lib/orderLabels";

interface OrderCardProps {
  order: Order;
  onOpenDetail: () => void;
}

export function OrderCard({ order, onOpenDetail }: OrderCardProps) {
  const [updateStatus, { isLoading }] = useUpdateOrderStatusMutation();
  const toast = useToast();

  const primaryAction = getPrimaryAction(order);
  const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const tableLabel =
    order.type === "dine_in" && order.table && typeof order.table === "object"
      ? `Table ${order.table.tableN}`
      : null;

  async function handlePrimaryAction() {
    if (!primaryAction) return;
    try {
      await updateStatus({ id: order._id, status: primaryAction.status }).unwrap();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Impossible de mettre à jour la commande"));
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface p-4 shadow-food-sm">
      <button onClick={onOpenDetail} className="flex flex-col gap-2 text-left">
        <div className="flex items-start justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-2xl font-bold text-foreground">
              #{order.dailyNumber}
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-foreground/60">
              <span className={`${ORDER_TYPE_ICONS[order.type]} text-sm`} />
              {tableLabel ?? ORDER_TYPE_LABELS[order.type]}
            </span>
          </div>
          <ElapsedTimer since={order.createdAt} />
        </div>

        <p className="truncate text-sm font-semibold text-foreground/80">
          {order.client.fullName}
        </p>

        <p className="text-xs text-foreground/50">
          {itemsCount} article{itemsCount > 1 ? "s" : ""} · {formatDA(order.totalPrice)}
        </p>
      </button>

      <div className="flex items-center gap-2">
        <StatusBadge status={order.status} />
        {primaryAction && (
          <Button
            size="sm"
            icon={primaryAction.icon}
            onClick={handlePrimaryAction}
            isLoading={isLoading}
            className="ml-auto"
          >
            {primaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
