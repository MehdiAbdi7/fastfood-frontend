import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface HeroCarouselState {
  currentIndex: number;
}

const initialState: HeroCarouselState = {
  currentIndex: 0,
};

const heroCarouselSlice = createSlice({
  name: "heroCarousel",
  initialState,
  reducers: {
    // action.payload = nombre total de slides, pour boucler correctement
    nextHeroSlide(state, action: PayloadAction<number>) {
      const totalSlides = action.payload;
      state.currentIndex = (state.currentIndex + 1) % totalSlides;
    },
  },
});

export const { nextHeroSlide } = heroCarouselSlice.actions;
export default heroCarouselSlice.reducer;
