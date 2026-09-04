import express from 'express';
import { getProducts } from '../Controller/productController.js';
import { getProductById } from '../Controller/productController.js';
import { publicLimiter } from '../Middleware/rateLimiters.js';

const router = express.Router();

router.get("/", publicLimiter, getProducts);
router.get("/:id", publicLimiter, getProductById);

export default router;