import assert from "node:assert/strict";
import { test } from "node:test";
import { processReservationExpiry } from "../Services/reservationExpiryProcessor.js";

const now = new Date("2026-11-16T10:00:00.000Z");

const run = (reservation, releaseReservation) => processReservationExpiry({
  reservationId: "reservation-1",
  now,
  dependencies: {
    findReservation: async () => reservation,
    releaseReservation,
  },
});

test("expiry worker releases a due active reservation through the service", async () => {
  let releasedWith;
  const result = await run(
    { status: "active", expiresAt: new Date(now.getTime() - 1) },
    async (input) => { releasedWith = input; return { released: true }; },
  );
  assert.equal(result.released, true);
  assert.equal(releasedWith.reason, "expired");
  assert.equal(releasedWith.reservationId, "reservation-1");
});

test("expiry worker leaves confirmed, released, and unexpired reservations unchanged", async () => {
  for (const reservation of [
    { status: "confirmed", expiresAt: new Date(now.getTime() - 1) },
    { status: "released", expiresAt: new Date(now.getTime() - 1) },
    { status: "active", expiresAt: new Date(now.getTime() + 1) },
  ]) {
    let releaseCalls = 0;
    const result = await run(reservation, async () => { releaseCalls += 1; return { released: true }; });
    assert.equal(releaseCalls, 0);
    assert.ok(result.skipped);
  }
});

test("duplicate expiry work relies on the release service's idempotent result", async () => {
  let releaseCalls = 0;
  const result = await run(
    { status: "active", expiresAt: new Date(now.getTime() - 1) },
    async () => { releaseCalls += 1; return { released: false }; },
  );
  assert.equal(releaseCalls, 1);
  assert.equal(result.released, false);
});
