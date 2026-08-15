import type { Order, OrderStatus } from "@/types/order";
import { OrderCard } from "./OrderCard";
import { EmptyState } from "@/components/ui/EmptyState";

interface OrderColumnProps {
  title: string;
  status: OrderStatus;
  orders: Order[];
  onOpenDetail: (id: string) => void;
}

export function OrderColumn({ title, orders, onOpenDetail }: OrderColumnProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-foreground/60">
          {title}
        </h2>
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-bold text-foreground/50">
          {orders.length}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {orders.length === 0 ? (
          <EmptyState icon="icon-[mdi--tray-outline]" title="Rien ici pour le moment" />
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onOpenDetail={() => onOpenDetail(order._id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
