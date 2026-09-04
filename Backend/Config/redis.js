import Redis from "ioredis";

const getRedisUrl = () => {
  return process.env.REDIS_URL || "redis://127.0.0.1:6379";
};

// Single shared connection reused across queues and workers.
// maxRetriesPerRequest: null is required by BullMQ.
export const connection = new Redis(getRedisUrl(), {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    console.warn(`[Redis] Reconnecting... attempt ${times}, next in ${delay}ms`);
    return delay;
  },
});

connection.on("connect", () => console.log("[Redis] Connected"));
connection.on("error", (err) => {
  console.error("[Redis] Connection error:", err.message);
});

// Separate connection for Rate Limiting
export const rateLimitRedis = new Redis(getRedisUrl(), {
  // express-rate-limit does not need maxRetriesPerRequest: null, 0 means fail fast if down
  maxRetriesPerRequest: 0, 
  enableReadyCheck: false,
});

rateLimitRedis.on("error", (err) => {
  console.error("[RateLimitRedis] Connection error:", err.message);
});

export const closeRedis = async () => {
  try {
    if (["ready", "connecting"].includes(connection.status)) {
      await connection.quit();
      console.log("[Redis] Connection closed gracefully");
    }
    if (["ready", "connecting"].includes(rateLimitRedis.status)) {
      await rateLimitRedis.quit();
      console.log("[RateLimitRedis] Connection closed gracefully");
    }
  } catch (err) {
    console.error("[Redis] Error during shutdown:", err.message);
  }
};
