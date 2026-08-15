export interface MenuCategory {
  _id: string;
  name: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemVariant {
  combination: Record<string, string>;
  price: number;
}

export interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  category: MenuCategory | string; // populate() renvoie l'objet, sinon juste l'id
  variants: MenuItemVariant[];
  availableExtras: MenuExtra[] | string[];
  removableIngredients: string[];
  imageUrl?: string;
  imagePublicId?: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuExtraType {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export type ExtraPriceType = "fixed" | "bySize";

export interface MenuExtra {
  _id: string;
  name: string;
  type: MenuExtraType | string;
  priceType: ExtraPriceType;
  price?: number;
  pricesBySize?: { M: number; L: number };
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuCategoryPayload {
  name: string;
  isActive?: boolean;
}

export interface CreateMenuItemPayload {
  name: string;
  description?: string;
  category: string;
  variants: MenuItemVariant[];
  availableExtras?: string[];
  removableIngredients?: string[];
  imageUrl?: string;
  available?: boolean;
}

export interface CreateMenuExtraPayload {
  name: string;
  type: string;
  priceType: ExtraPriceType;
  price?: number;
  pricesBySize?: { M: number; L: number };
  available?: boolean;
}
