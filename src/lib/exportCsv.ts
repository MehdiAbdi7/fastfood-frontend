import type { Order } from "@/types/order";
import { ORDER_TYPE_LABELS } from "./orderLabels";

// Export volontairement limité à la page actuellement affichée (pas de
// requête "tout récupérer" côté client) — cohérent avec la pagination de
// l'historique. Suffisant pour un contrôle ponctuel ; un vrai export complet
// mériterait un endpoint dédié côté backend plutôt qu'un fetch-all ici.
export function exportOrdersToCsv(orders: Order[], filename: string): void {
  const header = ["N°", "Client", "Type", "Total (DA)", "Terminée le"];
  const rows = orders.map((order) => [
    order.dailyNumber.toString(),
    order.client.fullName,
    ORDER_TYPE_LABELS[order.type],
    order.totalPrice.toString(),
    order.completedAt ? new Date(order.completedAt).toLocaleString("fr-FR") : "",
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");

  // BOM UTF-8 pour qu'Excel affiche correctement les accents à l'ouverture
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
