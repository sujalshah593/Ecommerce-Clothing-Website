import dotenv from "dotenv";
dotenv.config({ path: new URL("./.env", import.meta.url) });

import express from "express";
import cors from "cors";
import passport from "passport";

import connectDB from "./Config/db.js";
import authRoutes from "./Routes/authRoutes.js";
import "./Config/passport.js";
import productRoutes from "./Routes/productRoutes.js";
import orderRoutes from "./Routes/orderRoutes.js";
import adminRoutes from "./Routes/adminRoutes.js";
import cartRoutes from "./Routes/cartRoutes.js";
import { errorHandler } from "./Middleware/errorMiddleware.js";
import helmet from "helmet";

const app = express();

// Security: Currently there is no trusted HTTP reverse proxy in the local topology.
// Explicitly disable trust proxy so an untrusted client cannot spoof their IP
// via the X-Forwarded-For header to bypass rate limits.
// IMPORTANT: Before deploying to production behind a real reverse proxy (e.g. Nginx, AWS ALB),
// you MUST configure this to explicitly trust the proxy's IP/subnet or hop count.
app.set("trust proxy", false);

// DB
connectDB();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  hsts: process.env.NODE_ENV === "production",
}));
app.use(cors());
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

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
