import assert from "node:assert/strict";
import { test } from "node:test";
import {
  checkoutFingerprint,
  reconcileRazorpayOrder,
  razorpayReceiptForOrder,
} from "../Services/paymentAttemptService.js";

const productA = "507f1f77bcf86cd799439011";
const productB = "507f1f77bcf86cd799439012";
const basePayload = {
  orderItems: [{ product: productA, qty: 1 }, { product: productB, qty: 2 }],
  shippingAddress: { address: "12  Main Street", city: "Mumbai", postalCode: "400001", country: "india" },
  paymentMethod: "RAZORPAY",
  totalPrice: 500,
};

test("same idempotency payload creates a stable checkout fingerprint", () => {
  const retriedPayload = { ...basePayload, shippingAddress: { ...basePayload.shippingAddress, address: "12 Main Street" } };
  assert.equal(checkoutFingerprint(basePayload), checkoutFingerprint(retriedPayload));
});

test("changed shipping address or quantities changes the checkout fingerprint", () => {
  assert.notEqual(
    checkoutFingerprint(basePayload),
    checkoutFingerprint({ ...basePayload, shippingAddress: { ...basePayload.shippingAddress, city: "Pune" } }),
  );
  assert.notEqual(
    checkoutFingerprint(basePayload),
    checkoutFingerprint({ ...basePayload, orderItems: [{ product: productA, qty: 2 }, { product: productB, qty: 2 }] }),
  );
});

const localOrder = { _id: "507f1f77bcf86cd799439099", totalPrice: 500 };
const providerOrder = { id: "order_test_1", receipt: razorpayReceiptForOrder(localOrder._id), amount: 50000, currency: "INR" };

test("reconciles an ambiguous creation by its unique provider receipt", async () => {
  let requests = 0;
  const razorpay = { orders: { all: async (params) => { requests += 1; return { items: params.receipt === providerOrder.receipt ? [providerOrder] : [] }; } } };
  const result = await reconcileRazorpayOrder({ razorpay, order: localOrder });
  assert.equal(result.id, providerOrder.id);
  assert.equal(requests, 1);
});

test("repeated reconciliation is idempotent and provider outages leave local state untouched", async () => {
  const razorpay = { orders: { all: async () => ({ items: [providerOrder] }) } };
  assert.equal((await reconcileRazorpayOrder({ razorpay, order: localOrder })).id, providerOrder.id);
  assert.equal((await reconcileRazorpayOrder({ razorpay, order: localOrder })).id, providerOrder.id);
  await assert.rejects(
    reconcileRazorpayOrder({ razorpay: { orders: { all: async () => { throw new Error("network unavailable"); } } }, order: localOrder }),
    /network unavailable/,
  );
});

test("reconciliation rejects provider orders with a mismatched amount or currency", async () => {
  const razorpay = { orders: { all: async () => ({ items: [{ ...providerOrder, amount: 1 }] }) } };
  assert.equal(await reconcileRazorpayOrder({ razorpay, order: localOrder }), null);
});
