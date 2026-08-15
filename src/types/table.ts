import type { Store } from "./store";

export type TableStatus = "free" | "occupied";

export interface RestaurantTable {
  _id: string;
  tableN: number;
  store: Store;
  status: TableStatus;
  currentOrderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTablePayload {
  tableN: number;
  store: Store;
}

export type UpdateTablePayload = Partial<
  Pick<RestaurantTable, "tableN" | "store" | "status" | "currentOrderId">
>;
