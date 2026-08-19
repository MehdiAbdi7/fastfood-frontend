import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";

interface MenuBrowseState {
  search: string;
  groupLabel: string | null; // null = "Tout le menu"
  subCategoryId: string | null;
}

const initialState: MenuBrowseState = {
  search: "",
  groupLabel: null,
  subCategoryId: null,
};

const browseSlice = createSlice({
  name: "menuBrowse",
  initialState,
  reducers: {
    searchChanged(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },

    // Changer de groupe DOIT vider la sous-sélection : un id de "Canettes"
    // resté actif en passant sur "Burgers" donnerait une grille vide.
    groupSelected(state, action: PayloadAction<string | null>) {
      state.groupLabel = action.payload;
      state.subCategoryId = null;
    },

    subCategorySelected(state, action: PayloadAction<string | null>) {
      state.subCategoryId = action.payload;
    },

    filtersReset(state) {
      state.search = "";
      state.groupLabel = null;
      state.subCategoryId = null;
    },
  },
});

export const {
  searchChanged,
  groupSelected,
  subCategorySelected,
  filtersReset,
} = browseSlice.actions;

export default browseSlice.reducer;

export const selectSearch = (state: RootState) => state.menuBrowse.search;
export const selectGroupLabel = (state: RootState) =>
  state.menuBrowse.groupLabel;
export const selectSubCategoryId = (state: RootState) =>
  state.menuBrowse.subCategoryId;
