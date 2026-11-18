import InventoryReservation, { RESERVATION_STATUSES } from "../Models/InventoryReservation.js";
import {
  RESERVATION_RELEASE_REASONS,
  releaseReservation,
} from "./inventoryReservationService.js";

export const processReservationExpiry = async ({ reservationId, now = new Date(), dependencies = {} }) => {
  const findReservation = dependencies.findReservation || ((id) => InventoryReservation.findOne({ reservationId: id }));
  const release = dependencies.releaseReservation || releaseReservation;
  const reservation = await findReservation(reservationId);
  if (!reservation) {
    console.info(JSON.stringify({ event: "reservation_expiry_skipped", reservationId, reason: "not_found" }));
    return { skipped: "not_found" };
  }
  if (reservation.status === RESERVATION_STATUSES.CONFIRMED) {
    console.info(JSON.stringify({ event: "reservation_expiry_skipped", reservationId, reason: "confirmed" }));
    return { skipped: "confirmed" };
  }
  if (reservation.status === RESERVATION_STATUSES.RELEASED) {
    console.info(JSON.stringify({ event: "reservation_expiry_skipped", reservationId, reason: "released" }));
    return { skipped: "released" };
  }
  if (reservation.expiresAt > now) {
    console.info(JSON.stringify({ event: "reservation_expiry_skipped", reservationId, reason: "not_due" }));
    return { skipped: "not_due" };
  }

  const result = await release({ reservationId, reason: RESERVATION_RELEASE_REASONS.EXPIRED, now });
  console.info(JSON.stringify({
    event: result.released ? "reservation_expired_released" : "reservation_expiry_skipped",
    reservationId,
    reason: result.released ? undefined : "already_released",
  }));
  return result;
};
