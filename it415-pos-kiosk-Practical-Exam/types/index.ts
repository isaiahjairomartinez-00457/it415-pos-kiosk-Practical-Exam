export type PaymentMethod = "CASH" | "QR" | "CARD";

/** Product as sent to the browser. `price` is integer centavos. */
export interface ProductDTO {
  id: number;
  name: string;
  price: number;
  category: string;
  icon: string;
}

export interface CartLine {
  productId: number;
  quantity: number;
}

export interface CheckoutRequest {
  items: CartLine[];
  paymentMethod: PaymentMethod;
  /** Centavos. Only used for CASH; QR and CARD always pay the exact total. */
  amountPaid?: number;
  /** Unique per checkout attempt; protects against duplicate submissions. */
  idempotencyKey: string;
}

export interface ReceiptItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Receipt {
  transactionNumber: string;
  createdAt: string;
  items: ReceiptItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeAmount: number;
  status: string;
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; code: string };
