import type { Store } from "./store";
import type { RestaurantTable } from "./table";

/**
 * Miroir de src/config/orderTypes.ts côté backend.
 *
 * Une LISTE et non seulement une union de types : les onglets de filtre ont
 * besoin d'itérer dessus, et une seconde liste recopiée dans un composant
 * finirait par oublier un mode de service.
 */
export const ORDER_TYPES = ["dine_in", "takeaway", "delivery"] as const;

export type OrderType = (typeof ORDER_TYPES)[number];
export type OrderStatus =
  | "pending"
  | "ready"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export interface OrderItemExtra {
  extraId: string;
  name: string; // snapshot au moment de la commande
  price: number; // snapshot au moment de la commande
}

export interface OrderFormula {
  formulaId: string;
  name: string;
  price: number;
  pricingMode: "fixed" | "supplement";
  includes: string[];
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  variantSelected: Record<string, string>;
  unitPrice: number;
  selectedExtras: OrderItemExtra[];
  excludedIngredients: string[];
  quantity: number;
  formula?: OrderFormula;
}

export interface OrderClient {
  fullName: string;
  phone?: string;
  address?: string;
}

export interface Order {
  _id: string;
  type: OrderType;
  status: OrderStatus;
  store: Store;
  dailyNumber: number;
  /**
   * Journée commerciale d'appartenance (ISO, minuit UTC).
   *
   * Dérivée de l'heure d'OUVERTURE du service : une commande encaissée à 00h20
   * appartient au service de la veille. C'est le seul axe temporel de
   * l'historique et du calendrier — `completedAt` ne sert qu'à l'affichage de
   * l'heure et au tri à l'intérieur d'un même service.
   *
   * Toujours l'afficher avec formatServiceDate() (timeZone UTC), jamais avec
   * formatDateTime(), sous peine de décaler la date d'un jour.
   */
  serviceDate: string;
  table?: RestaurantTable | string | null;
  client: OrderClient;
  items: OrderItem[];
  remark?: string;
  deliveryFee?: number;
  totalPrice: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Ce que renvoie GET /orders/:id/track — route publique, sans authentification.
// La projection du backend exclut téléphone et adresse : la room de suivi est
// ouverte à quiconque connaît l'id. Un type distinct plutôt qu'un Order
// partiel, pour que le compilateur interdise de lire un champ absent.
export interface OrderTracking {
  _id: string;
  type: OrderType;
  status: OrderStatus;
  store: Store;
  dailyNumber: number;
  client: { fullName: string };
  items: OrderItem[];
  remark?: string;
  deliveryFee?: number;
  totalPrice: number;
  completedAt: string | null;
  createdAt: string;
}

// Payload de création — items simplifiés : le serveur résout prix/noms,
// le client n'envoie que des IDs et des choix (voir utils/pricing.ts backend)
export interface CreateOrderItemPayload {
  menuItemId: string;
  variantSelected: Record<string, string>;
  selectedExtras: { extraId: string }[];
  excludedIngredients: string[];
  quantity: number;
  formula?: { formulaId: string; choices: Record<string, string> };
}

export type CreateOrderPayload =
  | {
      type: "dine_in";
      table: string;
      client: { fullName: string };
      remark?: string;
      items: CreateOrderItemPayload[];
    }
  | {
      type: "takeaway";
      store: Store;
      client: { fullName: string; phone: string };
      remark?: string;
      items: CreateOrderItemPayload[];
    }
  | {
      type: "delivery";
      store: Store;
      client: { fullName: string; phone: string; address: string };
      remark?: string;
      items: CreateOrderItemPayload[];
    };

export type OrdersScope = "active" | "service" | "all";

export interface OrdersQueryParams {
  status?: OrderStatus;
  type?: OrderType;
  store?: Store;
  scope?: OrdersScope;
  page?: number;
  limit?: number;
}

// --- Service (compteur) ---

export interface CounterState {
  store: Store;
  value: number;
  lastResetAt: string | null;
}

export interface ServiceStats {
  store: Store;
  serviceStartedAt: string | null;
  lastOrderNumber: number;
  orders: number;
  completed: number;
  revenue: number;
  averageBasket: number;
  byStatus: Partial<Record<OrderStatus, number>>;
  byType: { _id: OrderType; count: number; revenue: number }[];
  topItems: { name: string; quantity: number }[];
}

// --- Historique (agrégations du calendrier) ---

export interface HistoryYearEntry {
  year: number;
  count: number;
  totalSales: number;
}

export interface HistoryMonthEntry {
  month: number;
  count: number;
  totalSales: number;
}

export interface HistoryDayEntry {
  day: number;
  count: number;
  totalSales: number;
}
