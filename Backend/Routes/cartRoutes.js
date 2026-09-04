import express from "express";
import { protect } from "../Middleware/authMiddleware.js";
import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  mergeCart,
} from "../Controller/cartController.js";
import { cartLimiter, userLimiter } from "../Middleware/rateLimiters.js";

const router = express.Router();

// All cart routes require authentication — ownership is enforced in each handler
router.get("/", protect, userLimiter, getCart);
router.post("/items", protect, cartLimiter, addItem);
router.patch("/items/:productId", protect, cartLimiter, updateItem);
router.delete("/items/:productId", protect, cartLimiter, removeItem);
router.post("/merge", protect, cartLimiter, mergeCart);

export default router;
