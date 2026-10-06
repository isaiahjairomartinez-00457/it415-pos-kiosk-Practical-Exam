import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addToCart, cartCount, cartTotal, decrementItem, MAX_QUANTITY_MESSAGE, removeItem } from "@/lib/cart";
import type { CartLine, ProductDTO } from "@/types";

const products: ProductDTO[] = [
  { id: 1, name: "Coffee", price: 4500, category: "Drinks", icon: "coffee" },
  { id: 2, name: "Sandwich", price: 5000, category: "Food", icon: "sandwich" },
  { id: 3, name: "Soft Drink", price: 3500, category: "Drinks", icon: "soft-drink" },
];

function build(...lines: [number, number][]): CartLine[] {
  return lines.map(([productId, quantity]) => ({ productId, quantity }));
}

describe("cart", () => {
  it("follows the exam scenario totals", () => {
    let items = build([1, 2], [2, 1], [3, 1]);
    assert.equal(cartTotal(items, products), 17500);
    assert.equal(cartCount(items), 4);

    items = addToCart(items, 1).items; // Coffee 2 → 3
    assert.equal(items.find((l) => l.productId === 1)?.quantity, 3);
    assert.equal(cartTotal(items, products), 22000);

    items = decrementItem(items, 1).items; // Coffee 3 → 2
    assert.equal(cartTotal(items, products), 17500);

    items = removeItem(items, 3); // remove Soft Drink
    assert.equal(cartTotal(items, products), 14000);
  });

  it("removes a line when decremented from 1 and never goes negative", () => {
    let items = build([1, 1]);
    items = decrementItem(items, 1).items;
    assert.deepEqual(items, []);
    assert.deepEqual(decrementItem(items, 1).items, []);
  });

  it("allows 99 and rejects 100", () => {
    const at98 = build([1, 98]);
    const at99 = addToCart(at98, 1);
    assert.equal(at99.error, undefined);
    assert.equal(at99.items[0].quantity, 99);

    const over = addToCart(at99.items, 1);
    assert.equal(over.error, MAX_QUANTITY_MESSAGE);
    assert.equal(over.items[0].quantity, 99);
  });
});
