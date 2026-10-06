import type { PaymentMethod } from "@/types";

export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 99;
export const MAX_CART_LINES = 50;
export const MAX_CASH_PESOS = 9_999_999;
export const CARD_PROCESSING_MS = 2000;

export const PAYMENT_METHODS: readonly PaymentMethod[] = ["CASH", "QR", "CARD"];

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash",
  QR: "QR Payment",
  CARD: "Credit/Debit Card",
};

export const CATEGORIES = [
  "All",
  "Chicken Meals",
  "Combo Meals",
  "Rice Meals",
  "Sides",
  "Drinks",
  "Desserts",
] as const;
