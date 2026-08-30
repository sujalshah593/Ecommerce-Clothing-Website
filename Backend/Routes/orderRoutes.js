import express from 'express';
import passport from 'passport';
import { createOrder, createPaymentOrder, getAllOrders, orderWebhook, updateOrderStatus, verifyPayment } from '../Controller/orderController.js';
import { isAdmin, protect } from '../Middleware/authMiddleware.js';
import { getMyOrders } from '../Controller/orderController.js';

const router = express.Router();

router.post("/", protect, createOrder);
router.post("/payment-order", protect, createPaymentOrder);
router.post("/verify-payment", protect, verifyPayment);
router.post("/webhook", orderWebhook);
router.get("/", protect, isAdmin, getAllOrders);
router.get("/my-orders", passport.authenticate("jwt", { session: false }), getMyOrders);
router.put(
  "/:id/status",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  updateOrderStatus
);


export default router;
