import { Prisma, type PrismaClient } from "@prisma/client";
import { lineSubtotal } from "@/lib/cart";
import { ValidationError } from "@/lib/validation";
import { formatMoney } from "@/lib/money";
import type { CheckoutRequest, PaymentMethod, Receipt } from "@/types";

type TransactionWithItems = Prisma.TransactionGetPayload<{ include: { items: true } }>;

export function toReceipt(txn: TransactionWithItems): Receipt {
  return {
    transactionNumber: txn.transactionNumber,
    createdAt: txn.createdAt.toISOString(),
    items: txn.items
      .slice()
      .sort((a, b) => a.id - b.id)
      .map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
    totalAmount: txn.totalAmount,
    paymentMethod: txn.paymentMethod as PaymentMethod,
    amountPaid: txn.amountPaid,
    changeAmount: txn.changeAmount,
    status: txn.status,
  };
}

export function formatTransactionNumber(year: number, sequence: number): string {
  return `TXN-${year}-${String(sequence).padStart(5, "0")}`;
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

/**
 * Allocates the next sequence number for the year. The INSERT … ON DUPLICATE KEY UPDATE
 * takes a row lock held until the surrounding transaction ends, so concurrent checkouts
 * are serialized and can never receive the same number. If the checkout rolls back, the
 * increment rolls back with it (no gaps from failed payments).
 */
async function nextSequence(tx: Prisma.TransactionClient, year: number): Promise<number> {
  await tx.$executeRaw`
    INSERT INTO TransactionCounter (year, lastValue) VALUES (${year}, 1)
    ON DUPLICATE KEY UPDATE lastValue = lastValue + 1`;
  const rows = await tx.$queryRaw<{ lastValue: number }[]>`
    SELECT lastValue FROM TransactionCounter WHERE year = ${year}`;
  return Number(rows[0].lastValue);
}

/**
 * Validates the order against the database and saves it atomically.
 * Prices always come from MySQL; nothing monetary is trusted from the client.
 * A failed or insufficient payment throws BEFORE anything is written.
 */
export async function processCheckout(db: PrismaClient, request: CheckoutRequest): Promise<Receipt> {
  const existing = await db.transaction.findUnique({
    where: { idempotencyKey: request.idempotencyKey },
    include: { items: true },
  });
  if (existing) return toReceipt(existing);

  const ids = request.items.map((line) => line.productId);
  const products = await db.product.findMany({ where: { id: { in: ids } } });
  const byId = new Map(products.map((p) => [p.id, p]));

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
  const changeAmount = amountPaid - totalAmount;

  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const created = await db.$transaction(async (tx) => {
        const sequence = await nextSequence(tx, year);
        return tx.transaction.create({
          data: {
            transactionNumber: formatTransactionNumber(year, sequence),
            idempotencyKey: request.idempotencyKey,
            totalAmount,
            paymentMethod: request.paymentMethod,
            amountPaid,
            changeAmount,
            status: "SUCCESS",
            items: { create: lines },
          },
          include: { items: true },
        });
      });
      return toReceipt(created);
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      // Same idempotency key committed by a concurrent request: return that transaction.
      const winner = await db.transaction.findUnique({
        where: { idempotencyKey: request.idempotencyKey },
        include: { items: true },
      });
      if (winner) return toReceipt(winner);
    }
  }
  throw new Error("Could not allocate a unique transaction number.");
}

export async function findReceipt(db: PrismaClient, transactionNumber: string): Promise<Receipt | null> {
  const txn = await db.transaction.findUnique({
    where: { transactionNumber },
    include: { items: true },
  });
  return txn ? toReceipt(txn) : null;
}
