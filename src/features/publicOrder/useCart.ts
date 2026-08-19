"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  cartCleared,
  lineAdded,
  lineQuantityChanged,
  lineRemoved,
  lineReplaced,
  productSheetClosed,
  productSheetOpened,
  selectCartCount,
  selectCartLines,
  selectCartTotal,
  selectQuantityByItem,
  ticketClosed,
  ticketOpened,
} from "./cartSlice";
import type { NewCartLine } from "@/lib/cartLine";

export function useCart() {
  const dispatch = useAppDispatch();

  return {
    lines: useAppSelector(selectCartLines),
    count: useAppSelector(selectCartCount),
    total: useAppSelector(selectCartTotal),
    quantityByItem: useAppSelector(selectQuantityByItem),

    addLine: (line: NewCartLine) => dispatch(lineAdded(line)),
    replaceLine: (previousKey: string, line: NewCartLine) =>
      dispatch(lineReplaced({ previousKey, line })),
    removeLine: (key: string) => dispatch(lineRemoved(key)),
    setQuantity: (key: string, quantity: number) =>
      dispatch(lineQuantityChanged({ key, quantity })),
    clear: () => dispatch(cartCleared()),

    openProduct: (menuItemId: string, lineKey: string | null = null) =>
      dispatch(productSheetOpened({ menuItemId, lineKey })),
    closeProduct: () => dispatch(productSheetClosed()),
    openTicket: () => dispatch(ticketOpened()),
    closeTicket: () => dispatch(ticketClosed()),
  };
}
