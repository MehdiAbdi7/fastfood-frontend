import type { Order } from "@/types/order";
import { formatDA, formatDateTime } from "./format";
import { ORDER_TYPE_LABELS } from "./orderLabels";
import { formatVariantLabel } from "./variantLabel";

// Ticket papier volontairement minimal (police monospace, largeur ticket de
// caisse ~72mm) : ouvre une fenêtre dédiée plutôt que d'ajouter une dépendance
// react-to-print pour un besoin aussi simple. À remplacer si un jour le ticket
// doit intégrer un logo ou un QR de suivi.
export function printOrderTicket(order: Order): void {
  const printWindow = window.open("", "_blank", "width=380,height=600");
  if (!printWindow) return;

  const tableLine =
    order.type === "dine_in" && order.table && typeof order.table === "object"
      ? `Table ${order.table.tableN}`
      : ORDER_TYPE_LABELS[order.type];

  const itemsHtml = order.items
    .map((item) => {
      // Défensif : voir variantLabel.ts — même raison
      const selectedExtras = item.selectedExtras ?? [];
      const formulaLine = item.formula
        ? `<div class="sub"><b>${item.formula.name}</b>${item.formula.includes.length ? ` : ${item.formula.includes.join(", ")}` : ""}</div>`
        : "";
      const excludedIngredients = item.excludedIngredients ?? [];
      const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
      const lineTotal = (item.unitPrice + extrasTotal) * item.quantity;
      const variantLabel = formatVariantLabel(item.variantSelected);
      const extrasLine = selectedExtras.length
        ? `<div class="sub">+ ${selectedExtras.map((e) => e.name).join(", ")}</div>`
        : "";
      const excludedLine = excludedIngredients.length
        ? `<div class="sub">Sans : ${excludedIngredients.join(", ")}</div>`
        : "";

      return `
        <div class="item">
          <div class="item-row">
            <span>${item.quantity}x ${item.name}${variantLabel !== "Standard" ? ` (${variantLabel})` : ""}</span>
            <span>${formatDA(lineTotal)}</span>
          </div>
          ${formulaLine}
          ${extrasLine}
          ${excludedLine}
        </div>`;
    })
    .join("");

  const remarkHtml = order.remark
    ? `<div class="remark">Remarque : ${order.remark}</div>`
    : "";

  printWindow.document.write(`
    <html>
      <head>
        <title>Commande #${order.dailyNumber}</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 13px; width: 300px; margin: 0 auto; padding: 16px 0; }
          h1 { font-size: 22px; text-align: center; margin: 0 0 4px; }
          .meta { text-align: center; font-size: 12px; margin-bottom: 12px; }
          hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
          .item-row { display: flex; justify-content: space-between; font-weight: bold; }
          .sub { font-size: 11px; padding-left: 12px; color: #333; }
          .remark { margin-top: 8px; font-style: italic; font-size: 12px; }
          .total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; margin-top: 8px; }
        </style>
      </head>
      <body>
        <h1>NIWA FOOD</h1>
        <div class="meta">
          #${order.dailyNumber} · ${tableLine}<br/>
          ${order.client.fullName}${order.client.phone ? ` · ${order.client.phone}` : ""}<br/>
          ${formatDateTime(order.createdAt)}
        </div>
        <hr/>
        ${itemsHtml}
        ${order.deliveryFee ? `<div class="item-row"><span>Livraison</span><span>${formatDA(order.deliveryFee)}</span></div>` : ""}
        ${remarkHtml}
        <hr/>
        <div class="total-row"><span>TOTAL</span><span>${formatDA(order.totalPrice)}</span></div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
