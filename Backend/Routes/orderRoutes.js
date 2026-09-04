import express from 'express';
import passport from 'passport';
import { createOrder, createPaymentOrder, getAllOrders, orderWebhook, updateOrderStatus, verifyPayment } from '../Controller/orderController.js';
import { isAdmin, protect } from '../Middleware/authMiddleware.js';
import { getMyOrders } from '../Controller/orderController.js';
import { paymentLimiter, webhookLimiter, userLimiter } from '../Middleware/rateLimiters.js';

const router = express.Router();

router.post("/", protect, paymentLimiter, createOrder);
router.post("/payment-order", protect, paymentLimiter, createPaymentOrder);
router.post("/verify-payment", protect, paymentLimiter, verifyPayment);
router.post("/webhook", webhookLimiter, orderWebhook);
router.get("/", protect, isAdmin, getAllOrders);
router.get("/my-orders", passport.authenticate("jwt", { session: false }), userLimiter, getMyOrders);
router.put(
  "/:id/status",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  updateOrderStatus
);


export default router;
