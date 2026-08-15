"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { TableCard } from "@/components/tables/TableCard";
import { TableFormModal } from "@/components/tables/TableFormModal";
import { Button } from "@/components/ui/Button";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useGetTablesQuery } from "@/features/tables/tableApi";
import { useActiveStore } from "@/features/store/useActiveStore";
import { useAuth } from "@/features/auth/useAuth";
import { STORE_LABELS, type Store } from "@/types/store";
import type { RestaurantTable } from "@/types/table";

function TablesContent() {
  const { isAdmin } = useAuth();
  const { activeStore } = useActiveStore();
  const { data: tables, isLoading, isError } = useGetTablesQuery({
    store: activeStore,
  });

  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  if (isLoading) return <SkeletonGrid count={8} />;

  if (isError) {
    return (
      <EmptyState
        icon="icon-[mdi--cloud-off-outline]"
        title="Impossible de charger les tables"
      />
    );
  }

  if (!tables || tables.length === 0) {
    return (
      <EmptyState
        icon="icon-[mdi--table-furniture]"
        title="Aucune table configurée"
        description={isAdmin ? "Ajoute la première table ci-dessous." : undefined}
        action={
          isAdmin && (
            <Button icon="icon-[mdi--plus]" onClick={() => setIsCreating(true)}>
              Ajouter une table
            </Button>
          )
        }
      />
    );
  }

  // Regroupement par magasin : utile même en vue filtrée pour garder un titre
  // de section cohérent, indispensable en vue "Tous".
  const groups = tables.reduce<Record<Store, RestaurantTable[]>>(
    (acc, table) => {
      (acc[table.store] ??= []).push(table);
      return acc;
    },
    {} as Record<Store, RestaurantTable[]>,
  );

  return (
    <div className="flex flex-col gap-8">
      {isAdmin && (
        <div className="flex justify-end">
          <Button icon="icon-[mdi--plus]" onClick={() => setIsCreating(true)}>
            Ajouter une table
          </Button>
        </div>
      )}

      {Object.entries(groups).map(([store, storeTables]) => (
        <section key={store} className="flex flex-col gap-3">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-foreground/50">
            {STORE_LABELS[store as Store]} · {storeTables.length} table
            {storeTables.length > 1 ? "s" : ""}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {storeTables
              .sort((a, b) => a.tableN - b.tableN)
              .map((table) => (
                <TableCard
                  key={table._id}
                  table={table}
                  isAdmin={isAdmin}
                  onEdit={() => setEditingTable(table)}
                />
              ))}
          </div>
        </section>
      ))}

      <TableFormModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        table={null}
        defaultStore={activeStore}
      />
      <TableFormModal
        isOpen={editingTable !== null}
        onClose={() => setEditingTable(null)}
        table={editingTable}
      />
    </div>
  );
}

export default function TablesPage() {
  return (
    <DashboardShell>
      <TablesContent />
    </DashboardShell>
  );
}
