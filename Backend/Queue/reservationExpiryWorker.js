import { Worker } from "bullmq";
import { connection } from "../Config/redis.js";
import { processReservationExpiry } from "../Services/reservationExpiryProcessor.js";
import { RESERVATION_EXPIRY_QUEUE_NAME } from "./reservationExpiryQueue.js";

export const createReservationExpiryWorker = () => {
  const worker = new Worker(
    RESERVATION_EXPIRY_QUEUE_NAME,
    (job) => processReservationExpiry({ reservationId: job.data.reservationId }),
    { connection, concurrency: 10 },
  );
  worker.on("failed", (job, error) => console.error(JSON.stringify({
    event: "reservation_expiry_job_failed", reservationId: job?.data?.reservationId, attempt: job?.attemptsMade, message: error.message,
  })));
  worker.on("error", (error) => console.error(JSON.stringify({ event: "reservation_expiry_worker_error", message: error.message })));
  return worker;
};
