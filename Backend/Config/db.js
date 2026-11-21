import mongoose from "mongoose";

const CONNECTION_ROLES = Object.freeze({ API: "api", WORKER: "worker" });
const DEFAULT_MAX_POOL_SIZE = Object.freeze({
  [CONNECTION_ROLES.API]: 30,
  [CONNECTION_ROLES.WORKER]: 15,
});
const DEFAULT_MAX_IDLE_TIME_MS = 60_000;
const DEFAULT_WAIT_QUEUE_TIMEOUT_MS = 10_000;

const positiveIntegerFromEnv = (name, fallback) => {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
};

export const getMongoConnectionOptions = (role = CONNECTION_ROLES.API) => {
  const normalizedRole = role === CONNECTION_ROLES.WORKER
    ? CONNECTION_ROLES.WORKER
    : CONNECTION_ROLES.API;
  const poolVariable = normalizedRole === CONNECTION_ROLES.WORKER
    ? "MONGO_WORKER_MAX_POOL_SIZE"
    : "MONGO_API_MAX_POOL_SIZE";

  return {
    maxPoolSize: positiveIntegerFromEnv(poolVariable, DEFAULT_MAX_POOL_SIZE[normalizedRole]),
    minPoolSize: 0,
    maxIdleTimeMS: positiveIntegerFromEnv("MONGO_MAX_IDLE_TIME_MS", DEFAULT_MAX_IDLE_TIME_MS),
    waitQueueTimeoutMS: positiveIntegerFromEnv("MONGO_WAIT_QUEUE_TIMEOUT_MS", DEFAULT_WAIT_QUEUE_TIMEOUT_MS),
  };
};

let lifecycleLoggingRegistered = false;

const registerLifecycleLogging = () => {
  if (lifecycleLoggingRegistered) return;
  lifecycleLoggingRegistered = true;

  mongoose.connection.on("connected", () => console.info("[MongoDB] Connected"));
  mongoose.connection.on("disconnected", () => console.warn("[MongoDB] Disconnected"));
  mongoose.connection.on("reconnected", () => console.info("[MongoDB] Reconnected"));
  mongoose.connection.on("error", (error) => console.error("[MongoDB] Connection error", { type: error.name }));
};

const connectDB = async (role = CONNECTION_ROLES.API) => {
  try {
    registerLifecycleLogging();
    await mongoose.connect(process.env.MONGO_URL, getMongoConnectionOptions(role));
  } catch (err) {
    console.error("[MongoDB] Initial connection failed", { type: err.name });
    process.exit(1);
  }
};

export { CONNECTION_ROLES };
export default connectDB;
