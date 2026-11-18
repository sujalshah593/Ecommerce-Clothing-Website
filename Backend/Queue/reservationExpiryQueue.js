import { Queue } from "bullmq";
import { connection } from "../Config/redis.js";

const QUEUE_NAME = "reservationExpiryQueue";
const jobIdFor = (reservationId) => `reservation-expiry-${reservationId}`;

export const reservationExpiryQueue = new Queue(QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const scheduleReservationExpiry = async ({ reservationId, expiresAt }) => {
  const delay = Math.max(0, new Date(expiresAt).getTime() - Date.now());
  try {
    await reservationExpiryQueue.add(
      "expire-reservation",
      { reservationId },
      { jobId: jobIdFor(reservationId), delay },
    );
    console.info(JSON.stringify({ event: "reservation_expiry_scheduled", reservationId, expiresAt, delay }));
    return true;
  } catch (error) {
    console.error(JSON.stringify({ event: "reservation_expiry_schedule_failed", reservationId, message: error.message }));
    return false;
  }
};

export const closeReservationExpiryQueue = async () => {
  await reservationExpiryQueue.close();
};

export { QUEUE_NAME as RESERVATION_EXPIRY_QUEUE_NAME, jobIdFor as reservationExpiryJobId };
