import dotenv from "dotenv";
dotenv.config({ path: new URL("./.env", import.meta.url) });

import express from "express";
import cors from "cors";
import passport from "passport";

import connectDB from "./Config/db.js";
import authRoutes from "./Routes/authRoutes.js";
import "./Config/passport.js"; 
import productRoutes from "./Routes/productRoutes.js"
import orderRoutes from "./Routes/orderRoutes.js"
import adminRoutes from "./Routes/adminRoutes.js"



const app = express();

// DB
connectDB();

// Middleware
app.use(cors());
app.use("/api/orders/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes); 
app.use("/api/admin", adminRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
