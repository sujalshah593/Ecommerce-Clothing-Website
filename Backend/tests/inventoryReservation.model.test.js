import assert from "node:assert/strict";
import { test } from "node:test";
import mongoose from "mongoose";
import InventoryReservation, { RESERVATION_STATUSES } from "../Models/InventoryReservation.js";

const validReservation = () => new InventoryReservation({
  customer: new mongoose.Types.ObjectId(),
  order: new mongoose.Types.ObjectId(),
  items: [{ product: new mongoose.Types.ObjectId(), qty: 1 }],
  idempotencyKey: "checkout-key-1",
});

test("reservation validates required ownership, order, items, and idempotency data", async () => {
  const reservation = validReservation();
  await reservation.validate();
  assert.equal(reservation.status, RESERVATION_STATUSES.ACTIVE);
  assert.ok(reservation.reservationId);
  assert.ok(reservation.expiresAt instanceof Date);

  const missingAssociations = new InventoryReservation({
    items: [{ product: new mongoose.Types.ObjectId(), qty: 1 }],
    idempotencyKey: "checkout-key-2",
  });
  await assert.rejects(missingAssociations.validate());
});

test("reservation quantities must be positive integers and items cannot be empty", async () => {
  const fractional = validReservation();
  fractional.items[0].qty = 1.5;
  await assert.rejects(fractional.validate());

  const empty = validReservation();
  empty.items = [];
  await assert.rejects(empty.validate());
});

test("new reservations must start active and document saves cannot change lifecycle state", async () => {
  const invalidInitialState = validReservation();
  invalidInitialState.status = RESERVATION_STATUSES.CONFIRMED;
  await assert.rejects(invalidInitialState.validate());

  const invalidInitialMetadata = validReservation();
  invalidInitialMetadata.releaseReason = "expired";
  await assert.rejects(invalidInitialMetadata.validate());

  const existingReservation = validReservation();
  existingReservation.$isNew = false;
  existingReservation.status = RESERVATION_STATUSES.RELEASED;
  await assert.rejects(existingReservation.validate(), /transitionStatus/);
});

test("transition helper only accepts confirmed or released as targets", async () => {
  await assert.rejects(
    InventoryReservation.transitionStatus("reservation-1", RESERVATION_STATUSES.ACTIVE),
    /Invalid reservation transition target/,
  );

  await assert.rejects(
    InventoryReservation.transitionStatus("reservation-1", RESERVATION_STATUSES.RELEASED),
    /release reason is required/,
  );

  await assert.rejects(
    InventoryReservation.findOneAndUpdate(
      { reservationId: "reservation-1", status: RESERVATION_STATUSES.RELEASED },
      { $set: { status: RESERVATION_STATUSES.ACTIVE } },
    ).exec(),
    /Reservation status can only transition atomically/,
  );
});
