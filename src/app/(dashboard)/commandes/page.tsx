"use client";

import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { OrderColumn } from "@/components/orders/OrderColumn";
import { OrderFilters } from "@/components/orders/OrderFilters";
import { OrderDetailModal } from "@/components/orders/OrderDetailModal";
import { useNewOrderAlert } from "@/components/orders/useNewOrderAlert";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useGetOrdersQuery } from "@/features/orders/orderApi";
import { useActiveStore } from "@/features/store/useActiveStore";
import type { Order, OrderType } from "@/types/order";

// Filet de sécurité si le socket décroche silencieusement — l'invalidation de
// tags reste le mécanisme principal, ce polling n'est qu'un rattrapage discret.
const POLL_INTERVAL_MS = 20_000;

function CommandesContent() {
  const { activeStore } = useActiveStore();
  const [typeFilter, setTypeFilter] = useState<OrderType | "all">("all");
  const [search, setSearch] = useState("");
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const { data, isLoading, isError } = useGetOrdersQuery(
    {
      store: activeStore,
      type: typeFilter === "all" ? undefined : typeFilter,
      scope: "active",
      limit: 200,
    },
    { pollingInterval: POLL_INTERVAL_MS },
  );

  const orders = data?.orders ?? [];

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;
    const query = search.toLowerCase();
    return orders.filter(
      (order) =>
        order.dailyNumber.toString().includes(query) ||
        order.client.fullName.toLowerCase().includes(query),
    );
  }, [orders, search]);

  const byStatus = useMemo(
    () => ({
      pending: filteredOrders.filter((o) => o.status === "pending"),
      ready: filteredOrders.filter((o) => o.status === "ready"),
      out_for_delivery: filteredOrders.filter((o) => o.status === "out_for_delivery"),
    }),
    [filteredOrders],
  );

  // Le bip se base sur le flux non filtré : une recherche active ne doit pas
  // couper l'alerte sonore d'une vraie nouvelle commande.
  useNewOrderAlert(orders.filter((o: Order) => o.status === "pending"));

  if (isLoading) return <SkeletonGrid count={6} />;

  if (isError) {
    return (
      <EmptyState
        icon="icon-[mdi--cloud-off-outline]"
        title="Impossible de charger les commandes"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <OrderFilters
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        search={search}
        onSearchChange={setSearch}
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-4">
        <OrderColumn
          title="Nouvelles"
          status="pending"
          orders={byStatus.pending}
          onOpenDetail={setOpenOrderId}
        />
        <OrderColumn
          title="Prêtes"
          status="ready"
          orders={byStatus.ready}
          onOpenDetail={setOpenOrderId}
        />
        <OrderColumn
          title="En livraison"
          status="out_for_delivery"
          orders={byStatus.out_for_delivery}
          onOpenDetail={setOpenOrderId}
        />
      </div>

      <OrderDetailModal orderId={openOrderId} onClose={() => setOpenOrderId(null)} />
    </div>
  );
}

export default function CommandesPage() {
  return (
    <DashboardShell>
      <CommandesContent />
    </DashboardShell>
  );
}
