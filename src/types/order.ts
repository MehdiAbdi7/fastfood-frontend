import type { Store } from "./store";
import type { RestaurantTable } from "./table";

export type OrderType = "dine_in" | "takeaway" | "delivery";
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

// --- Historique ---

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
