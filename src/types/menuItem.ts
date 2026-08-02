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
  availableExtras: string[];
  removableIngredients: string[];
  imageUrl?: string;
  imagePublicId?: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}
