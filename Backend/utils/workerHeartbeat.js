import { connection } from "../Config/redis.js";
import {
  RESERVATION_WORKER_HEARTBEAT_KEY,
  RESERVATION_WORKER_HEARTBEAT_TTL_MS,
} from "../Config/workerHealth.js";

export const recordReservationWorkerHeartbeat = async () => {
  await connection.set(
    RESERVATION_WORKER_HEARTBEAT_KEY,
    new Date().toISOString(),
    "PX",
    RESERVATION_WORKER_HEARTBEAT_TTL_MS,
  );
};
