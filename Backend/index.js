import dotenv from "dotenv";
dotenv.config({ path: new URL("./.env", import.meta.url) });

const isProduction = process.env.NODE_ENV === "production";
const requiredProductionUrls = ["FRONTEND_URL", "BACKEND_URL", "GOOGLE_CALLBACK_URL"];
const missingProductionUrls = requiredProductionUrls.filter((name) => !process.env[name]);
const insecureProductionUrls = requiredProductionUrls.filter((name) => process.env[name] && !/^https:\/\//i.test(process.env[name]));

if (isProduction && (missingProductionUrls.length || insecureProductionUrls.length)) {
  const problems = [
    missingProductionUrls.length ? `missing: ${missingProductionUrls.join(", ")}` : null,
    insecureProductionUrls.length ? `must use HTTPS: ${insecureProductionUrls.join(", ")}` : null,
  ].filter(Boolean).join("; ");
  throw new Error(`Invalid production URL configuration (${problems})`);
}

import express from "express";
import cors from "cors";
import passport from "passport";

import connectDB, { CONNECTION_ROLES } from "./Config/db.js";
import authRoutes from "./Routes/authRoutes.js";
import "./Config/passport.js";
import productRoutes from "./Routes/productRoutes.js";
import orderRoutes from "./Routes/orderRoutes.js";
import adminRoutes from "./Routes/adminRoutes.js";
import cartRoutes from "./Routes/cartRoutes.js";
import { errorHandler } from "./Middleware/errorMiddleware.js";
import helmet from "helmet";
import mongoose from "mongoose";
import { closeRedis } from "./Config/redis.js";
import { closeEmailQueue } from "./Queue/emailQueue.js";

const app = express();

// Security: Currently there is no trusted HTTP reverse proxy in the local topology.
// Explicitly disable trust proxy so an untrusted client cannot spoof their IP
// via the X-Forwarded-For header to bypass rate limits.
// IMPORTANT: Before deploying to production behind a real reverse proxy (e.g. Nginx, AWS ALB),
// you MUST configure this to explicitly trust the proxy's IP/subnet or hop count.
app.set("trust proxy", false);

// DB

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  hsts: process.env.NODE_ENV === "production",
}));
const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === frontendUrl) {
      return callback(null, true);
    }
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"]
}));
app.use("/api/orders/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/health", (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ status: "unhealthy", mongodb: "disconnected" });
  }
  res.json({ status: "ok", mongodb: "connected" });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;
let shuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`Received ${signal}. Shutting down gracefully...`);

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await closeEmailQueue();
  await closeRedis();
  await mongoose.disconnect();
  console.log("Shutdown complete");
  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

const startServer = async () => {
  await connectDB(CONNECTION_ROLES.API);
  server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`);
  });
};

startServer().catch((error) => {
  console.error("Backend startup failed:", error);
  process.exit(1);
});
