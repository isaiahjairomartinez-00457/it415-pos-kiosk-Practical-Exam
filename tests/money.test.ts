import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatMoney, pesosToCentavos } from "@/lib/money";

describe("formatMoney", () => {
  it("formats integer centavos as pesos", () => {
    assert.equal(formatMoney(4500), "₱45.00");
    assert.equal(formatMoney(5000), "₱50.00");
    assert.equal(formatMoney(17500), "₱175.00");
    assert.equal(formatMoney(0), "₱0.00");
    assert.equal(formatMoney(5), "₱0.05");
    assert.equal(formatMoney(100000), "₱1,000.00");
    assert.equal(formatMoney(123456789), "₱1,234,567.89");
  });

  it("converts pesos to centavos without float drift", () => {
    assert.equal(pesosToCentavos(0.1 + 0.2), 30);
    assert.equal(pesosToCentavos(45), 4500);
  });
});
