import dotenv from "dotenv";
dotenv.config({ path: new URL("./.env", import.meta.url) });

import { createEmailWorker } from "./Queue/emailWorker.js";
import { closeRedis } from "./Config/redis.js";
import { closeEmailQueue } from "./Queue/emailQueue.js";

console.log("[Worker] Starting email worker process...");
const worker = createEmailWorker();
console.log("[Worker] Listening for jobs on emailQueue");

let shuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[Worker] Received ${signal}. Shutting down gracefully...`);
  // Close the worker first so no new jobs are picked up
  await worker.close();
  // Then close the queue producer connection
  await closeEmailQueue();
  // Finally close the shared Redis connection
  await closeRedis();
  console.log("[Worker] Shutdown complete");
  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("uncaughtException", (err) => {
  console.error("[Worker] Uncaught exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[Worker] Unhandled rejection:", reason);
});
