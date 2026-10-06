import { MAX_QUANTITY, MIN_QUANTITY } from "@/lib/constants";
import type { CartLine, ProductDTO } from "@/types";

export interface CartChange {
  items: CartLine[];
  /** Set when the requested change was rejected (e.g. quantity above the maximum). */
  error?: string;
}

export const MAX_QUANTITY_MESSAGE = `Maximum quantity is ${MAX_QUANTITY}.`;

export function addToCart(items: CartLine[], productId: number): CartChange {
  const existing = items.find((line) => line.productId === productId);
  if (!existing) return { items: [...items, { productId, quantity: MIN_QUANTITY }] };
  if (existing.quantity >= MAX_QUANTITY) return { items, error: MAX_QUANTITY_MESSAGE };
  return {
    items: items.map((line) =>
      line.productId === productId ? { ...line, quantity: line.quantity + 1 } : line,
    ),
  };
}

/** Decrementing from 1 removes the line, so quantity never reaches 0 or goes negative. */
export function decrementItem(items: CartLine[], productId: number): CartChange {
  return {
    items: items.flatMap((line) => {
      if (line.productId !== productId) return [line];
      return line.quantity > MIN_QUANTITY ? [{ ...line, quantity: line.quantity - 1 }] : [];
    }),
  };
}

export function removeItem(items: CartLine[], productId: number): CartLine[] {
  return items.filter((line) => line.productId !== productId);
}

export function lineSubtotal(unitPrice: number, quantity: number): number {
  return unitPrice * quantity;
}

export function cartTotal(items: CartLine[], products: ProductDTO[]): number {
  const prices = new Map(products.map((product) => [product.id, product.price]));
  return items.reduce((sum, line) => {
    const price = prices.get(line.productId);
    return price === undefined ? sum : sum + lineSubtotal(price, line.quantity);
  }, 0);
}

export function cartCount(items: CartLine[]): number {
  return items.reduce((sum, line) => sum + line.quantity, 0);
}
