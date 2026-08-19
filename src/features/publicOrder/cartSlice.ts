import {
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  buildCartLineKey,
  countCartItems,
  sumCartTotal,
  type CartLine,
  type NewCartLine,
} from "@/lib/cartLine";
import type { RootState } from "@/lib/store";

/** Produit dont la fiche est ouverte. `lineKey` non nul = on MODIFIE une ligne. */
interface ProductSheetTarget {
  menuItemId: string;
  lineKey: string | null;
}

interface PublicCartState {
  lines: CartLine[];
  sheet: ProductSheetTarget | null;
  isTicketOpen: boolean;
}

const initialState: PublicCartState = {
  lines: [],
  sheet: null,
  isTicketOpen: false,
};

// L'état d'ouverture des modales vit ici, pas dans un useState local : c'est
// ce qui permet au ticket (CartSheet) de rouvrir la fiche produit (DishList)
// sans qu'aucun des deux ne connaisse l'existence de l'autre.

function upsert(lines: CartLine[], newLine: NewCartLine) {
  const key = buildCartLineKey(newLine);
  const existing = lines.find((line) => line.key === key);

  if (existing) {
    existing.quantity += newLine.quantity;
    return;
  }

  lines.push({ ...newLine, key });
}

const cartSlice = createSlice({
  name: "publicCart",
  initialState,
  reducers: {
    lineAdded(state, action: PayloadAction<NewCartLine>) {
      upsert(state.lines, action.payload);
    },

    // Modification d'une ligne existante : l'ancienne disparaît, la nouvelle
    // est insérée par la même règle de fusion — si le client retombe sur une
    // configuration déjà au panier, les deux lignes se rejoignent.
    lineReplaced(
      state,
      action: PayloadAction<{ previousKey: string; line: NewCartLine }>,
    ) {
      state.lines = state.lines.filter(
        (line) => line.key !== action.payload.previousKey,
      );
      upsert(state.lines, action.payload.line);
    },

    lineRemoved(state, action: PayloadAction<string>) {
      state.lines = state.lines.filter((line) => line.key !== action.payload);
    },

    // Passer sous 1 supprime la ligne : c'est le geste attendu quand on
    // martèle le "−", et ça évite une ligne fantôme à 0.
    lineQuantityChanged(
      state,
      action: PayloadAction<{ key: string; quantity: number }>,
    ) {
      const { key, quantity } = action.payload;

      if (quantity <= 0) {
        state.lines = state.lines.filter((line) => line.key !== key);
        return;
      }

      const line = state.lines.find((l) => l.key === key);
      if (line) line.quantity = quantity;
    },

    cartCleared(state) {
      state.lines = [];
      state.isTicketOpen = false;
    },

    productSheetOpened(state, action: PayloadAction<ProductSheetTarget>) {
      state.sheet = action.payload;
      // Le ticket se referme : les deux modales ne doivent jamais se
      // superposer, sinon la fermeture de l'une laisse l'autre orpheline.
      state.isTicketOpen = false;
    },

    productSheetClosed(state) {
      state.sheet = null;
    },

    ticketOpened(state) {
      state.isTicketOpen = true;
    },

    ticketClosed(state) {
      state.isTicketOpen = false;
    },
  },
});

export const {
  lineAdded,
  lineReplaced,
  lineRemoved,
  lineQuantityChanged,
  cartCleared,
  productSheetOpened,
  productSheetClosed,
  ticketOpened,
  ticketClosed,
} = cartSlice.actions;

export default cartSlice.reducer;

/* ---------- Sélecteurs ---------- */

export const selectCartLines = (state: RootState) => state.publicCart.lines;
export const selectProductSheet = (state: RootState) => state.publicCart.sheet;
export const selectIsTicketOpen = (state: RootState) =>
  state.publicCart.isTicketOpen;

// Primitives : pas besoin de mémoïsation, la comparaison par référence de
// useSelector fonctionne déjà sur un nombre.
export const selectCartCount = (state: RootState) =>
  countCartItems(state.publicCart.lines);

export const selectCartTotal = (state: RootState) =>
  sumCartTotal(state.publicCart.lines);

// Objet, donc createSelector obligatoire : un nouvel objet à chaque appel
// ferait re-rendre tous les abonnés à chaque action, panier ou non.
export const selectQuantityByItem = createSelector(
  [selectCartLines],
  (lines) => {
    const counts: Record<string, number> = {};
    for (const line of lines) {
      counts[line.menuItemId] = (counts[line.menuItemId] ?? 0) + line.quantity;
    }
    return counts;
  },
);
