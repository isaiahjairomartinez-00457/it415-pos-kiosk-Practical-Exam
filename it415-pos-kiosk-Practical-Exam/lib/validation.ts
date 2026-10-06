import { MAX_CART_LINES, MAX_QUANTITY, MIN_QUANTITY, PAYMENT_METHODS } from "@/lib/constants";
import type { CartLine, CheckoutRequest, PaymentMethod } from "@/types";

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

const MAX_CENTAVOS = 100_000_000_00; // ₱100,000,000.00 — sanity bound on client input
const KEY_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validates untrusted checkout input. Client-supplied prices, subtotals and totals
 * are never read: only product ids, quantities, the payment method and (cash) amount.
 * Duplicate product lines are merged.
 */
export function parseCheckoutRequest(input: unknown): CheckoutRequest {
  if (!isRecord(input)) throw new ValidationError("Invalid request body.", "INVALID_REQUEST");

  const { items, paymentMethod, amountPaid, idempotencyKey } = input;

  if (typeof idempotencyKey !== "string" || !KEY_PATTERN.test(idempotencyKey)) {
    throw new ValidationError("Missing or invalid idempotency key.", "INVALID_KEY");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError("Your cart is empty.", "EMPTY_CART");
  }
  if (items.length > MAX_CART_LINES) {
    throw new ValidationError("Too many items in the order.", "TOO_MANY_ITEMS");
  }

  const merged = new Map<number, number>();
  for (const raw of items) {
    if (!isRecord(raw)) throw new ValidationError("Invalid cart item.", "INVALID_ITEM");
    const { productId, quantity } = raw;
    if (typeof productId !== "number" || !Number.isInteger(productId) || productId < 1) {
      throw new ValidationError("Invalid product.", "INVALID_PRODUCT");
    }
    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < MIN_QUANTITY ||
      quantity > MAX_QUANTITY
    ) {
      throw new ValidationError(
        `Quantity must be a whole number from ${MIN_QUANTITY} to ${MAX_QUANTITY}.`,
        "INVALID_QUANTITY",
      );
    }
    merged.set(productId, (merged.get(productId) ?? 0) + quantity);
  }

  const lines: CartLine[] = [];
  for (const [productId, quantity] of merged) {
    if (quantity > MAX_QUANTITY) {
      throw new ValidationError(`Maximum quantity is ${MAX_QUANTITY}.`, "INVALID_QUANTITY");
    }
    lines.push({ productId, quantity });
  }

  if (typeof paymentMethod !== "string" || !PAYMENT_METHODS.includes(paymentMethod as PaymentMethod)) {
    throw new ValidationError("Invalid payment method.", "INVALID_PAYMENT_METHOD");
  }

  let parsedAmount: number | undefined;
  if (paymentMethod === "CASH") {
    if (typeof amountPaid !== "number" || !Number.isInteger(amountPaid)) {
      throw new ValidationError("Please enter a valid amount paid.", "INVALID_AMOUNT");
    }
    if (amountPaid <= 0) {
      throw new ValidationError("Amount paid must be greater than zero.", "INVALID_AMOUNT");
    }
    if (amountPaid > MAX_CENTAVOS) {
      throw new ValidationError("Amount paid is too large.", "INVALID_AMOUNT");
    }
    parsedAmount = amountPaid;
  }

  return {
    items: lines,
    paymentMethod: paymentMethod as PaymentMethod,
    amountPaid: parsedAmount,
    idempotencyKey,
  };
}
