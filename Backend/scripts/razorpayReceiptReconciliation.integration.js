/*
 * Standalone Razorpay TEST MODE integration check.
 *
 * Required environment variables:
 *   RAZORPAY_KEY_ID=rzp_test_...
 *   RAZORPAY_KEY_SECRET=...
 *   SHREEJI_TEST_RUN_ID=<unique review-approved identifier>
 *   SHREEJI_RAZORPAY_INTEGRATION_TEST=1
 *
 * This script does not load .env, MongoDB, Redis, Express, or BullMQ.
 * It creates at most one Razorpay test order for the supplied run ID. Re-running
 * it finds that same order by receipt and does not create another one.
 */
import assert from "node:assert/strict";
import crypto from "node:crypto";
import Razorpay from "razorpay";
import { razorpayReceiptForOrder } from "../Services/paymentAttemptService.js";

const TEST_AMOUNT = 100; // INR subunits: ₹1.00
const TEST_CURRENCY = "INR";

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
};

const getTestOrderId = () => crypto
  .createHash("sha256")
  .update(required("SHREEJI_TEST_RUN_ID"))
  .digest("hex")
  .slice(0, 24);

const assertTestMode = () => {
  if (process.env.SHREEJI_RAZORPAY_INTEGRATION_TEST !== "1") {
    throw new Error("Set SHREEJI_RAZORPAY_INTEGRATION_TEST=1 to run this test");
  }
  if (!required("RAZORPAY_KEY_ID").startsWith("rzp_test_")) {
    throw new Error("Only Razorpay TEST MODE keys are accepted");
  }
  required("RAZORPAY_KEY_SECRET");
};

const isExactMatch = (order, receipt) =>
  order.receipt === receipt && order.amount === TEST_AMOUNT && order.currency === TEST_CURRENCY;

export const findOrdersByReceiptPaginated = async ({ ordersApi, receipt, pageSize = 1 }) => {
  const matches = [];
  let skip = 0;
  while (true) {
    const response = await ordersApi.all({ receipt, count: pageSize, skip });
    const items = response?.items || [];
    matches.push(...items.filter((order) => isExactMatch(order, receipt)));
    if (items.length < pageSize) break;
    skip += items.length;
  }
  if (matches.length > 1) {
    throw new Error("Unexpected duplicate Razorpay orders matched the test receipt");
  }
  return matches[0] || null;
};

const runMockSafetyChecks = async () => {
  const receipt = "shreeji_mock_receipt";
  const expected = { id: "order_mock_1", receipt, amount: TEST_AMOUNT, currency: TEST_CURRENCY };
  const paginatedCalls = [];
  const paginatedApi = {
    all: async ({ skip }) => {
      paginatedCalls.push(skip);
      return skip === 0 ? { items: [expected] } : { items: [] };
    },
  };
  assert.deepEqual(await findOrdersByReceiptPaginated({ ordersApi: paginatedApi, receipt }), expected);
  assert.deepEqual(paginatedCalls, [0, 1]);

  await assert.rejects(
    findOrdersByReceiptPaginated({
      ordersApi: { all: async () => ({ items: [expected, { ...expected, id: "order_mock_2" }] }) },
      receipt,
      pageSize: 10,
    }),
    /duplicate Razorpay orders/,
  );

  let createCalls = 0;
  const unavailableProvider = {
    all: async () => { throw new Error("simulated provider outage"); },
    create: async () => { createCalls += 1; },
  };
  await assert.rejects(findOrdersByReceiptPaginated({ ordersApi: unavailableProvider, receipt }), /provider outage/);
  assert.equal(createCalls, 0, "A provider lookup failure must not create another order");
};

const main = async () => {
  assertTestMode();
  await runMockSafetyChecks();

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  const receipt = razorpayReceiptForOrder(getTestOrderId());

  let order = await findOrdersByReceiptPaginated({ ordersApi: razorpay.orders, receipt });
  let created = false;
  if (!order) {
    order = await razorpay.orders.create({ amount: TEST_AMOUNT, currency: TEST_CURRENCY, receipt });
    created = true;
  }

  const reconciled = await findOrdersByReceiptPaginated({ ordersApi: razorpay.orders, receipt });
  assert.ok(reconciled, "The test order must be returned by receipt filtering");
  assert.equal(reconciled.id, order.id);
  assert.equal(reconciled.receipt, receipt);
  assert.equal(reconciled.amount, TEST_AMOUNT);
  assert.equal(reconciled.currency, TEST_CURRENCY);

  console.log(JSON.stringify({
    result: "passed",
    created,
    receipt,
    orderId: reconciled.id,
    amount: reconciled.amount,
    currency: reconciled.currency,
  }));
};

main().catch((error) => {
  console.error(`Razorpay receipt reconciliation integration test failed: ${error.message}`);
  process.exitCode = 1;
});
