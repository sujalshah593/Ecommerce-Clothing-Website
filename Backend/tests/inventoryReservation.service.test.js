import assert from "node:assert/strict";
import { test } from "node:test";
import mongoose from "mongoose";
import { ReservationError, normalizeReservationItems } from "../Services/inventoryReservationService.js";

test("normalizes duplicate product lines into one deterministic reservation line", () => {
  const product = new mongoose.Types.ObjectId();
  const normalized = normalizeReservationItems([
    { product, qty: 1 },
    { product: product.toString(), qty: 2 },
  ]);
  assert.equal(normalized.length, 1);
  assert.equal(String(normalized[0].product), String(product));
  assert.equal(normalized[0].qty, 3);
});

test("rejects invalid reservation product quantities before opening a transaction", () => {
  assert.throws(
    () => normalizeReservationItems([{ product: new mongoose.Types.ObjectId(), qty: 1.5 }]),
    (error) => error instanceof ReservationError && error.code === "INVALID_RESERVATION_ITEMS",
  );
});
