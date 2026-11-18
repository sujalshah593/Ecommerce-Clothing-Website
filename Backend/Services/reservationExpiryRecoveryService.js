import InventoryReservation, { RESERVATION_STATUSES } from "../Models/InventoryReservation.js";
import { processReservationExpiry } from "./reservationExpiryProcessor.js";
import { scheduleReservationExpiry } from "../Queue/reservationExpiryQueue.js";

const DEFAULT_BATCH_SIZE = 100;

export const recoverReservationExpiries = async ({ batchSize = DEFAULT_BATCH_SIZE, now = new Date() } = {}) => {
  let cursor = null;
  let scanned = 0;
  let released = 0;
  console.info(JSON.stringify({ event: "reservation_recovery_started", batchSize }));
  try {
    while (true) {
      const query = { status: RESERVATION_STATUSES.ACTIVE };
      if (cursor) {
        query.$or = [
          { expiresAt: { $gt: cursor.expiresAt } },
          { expiresAt: cursor.expiresAt, _id: { $gt: cursor._id } },
        ];
      }
      const reservations = await InventoryReservation.find(query)
        .sort({ expiresAt: 1, _id: 1 })
        .limit(batchSize)
        .select("reservationId expiresAt status");
      if (reservations.length === 0) break;

      for (const reservation of reservations) {
        scanned += 1;
        if (reservation.expiresAt <= now) {
          const result = await processReservationExpiry({ reservationId: reservation.reservationId, now });
          if (result.released) released += 1;
        } else {
          await scheduleReservationExpiry({ reservationId: reservation.reservationId, expiresAt: reservation.expiresAt });
        }
      }
      cursor = reservations[reservations.length - 1];
    }
    console.info(JSON.stringify({ event: "reservation_recovery_completed", scanned, released }));
    return { scanned, released };
  } catch (error) {
    console.error(JSON.stringify({ event: "reservation_recovery_failed", scanned, message: error.message }));
    throw error;
  }
};
