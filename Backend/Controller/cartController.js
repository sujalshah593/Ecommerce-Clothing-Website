import mongoose from "mongoose";
import Cart, { MAX_QTY } from "../Models/Cart.js";
import Product from "../Models/Product.js";

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Build the safe cart response — populate product info from DB so the
 * frontend never has to trust stale client-side price/name/image.
 */
const buildCartResponse = async (cart) => {
  await cart.populate("items.product", "name image price countInStock sizes");

  const items = cart.items
    .filter((item) => item.product) // drop orphaned refs
    .map((item) => ({
      _id: item.product._id,
      name: item.product.name,
      image: item.product.image,
      price: item.product.price,
      countInStock: item.product.countInStock,
      sizes: item.product.sizes,
      size: item.size,
      qty: item.qty,
    }));

  return { items };
};

const handleError = (res, error, fallback) => {
  console.error(`[cartController] ${fallback}:`, error);
  res
    .status(error.status || 500)
    .json({ message: error.status ? error.message : fallback });
};

const badRequest = (message) => {
  const e = new Error(message);
  e.status = 400;
  return e;
};

// ─── GET /api/cart ───────────────────────────────────────────────────────────

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.json({ items: [] });
    }

    res.json(await buildCartResponse(cart));
  } catch (error) {
    handleError(res, error, "Failed to fetch cart");
  }
};

// ─── POST /api/cart/items ────────────────────────────────────────────────────

export const addItem = async (req, res) => {
  try {
    const { productId, size = "", qty = 1 } = req.body;

    // Validate input
    if (!mongoose.isValidObjectId(productId)) throw badRequest("Invalid product ID");
    const parsedQty = parseInt(qty, 10);
    if (!Number.isInteger(parsedQty) || parsedQty < 1)
      throw badRequest("Quantity must be a positive integer");

    // Verify product exists in DB — never trust client name/price/image
    const product = await Product.findById(productId);
    if (!product) {
      const e = new Error("Product not found");
      e.status = 404;
      throw e;
    }

    const normalizedSize = String(size || "").trim();

    // Find existing cart or create one, then atomically update
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // First item — create cart
      const cappedQty = Math.min(parsedQty, MAX_QTY);
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: product._id, size: normalizedSize, qty: cappedQty }],
      });
    } else {
      // Find whether this product+size already exists
      const existingIndex = cart.items.findIndex(
        (item) =>
          item.product.toString() === product._id.toString() &&
          item.size === normalizedSize
      );

      if (existingIndex >= 0) {
        // Cap combined qty at MAX_QTY
        const newQty = Math.min(cart.items[existingIndex].qty + parsedQty, MAX_QTY);
        cart.items[existingIndex].qty = newQty;
      } else {
        cart.items.push({
          product: product._id,
          size: normalizedSize,
          qty: Math.min(parsedQty, MAX_QTY),
        });
      }
      await cart.save();
    }

    res.status(201).json(await buildCartResponse(cart));
  } catch (error) {
    handleError(res, error, "Failed to add item to cart");
  }
};

// ─── PATCH /api/cart/items/:productId ────────────────────────────────────────

export const updateItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { qty, size = "" } = req.body;

    if (!mongoose.isValidObjectId(productId)) throw badRequest("Invalid product ID");
    const parsedQty = parseInt(qty, 10);
    if (!Number.isInteger(parsedQty) || parsedQty < 1 || parsedQty > MAX_QTY)
      throw badRequest(`Quantity must be between 1 and ${MAX_QTY}`);

    // Ensure product still exists
    const product = await Product.findById(productId);
    if (!product) {
      const e = new Error("Product not found");
      e.status = 404;
      throw e;
    }

    const normalizedSize = String(size || "").trim();

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      const e = new Error("Cart not found");
      e.status = 404;
      throw e;
    }

    const item = cart.items.find(
      (i) =>
        i.product.toString() === productId &&
        i.size === normalizedSize
    );

    if (!item) {
      const e = new Error("Item not in cart");
      e.status = 404;
      throw e;
    }

    item.qty = parsedQty;
    await cart.save();

    res.json(await buildCartResponse(cart));
  } catch (error) {
    handleError(res, error, "Failed to update cart item");
  }
};

// ─── DELETE /api/cart/items/:productId ───────────────────────────────────────

export const removeItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { size = "" } = req.query; // pass size as ?size=M

    if (!mongoose.isValidObjectId(productId)) throw badRequest("Invalid product ID");

    const normalizedSize = String(size || "").trim();

    // Atomic pull — does not overwrite concurrent changes to other items
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      {
        $pull: {
          items: { product: new mongoose.Types.ObjectId(productId), size: normalizedSize },
        },
      },
      { new: true }
    );

    if (!cart) {
      return res.json({ items: [] });
    }

    res.json(await buildCartResponse(cart));
  } catch (error) {
    handleError(res, error, "Failed to remove cart item");
  }
};

// ─── POST /api/cart/merge ─────────────────────────────────────────────────────
/**
 * Merge rule:
 *   - For each guest item, validate product exists.
 *   - If same product+size exists in server cart: combined = min(serverQty + guestQty, MAX_QTY).
 *   - If only in guest cart: add with qty = min(guestQty, MAX_QTY).
 *   - Invalid products are silently skipped (not trusted).
 *   - Client-provided price/name/image is ignored entirely.
 */
export const mergeCart = async (req, res) => {
  try {
    const { items: guestItems } = req.body;

    if (!Array.isArray(guestItems)) {
      // Nothing to merge — just return existing server cart
      const existing = await Cart.findOne({ user: req.user._id });
      if (!existing) return res.json({ items: [] });
      return res.json(await buildCartResponse(existing));
    }

    // Validate and normalize guest items — reject malformed entries
    const validatedGuest = [];
    for (const item of guestItems) {
      const { productId, size = "", qty } = item;
      if (!mongoose.isValidObjectId(productId)) continue; // skip invalid
      const parsedQty = parseInt(qty, 10);
      if (!Number.isInteger(parsedQty) || parsedQty < 1) continue;
      validatedGuest.push({
        productId: productId.toString(),
        size: String(size || "").trim(),
        qty: parsedQty,
      });
    }

    if (validatedGuest.length === 0) {
      // No valid guest items — return existing server cart as-is
      const existing = await Cart.findOne({ user: req.user._id });
      if (!existing) return res.json({ items: [] });
      return res.json(await buildCartResponse(existing));
    }

    // Verify all guest product IDs exist in DB in one query
    const guestProductIds = [...new Set(validatedGuest.map((i) => i.productId))];
    const products = await Product.find({ _id: { $in: guestProductIds } });
    const productSet = new Set(products.map((p) => p._id.toString()));

    // Load or create server cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Build a mutable map of server items keyed by productId+size
    const serverMap = new Map();
    for (const item of cart.items) {
      const key = `${item.product.toString()}::${item.size}`;
      serverMap.set(key, item);
    }

    // Merge guest items
    for (const guest of validatedGuest) {
      if (!productSet.has(guest.productId)) continue; // product doesn't exist — skip

      const key = `${guest.productId}::${guest.size}`;
      if (serverMap.has(key)) {
        const serverItem = serverMap.get(key);
        serverItem.qty = Math.min(serverItem.qty + guest.qty, MAX_QTY);
      } else {
        cart.items.push({
          product: new mongoose.Types.ObjectId(guest.productId),
          size: guest.size,
          qty: Math.min(guest.qty, MAX_QTY),
        });
        // Add to map so duplicates in guest list are handled
        const newItem = cart.items[cart.items.length - 1];
        serverMap.set(key, newItem);
      }
    }

    await cart.save();
    res.json(await buildCartResponse(cart));
  } catch (error) {
    handleError(res, error, "Failed to merge cart");
  }
};
