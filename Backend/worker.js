import dotenv from "dotenv";
dotenv.config({ path: new URL("./.env", import.meta.url) });
import mongoose from "mongoose";

import { createEmailWorker } from "./Queue/emailWorker.js";
import { createReservationExpiryWorker } from "./Queue/reservationExpiryWorker.js";
import { closeRedis } from "./Config/redis.js";
import { closeEmailQueue } from "./Queue/emailQueue.js";
import { closeReservationExpiryQueue } from "./Queue/reservationExpiryQueue.js";
import connectDB, { CONNECTION_ROLES } from "./Config/db.js";
import { recoverReservationExpiries } from "./Services/reservationExpiryRecoveryService.js";
import { recordReservationWorkerHeartbeat } from "./utils/workerHeartbeat.js";

let emailWorker;
let reservationWorker;
let recoveryTimer;

let shuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[Worker] Received ${signal}. Shutting down gracefully...`);
  if (recoveryTimer) clearInterval(recoveryTimer);
  // Close workers first so no new jobs are picked up.
  await Promise.all([emailWorker?.close(), reservationWorker?.close()].filter(Boolean));
  // Then close the queue producer connection
  await closeEmailQueue();
  await closeReservationExpiryQueue();
  // Finally close the shared Redis connection
  await closeRedis();
  await mongoose.disconnect();
  console.log("[Worker] Shutdown complete");
  process.exit(0);
};

const start = async () => {
  await connectDB(CONNECTION_ROLES.WORKER);
  console.log("[Worker] Starting email and reservation expiry workers...");
  emailWorker = createEmailWorker();
  reservationWorker = createReservationExpiryWorker();
  await recoverReservationExpiries();
  await recordReservationWorkerHeartbeat();
  const intervalMs = Math.max(10_000, Number(process.env.RESERVATION_RECOVERY_INTERVAL_MS) || 60_000);
  recoveryTimer = setInterval(() => {
    recoverReservationExpiries().then(recordReservationWorkerHeartbeat).catch((error) => {
      console.error(JSON.stringify({ event: "reservation_recovery_interval_failed", message: error.message }));
    });
  }, intervalMs);
  console.log("[Worker] Listening for email and reservation expiry jobs");
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("uncaughtException", (err) => {
  console.error("[Worker] Uncaught exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[Worker] Unhandled rejection:", reason);
});

start().catch((error) => {
  console.error("[Worker] Startup failed:", error);
  process.exit(1);
});
