import type { Store } from "./store";

export type UserRole = "admin" | "employee";

export interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  tel: string;
  role: UserRole;
  store?: Store; // présent uniquement si role === "employee"
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  firstname: string;
  lastname: string;
  email: string;
  tel: string;
  password: string;
  role: UserRole;
  store?: Store;
}

export type UpdateUserPayload = Partial<
  Pick<CreateUserPayload, "firstname" | "lastname" | "email" | "tel" | "role" | "store">
>;
