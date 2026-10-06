import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseCheckoutRequest, ValidationError } from "@/lib/validation";

const key = "test-key-12345678";
const base = { items: [{ productId: 1, quantity: 2 }], paymentMethod: "CARD", idempotencyKey: key };

function codeOf(input: unknown): string {
  try {
    parseCheckoutRequest(input);
  } catch (error) {
    if (error instanceof ValidationError) return error.code;
    throw error;
  }
  return "OK";
}

describe("parseCheckoutRequest", () => {
  it("accepts a valid card order and ignores client money fields", () => {
    const parsed = parseCheckoutRequest({ ...base, totalAmount: 1, price: 1, items: [{ productId: 1, quantity: 2, price: 1, subtotal: 1 }] });
    assert.deepEqual(parsed.items, [{ productId: 1, quantity: 2 }]);
    assert.equal(parsed.amountPaid, undefined);
  });

  it("rejects bad bodies", () => {
    assert.equal(codeOf(null), "INVALID_REQUEST");
    assert.equal(codeOf([]), "INVALID_REQUEST");
    assert.equal(codeOf({ ...base, items: [] }), "EMPTY_CART");
    assert.equal(codeOf({ ...base, items: "x" }), "EMPTY_CART");
    assert.equal(codeOf({ ...base, idempotencyKey: "x" }), "INVALID_KEY");
    assert.equal(codeOf({ ...base, paymentMethod: "BITCOIN" }), "INVALID_PAYMENT_METHOD");
  });

  it("enforces quantity 1..99 integers", () => {
    for (const quantity of [0, -1, 100, 1.5, "2", null, NaN]) {
      assert.equal(codeOf({ ...base, items: [{ productId: 1, quantity }] }), "INVALID_QUANTITY", String(quantity));
    }
    assert.equal(codeOf({ ...base, items: [{ productId: 1, quantity: 99 }] }), "OK");
    assert.equal(codeOf({ ...base, items: [{ productId: 1, quantity: 60 }, { productId: 1, quantity: 60 }] }), "INVALID_QUANTITY");
  });

  it("rejects invalid products", () => {
    for (const productId of [0, -3, 1.2, "1", undefined]) {
      assert.equal(codeOf({ ...base, items: [{ productId, quantity: 1 }] }), "INVALID_PRODUCT");
    }
  });

  it("requires a valid positive integer amount for cash", () => {
    const cash = { ...base, paymentMethod: "CASH" };
    for (const amountPaid of [undefined, null, "200", 0, -5, 20.5, NaN, Infinity]) {
      assert.equal(codeOf({ ...cash, amountPaid }), "INVALID_AMOUNT", String(amountPaid));
    }
    assert.equal(codeOf({ ...cash, amountPaid: 20000 }), "OK");
  });
});
