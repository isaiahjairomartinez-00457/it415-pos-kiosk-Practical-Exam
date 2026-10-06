/**
 * Database QA for checkout. Runs against a THROWAWAY database named in TEST_DATABASE_URL
 * (the database name must end in `_test` or `_qa`). It writes transactions, so never point
 * it at the real kiosk database.
 *
 *   npm run test:db
 */
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { PrismaClient } from "@prisma/client";
import { processCheckout } from "@/lib/checkout";
import { parseCheckoutRequest, ValidationError } from "@/lib/validation";
import type { CheckoutRequest } from "@/types";

const testUrl = process.env.TEST_DATABASE_URL;
const safe = !!testUrl && /_(test|qa)(\?.*)?$/.test(testUrl);

let db: PrismaClient;
let seq = 0;
const key = () => `qa-key-${Date.now()}-${++seq}`;
const ids: Record<string, number> = {};

function order(method: CheckoutRequest["paymentMethod"], lines: [string, number][], amountPaid?: number): CheckoutRequest {
  return parseCheckoutRequest({
    items: lines.map(([name, quantity]) => ({ productId: ids[name], quantity })),
    paymentMethod: method,
    amountPaid,
    idempotencyKey: key(),
  });
}

const counts = async () => ({
  transactions: await db.transaction.count(),
  items: await db.transactionItem.count(),
});

describe("checkout (database)", { skip: safe ? false : "Set TEST_DATABASE_URL to a *_test or *_qa database to run." }, () => {
  before(async () => {
    process.env.DATABASE_URL = testUrl;
    db = (await import("@/lib/prisma")).prisma;
    const seed = [
      ["Coffee", 4500, "Drinks"],
      ["Sandwich", 5000, "Food"],
      ["Soft Drink", 3500, "Drinks"],
    ] as const;
    for (const [name, price, category] of seed) {
      const p = await db.product.upsert({ where: { name }, update: { price }, create: { name, price, category, icon: "x" } });
      ids[name] = p.id;
    }
  });

  after(async () => {
    await db?.$disconnect();
  });

  it("cash: ₱175 order paid with ₱200 → change ₱25, exactly one transaction", async () => {
    const before = await counts();
    const receipt = await processCheckout(db, order("CASH", [["Coffee", 2], ["Sandwich", 1], ["Soft Drink", 1]], 20000));
    assert.equal(receipt.totalAmount, 17500);
    assert.equal(receipt.amountPaid, 20000);
    assert.equal(receipt.changeAmount, 2500);
    assert.match(receipt.transactionNumber, /^TXN-\d{4}-\d{5}$/);
    const after = await counts();
    assert.equal(after.transactions, before.transactions + 1);
    assert.equal(after.items, before.items + 3);
    const stored = await db.transaction.findUniqueOrThrow({ where: { transactionNumber: receipt.transactionNumber }, include: { items: true } });
    assert.equal(stored.paymentMethod, "CASH");
    assert.equal(stored.status, "SUCCESS");
    assert.equal(stored.items.reduce((s, i) => s + i.subtotal, 0), stored.totalAmount);
  });

  it("cash: exact payment gives ₱0 change", async () => {
    const receipt = await processCheckout(db, order("CASH", [["Coffee", 2], ["Sandwich", 1]], 14000));
    assert.equal(receipt.changeAmount, 0);
  });

  it("cash: insufficient payment is rejected and writes nothing", async () => {
    const before = await counts();
    const counterBefore = await db.transactionCounter.findMany();
    await assert.rejects(
      processCheckout(db, order("CASH", [["Coffee", 2], ["Sandwich", 1]], 10000)),
      (error: unknown) => error instanceof ValidationError && error.code === "INSUFFICIENT_PAYMENT" && error.message === "Insufficient payment. Please enter at least ₱140.00.",
    );
    assert.deepEqual(await counts(), before);
    assert.deepEqual(await db.transactionCounter.findMany(), counterBefore);
  });

  it("QR and card: amount paid equals total and client amount is ignored", async () => {
    for (const method of ["QR", "CARD"] as const) {
      const req = { ...order(method, [["Coffee", 2], ["Sandwich", 1]]), amountPaid: 999999 };
      const receipt = await processCheckout(db, req);
      assert.equal(receipt.amountPaid, 14000);
      assert.equal(receipt.changeAmount, 0);
      assert.equal(receipt.paymentMethod, method);
    }
  });

  it("unknown product rolls back with no records", async () => {
    const before = await counts();
    const req = parseCheckoutRequest({ items: [{ productId: 987654, quantity: 1 }], paymentMethod: "CARD", idempotencyKey: key() });
    await assert.rejects(processCheckout(db, req), (e: unknown) => e instanceof ValidationError && e.code === "PRODUCT_NOT_FOUND");
    assert.deepEqual(await counts(), before);
  });

  it("20 concurrent checkouts get 20 distinct, gap-free transaction numbers", async () => {
    const receipts = await Promise.all(Array.from({ length: 20 }, () => processCheckout(db, order("CARD", [["Coffee", 1]]))));
    const numbers = receipts.map((r) => r.transactionNumber);
    assert.equal(new Set(numbers).size, 20);
    const seqs = numbers.map((n) => Number(n.slice(-5))).sort((a, b) => a - b);
    for (let i = 1; i < seqs.length; i++) assert.equal(seqs[i], seqs[i - 1] + 1);
  });

  it("double-clicking pay (same idempotency key, concurrent) creates one transaction", async () => {
    const req = order("CASH", [["Soft Drink", 1]], 5000);
    const before = await counts();
    const results = await Promise.all(Array.from({ length: 6 }, () => processCheckout(db, req)));
    assert.equal(new Set(results.map((r) => r.transactionNumber)).size, 1);
    const after = await counts();
    assert.equal(after.transactions, before.transactions + 1);
    assert.equal(after.items, before.items + 1);
  });

  it("receipts keep the historical name and price after a price change", async () => {
    const receipt = await processCheckout(db, order("CARD", [["Sandwich", 2]]));
    await db.product.update({ where: { id: ids["Sandwich"] }, data: { price: 9900, name: "Sandwich" } });
    const stored = await db.transaction.findUniqueOrThrow({ where: { transactionNumber: receipt.transactionNumber }, include: { items: true } });
    assert.equal(stored.items[0].unitPrice, 5000);
    assert.equal(stored.items[0].subtotal, 10000);
    assert.equal(stored.totalAmount, 10000);
    const next = await processCheckout(db, order("CARD", [["Sandwich", 1]]));
    assert.equal(next.totalAmount, 9900); // new orders use the new database price
    await db.product.update({ where: { id: ids["Sandwich"] }, data: { price: 5000 } });
  });

  it("allows quantity 99", async () => {
    const receipt = await processCheckout(db, order("CARD", [["Coffee", 99]]));
    assert.equal(receipt.totalAmount, 99 * 4500);
  });
});
