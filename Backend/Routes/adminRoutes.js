import express from 'express';
import { protect, isAdmin } from '../Middleware/authMiddleware.js';
import {
    getAllOrders,
    getAllUsers,
    getAllProducts,
    updateOrderStatus,
    deleteProduct,
    updateProduct,
    getDashboardStats
} from '../Controller/adminController.js';
import { adminLimiter } from '../Middleware/rateLimiters.js';
import { createProduct } from "../Controller/adminController.js";

const router = express.Router();

router.use(adminLimiter);

router.get("/dashboard", protect, isAdmin, getDashboardStats);
router.post("/products", protect, isAdmin, createProduct);
router.get("/orders", protect, isAdmin, getAllOrders);
router.get("/users", protect, isAdmin, getAllUsers);
router.get("/products", protect, isAdmin, getAllProducts);
router.put("/orders/:id", protect, isAdmin, updateOrderStatus);
router.put("/products/:id", protect, isAdmin, updateProduct);
router.delete("/products/:id", protect, isAdmin, deleteProduct);

export default router;