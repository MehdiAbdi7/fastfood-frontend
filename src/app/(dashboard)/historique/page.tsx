"use client";

import { useState } from "react";
import { HistoryToolbar } from "@/components/history/HistoryToolbar";
import { HistoryCalendar } from "@/components/history/HistoryCalendar";
import { HistoryOrderList } from "@/components/history/HistoryOrderList";
import { OrderDetailModal } from "@/components/orders/OrderDetailModal";
import {
  useGetHistoryQuery,
  useGetHistoryYearsQuery,
  useGetHistoryMonthsQuery,
  useGetHistoryDaysQuery,
} from "@/features/history/historyApi";
import { useHistorySelection } from "@/features/history/useHistorySelection";
import { useDebouncedValue } from "@/features/history/useDebouncedValue";
import { useActiveStore } from "@/features/store/useActiveStore";
import { exportHistoryToCsv } from "@/lib/exportCsv";
import { formatSelectionLabel, formatServiceDayKey } from "@/lib/calendar";
import { PageHeader } from "@/components/dashboard/PageHeader";

// Fixé côté front ET plafonné côté backend (max 100). En dur plutôt qu'en
// réglage : personne n'a jamais demandé à changer ce nombre, et une option de
// plus, c'est une décision de plus à prendre pour l'utilisateur.
const PAGE_SIZE = 20;

/**
 * Historique des ventes.
 *
 * Le calendrier n'est PAS un chemin de navigation mais un FILTRE : il reste
 * affiché en permanence, et cliquer une case resserre la liste du dessous au
 * lieu de changer d'écran. C'est ce qui permet de comparer deux jours en deux
 * clics, là où l'ancien drill-down imposait de remonter puis redescendre.
 *
 * Tout le travail lourd — plage de dates, recherche, tri, découpage en pages,
 * totaux — est fait par MongoDB (voir order.controller.ts::getHistory). Le
 * navigateur ne reçoit jamais plus de 20 lignes projetées, quelle que soit la
 * taille de l'historique.
 */
export default function HistoriquePage() {
  const { activeStore, isAllStores } = useActiveStore();
  const {
    selection,
    apiType,
    sortBy,
    sortOrder,
    setType,
    setYear,
    toggleMonth,
    toggleDay,
    setSearch,
    setSort,
    setPage,
    clearSelection,
  } = useHistorySelection();

  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  // Ne part au serveur qu'une fois la frappe stabilisée — le champ, lui, reste
  // piloté par la valeur brute (voir HistoryToolbar).
  const debouncedSearch = useDebouncedValue(selection.search);

  // `apiType` vaut undefined en vue « Tous » : la clé est alors retirée de
  // l'URL par pruneParams, et le backend la traduit en $in sur tous les types.
  const baseParams = { type: apiType, store: activeStore };

  const yearsQuery = useGetHistoryYearsQuery(baseParams);

  /**
   * Année effective : celle choisie explicitement, sinon la plus récente.
   *
   * DÉRIVÉE, jamais posée par un effet. Un `useEffect` qui appellerait
   * `setYear` au chargement provoquerait un rendu de plus, un appel réseau
   * jeté, et un clignotement à chaque changement de type de commande.
   * L'agrégation trie déjà les années du plus récent au plus ancien.
   */
  const year = selection.year ?? yearsQuery.data?.[0]?.year ?? null;

  const monthsQuery = useGetHistoryMonthsQuery(
    { ...baseParams, year: year ?? 0 },
    { skip: year === null },
  );

  // Les jours ne sont chargés que si un mois est ouvert : sinon c'est un appel
  // pour une grille que personne ne regarde.
  const daysQuery = useGetHistoryDaysQuery(
    { ...baseParams, year: year ?? 0, month: selection.month ?? 0 },
    { skip: year === null || selection.month === null },
  );

  const historyQuery = useGetHistoryQuery(
    {
      ...baseParams,
      year: year ?? 0,
      // `undefined` et non `null` : historyApi retire les clés indéfinies de
      // l'URL, ce qui laisse le backend déduire le bon niveau de précision.
      month: selection.month ?? undefined,
      day: selection.day ?? undefined,
      search: debouncedSearch.trim() || undefined,
      sortBy,
      sortOrder,
      page: selection.page,
      limit: PAGE_SIZE,
    },
    { skip: year === null },
  );

  const selectionLabel = formatSelectionLabel(
    year,
    selection.month,
    selection.day,
  );

  function handleExport() {
    const orders = historyQuery.data?.orders;
    if (!orders?.length || year === null) return;

    const period = formatServiceDayKey(year, selection.month, selection.day);
    // selection.type et non apiType : « all » doit apparaître dans le nom du
    // fichier, sinon deux exports de périmètres différents portent le même nom.
    exportHistoryToCsv(
      orders,
      `niwa-${selection.type}-${period}-p${selection.page}.csv`,
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Analyse"
        title="Historique"
        description="Retrouve, filtre et exporte les ventes passées de tes établissements."
      />
      <HistoryToolbar
        type={selection.type}
        search={selection.search}
        sort={selection.sort}
        onTypeChange={setType}
        onSearchChange={setSearch}
        onSortChange={setSort}
      />

      <HistoryCalendar
        years={yearsQuery.data ?? []}
        months={monthsQuery.data ?? []}
        days={daysQuery.data ?? []}
        year={year}
        month={selection.month}
        day={selection.day}
        isLoadingYears={yearsQuery.isLoading}
        isLoadingMonths={monthsQuery.isLoading}
        isLoadingDays={daysQuery.isLoading}
        onSelectYear={setYear}
        onToggleMonth={toggleMonth}
        onToggleDay={toggleDay}
      />

      {/* Rien à lister tant qu'aucune année n'existe : le calendrier affiche
          déjà son propre état vide, en rajouter un second serait redondant. */}
      {year !== null && (
        <HistoryOrderList
          orders={historyQuery.data?.orders ?? []}
          summary={historyQuery.data?.summary}
          selectionLabel={selectionLabel}
          currentPage={historyQuery.data?.currentPage ?? selection.page}
          totalPages={historyQuery.data?.totalPages ?? 1}
          isLoading={historyQuery.isLoading}
          isFetching={historyQuery.isFetching}
          isError={historyQuery.isError}
          hasSearch={debouncedSearch.trim().length > 0}
          isSingleDay={selection.day !== null}
          // La colonne magasin n'a de sens que dans la vue « tous les
          // magasins » d'un admin : ailleurs, elle répéterait la même valeur
          // sur chaque ligne.
          showStore={isAllStores}
          // La colonne type ne s'affiche qu'en vue « Tous » : ailleurs elle
          // répéterait la même valeur sur chaque ligne.
          showType={selection.type === "all"}
          onPageChange={setPage}
          onOpenOrder={setOpenOrderId}
          onExport={handleExport}
          onClearFilters={clearSelection}
        />
      )}

      <OrderDetailModal
        orderId={openOrderId}
        onClose={() => setOpenOrderId(null)}
      />
    </div>
  );
}
