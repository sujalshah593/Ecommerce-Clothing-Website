import { RESERVATION_WORKER_HEARTBEAT_KEY } from "../Config/workerHealth.js";

export const verifyWorkerHealth = async ({ mongoAdmin, redis }) => {
  await mongoAdmin.ping();
  await redis.ping();
  const heartbeat = await redis.get(RESERVATION_WORKER_HEARTBEAT_KEY);
  if (!heartbeat) throw new Error("reservation worker heartbeat is missing or stale");
  return { healthy: true, heartbeat };
};
