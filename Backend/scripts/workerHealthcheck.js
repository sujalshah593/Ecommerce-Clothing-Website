import dotenv from "dotenv";
dotenv.config({ path: new URL("../.env", import.meta.url) });

import mongoose from "mongoose";
import Redis from "ioredis";
import { verifyWorkerHealth } from "../Services/workerHealthService.js";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
let redis;

try {
  await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 5000 });
  redis = new Redis(redisUrl, { maxRetriesPerRequest: 0, connectTimeout: 5000, enableReadyCheck: false });
  await verifyWorkerHealth({ mongoAdmin: mongoose.connection.db.admin(), redis });
  console.log("worker dependencies and reservation recovery heartbeat are healthy");
} catch (error) {
  console.error(`worker health check failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (redis) await redis.quit();
  await mongoose.disconnect();
}
