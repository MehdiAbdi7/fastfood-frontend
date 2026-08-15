"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { HistoryBreadcrumb, MONTH_NAMES } from "@/components/history/HistoryBreadcrumb";
import { HistoryDrillList } from "@/components/history/HistoryDrillList";
import { OrderDetailModal } from "@/components/orders/OrderDetailModal";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useGetHistoryYearsQuery,
  useGetHistoryMonthsQuery,
  useGetHistoryDaysQuery,
  useGetHistoryOrdersQuery,
} from "@/features/history/historyApi";
import { useActiveStore } from "@/features/store/useActiveStore";
import { exportOrdersToCsv } from "@/lib/exportCsv";
import { formatDA, formatTime } from "@/lib/format";
import { ORDER_TYPE_LABELS } from "@/lib/orderLabels";
import type { OrderType } from "@/types/order";

const TYPE_TABS: OrderType[] = ["dine_in", "takeaway", "delivery"];

function HistoriqueContent() {
  const { activeStore } = useActiveStore();
  const [type, setType] = useState<OrderType>("dine_in");
  const [year, setYear] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const baseParams = { type, store: activeStore };

  function resetTo(level: "root" | "year" | "month") {
    if (level === "root") {
      setYear(null);
      setMonth(null);
      setDay(null);
    } else if (level === "year") {
      setMonth(null);
      setDay(null);
    } else {
      setDay(null);
    }
  }

  function changeType(nextType: OrderType) {
    setType(nextType);
    resetTo("root");
  }

  const yearsQuery = useGetHistoryYearsQuery(baseParams, { skip: year !== null });
  const monthsQuery = useGetHistoryMonthsQuery(
    { ...baseParams, year: year ?? 0 },
    { skip: year === null || month !== null },
  );
  const daysQuery = useGetHistoryDaysQuery(
    { ...baseParams, year: year ?? 0, month: month ?? 0 },
    { skip: year === null || month === null || day !== null },
  );
  const ordersQuery = useGetHistoryOrdersQuery(
    { ...baseParams, year: year ?? 0, month: month ?? 0, day: day ?? 0, page, limit: 20 },
    { skip: year === null || month === null || day === null },
  );

  const isLoading =
    (year === null && yearsQuery.isLoading) ||
    (year !== null && month === null && monthsQuery.isLoading) ||
    (month !== null && day === null && daysQuery.isLoading) ||
    (day !== null && ordersQuery.isLoading);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <HistoryBreadcrumb year={year} month={month} day={day} onNavigate={resetTo} />

        <div className="flex gap-1.5">
          {TYPE_TABS.map((t) => (
            <button
              key={t}
              onClick={() => changeType(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                type === t
                  ? "bg-primary text-on-primary"
                  : "bg-surface-2 text-foreground/60 hover:text-foreground"
              }`}
            >
              {ORDER_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <SkeletonGrid count={5} />}

      {!isLoading && year === null && (
        <HistoryDrillList
          rows={(yearsQuery.data ?? []).map((y) => ({
            key: y.year,
            label: y.year.toString(),
            count: y.count,
            totalSales: y.totalSales,
          }))}
          onSelect={(key) => setYear(Number(key))}
          emptyLabel={`Aucune commande "${ORDER_TYPE_LABELS[type]}" terminée pour l'instant`}
        />
      )}

      {!isLoading && year !== null && month === null && (
        <HistoryDrillList
          rows={(monthsQuery.data ?? []).map((m) => ({
            key: m.month,
            label: MONTH_NAMES[m.month - 1],
            count: m.count,
            totalSales: m.totalSales,
          }))}
          onSelect={(key) => setMonth(Number(key))}
          emptyLabel="Aucune commande cette année"
        />
      )}

      {!isLoading && month !== null && day === null && (
        <HistoryDrillList
          rows={(daysQuery.data ?? []).map((d) => ({
            key: d.day,
            label: `${d.day} ${MONTH_NAMES[month - 1]}`,
            count: d.count,
            totalSales: d.totalSales,
          }))}
          onSelect={(key) => setDay(Number(key))}
          emptyLabel="Aucune commande ce mois-ci"
        />
      )}

      {!isLoading && day !== null && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground/60">
              {ordersQuery.data?.totalCount ?? 0} commande(s)
            </p>
            {ordersQuery.data && ordersQuery.data.orders.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                icon="icon-[mdi--download-outline]"
                onClick={() =>
                  exportOrdersToCsv(
                    ordersQuery.data!.orders,
                    `niwa-${type}-${year}-${month}-${day}.csv`,
                  )
                }
              >
                Exporter cette page (CSV)
              </Button>
            )}
          </div>

          {!ordersQuery.data || ordersQuery.data.orders.length === 0 ? (
            <EmptyState icon="icon-[mdi--receipt-text-outline]" title="Aucune commande ce jour-là" />
          ) : (
            <div className="flex flex-col gap-2">
              {ordersQuery.data.orders.map((order) => (
                <button
                  key={order._id}
                  onClick={() => setOpenOrderId(order._id)}
                  className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface px-4 py-3 text-left hover:border-primary"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-heading text-lg font-bold text-foreground">
                      #{order.dailyNumber}
                    </span>
                    <span className="text-sm text-foreground/70">{order.client.fullName}</span>
                    {order.completedAt && (
                      <span className="text-xs text-foreground/40">
                        {formatTime(order.completedAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="font-bold text-accent-green">
                      {formatDA(order.totalPrice)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {ordersQuery.data && ordersQuery.data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Précédent
              </Button>
              <span className="text-sm text-foreground/60">
                {ordersQuery.data.currentPage} / {ordersQuery.data.totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= ordersQuery.data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant
              </Button>
            </div>
          )}
        </div>
      )}

      <OrderDetailModal orderId={openOrderId} onClose={() => setOpenOrderId(null)} />
    </div>
  );
}

export default function HistoriquePage() {
  return (
    <DashboardShell>
      <HistoriqueContent />
    </DashboardShell>
  );
}
