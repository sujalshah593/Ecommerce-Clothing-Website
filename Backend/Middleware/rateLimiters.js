import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { rateLimitRedis } from "../Config/redis.js";

/**
 * Each limiter gets its own Redis key namespace via `prefix`.
 * Without unique prefixes all limiters share one counter — causing
 * the auth limit to bleed into product requests, etc.
 */
const createStore = (prefix) =>
  new RedisStore({
    prefix: `rl:${prefix}:`,
    sendCommand: (...args) => rateLimitRedis.call(...args),
  });

const defaultOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true, // Fail open if Redis is temporarily unavailable
};

/* ------------------------------------------------------------------
   AUTH — IP-based, strict
------------------------------------------------------------------ */

/** POST /api/auth/login — 10 requests / 15 min / IP */
const rawLoginLimiter = rateLimit({
  ...defaultOptions,
  passOnStoreError: false,
  store: createStore("login"),
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { message: "Too many login attempts, please try again after 15 minutes" },
});

export const loginLimiter = (req, res, next) => {
  rawLoginLimiter(req, res, (err) => {
    if (err) {
      return res.status(503).json({ message: "Authentication service temporarily unavailable. Please try again later." });
    }
    next();
  });
};

/** POST /api/auth/register — 10 requests / 1 hour / IP */
export const registerLimiter = rateLimit({
  ...defaultOptions,
  store: createStore("register"),
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: { message: "Too many accounts created from this IP, please try again after an hour" },
});

/** POST /api/auth/forgot-password — 5 requests / 1 hour / IP */
export const forgotPasswordLimiter = rateLimit({
  ...defaultOptions,
  store: createStore("forgot-pwd"),
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: { message: "Too many password reset requests from this IP, please try again after an hour" },
});

/** POST /api/auth/reset-password/:token — 10 requests / 1 hour / IP */
export const resetPasswordLimiter = rateLimit({
  ...defaultOptions,
  store: createStore("reset-pwd"),
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: { message: "Too many password reset attempts, please try again after an hour" },
});

/** POST /api/auth/verify-otp — 10 requests / 15 min / IP */
export const verifyOtpLimiter = rateLimit({
  ...defaultOptions,
  store: createStore("verify-otp"),
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { message: "Too many OTP verification attempts, please try again after 15 minutes" },
});

/** POST /api/auth/resend-otp — 5 requests / 15 min / IP */
export const resendOtpLimiter = rateLimit({
  ...defaultOptions,
  store: createStore("resend-otp"),
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: { message: "Too many OTP resend requests, please try again after 15 minutes" },
});

/** POST /api/auth/change-password — 10 requests / 15 min / user */
export const changePasswordLimiter = rateLimit({
  ...defaultOptions,
  store: createStore("change-pwd"),
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: (req) => (req.user ? req.user._id.toString() : req.ip),
  message: { message: "Too many change password requests, please try again after 15 minutes" },
});

/** GET /api/auth/google — 10 requests / 1 min / IP */
export const googleAuthLimiter = rateLimit({
  ...defaultOptions,
  store: createStore("google-auth"),
  windowMs: 60 * 1000,
  limit: 10,
  message: { message: "Too many Google Auth redirects, please try again later" },
});

/* ------------------------------------------------------------------
   PAYMENT — user-aware (falls back to IP if unauthenticated)
------------------------------------------------------------------ */

const byUser = (req) => (req.user ? req.user._id.toString() : req.ip);

/** POST /api/orders, /payment-order, /verify-payment — 20 / 15 min / user */
export const paymentLimiter = rateLimit({
  ...defaultOptions,
  store: createStore("payment"),
  windowMs: 15 * 60 * 1000,
  limit: 20,
  keyGenerator: byUser,
  message: { message: "Too many payment requests, please try again later" },
});

/* ------------------------------------------------------------------
   WEBHOOK — IP-based, burst-tolerant
   Razorpay can deliver a burst of events; keep this generous.
   HMAC signature is the real security gate.
------------------------------------------------------------------ */

/** POST /api/orders/webhook — 100 / 1 min / IP */
export const webhookLimiter = rateLimit({
  ...defaultOptions,
  store: createStore("webhook"),
  windowMs: 60 * 1000,
  limit: 100,
  message: { message: "Too many webhook requests" },
});

/* ------------------------------------------------------------------
   PUBLIC — IP-based, generous (storefront must not go down)
------------------------------------------------------------------ */

/** GET /api/products, /api/products/:id — 120 / 1 min / IP */
export const publicLimiter = rateLimit({
  ...defaultOptions,
  store: createStore("public-product"),
  windowMs: 60 * 1000,
  limit: 120,
  message: { message: "Too many requests, please try again later" },
});

/* ------------------------------------------------------------------
   USER — user-aware, moderate reads / writes
------------------------------------------------------------------ */

/** General authenticated reads — 120 / 1 min / user */
export const userLimiter = rateLimit({
  ...defaultOptions,
  store: createStore("user-read"),
  windowMs: 60 * 1000,
  limit: 120,
  keyGenerator: byUser,
  message: { message: "Too many requests, please try again later" },
});

/** Cart mutations — 60 / 1 min / user */
export const cartLimiter = rateLimit({
  ...defaultOptions,
  store: createStore("cart-mutation"),
  windowMs: 60 * 1000,
  limit: 60,
  keyGenerator: byUser,
  message: { message: "Too many cart mutations, please try again later" },
});

/* ------------------------------------------------------------------
   ADMIN — user-aware, moderate
------------------------------------------------------------------ */

/** All /api/admin/* — 60 / 1 min / user */
export const adminLimiter = rateLimit({
  ...defaultOptions,
  store: createStore("admin"),
  windowMs: 60 * 1000,
  limit: 60,
  keyGenerator: byUser,
  message: { message: "Too many admin requests, please try again later" },
});
