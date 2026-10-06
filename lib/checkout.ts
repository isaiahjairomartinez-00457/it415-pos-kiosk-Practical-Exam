import { lineSubtotal } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { findReceipt as findDbReceipt, getCheckoutProducts, saveCheckout } from "@/lib/database";
import { ValidationError } from "@/lib/validation";
import type { CheckoutRequest, Receipt } from "@/types";

/** Validates the order against JSON prices and saves it to data/kiosk.json. */
export async function processCheckout(request: CheckoutRequest): Promise<Receipt> {
  const products = await getCheckoutProducts(request.items.map((line) => line.productId));
  const byId = new Map(products.map((product) => [product.id, product]));
  const lines = request.items.map((line) => {
    const product = byId.get(line.productId);
    if (!product) throw new ValidationError("One of the products no longer exists.", "PRODUCT_NOT_FOUND");
    return {
      productId: product.id,
      productName: product.name,
      quantity: line.quantity,
      unitPrice: product.price,
      subtotal: lineSubtotal(product.price, line.quantity),
    };
  });
  const totalAmount = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const amountPaid = request.paymentMethod === "CASH" ? (request.amountPaid ?? 0) : totalAmount;

  if (amountPaid < totalAmount) {
    throw new ValidationError(
      `Insufficient payment. Please enter at least ${formatMoney(totalAmount)}.`,
      "INSUFFICIENT_PAYMENT",
    );
  }

  return saveCheckout({
    request,
    totalAmount,
    amountPaid,
    changeAmount: amountPaid - totalAmount,
    lines,
  });
}

export function findReceipt(transactionNumber: string): Promise<Receipt | null> {
  return findDbReceipt(transactionNumber);
}
