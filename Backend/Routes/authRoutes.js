import express from "express";
import passport from "passport";
import crypto from "crypto";
import { connection } from "../config/redis.js";
import { registerUser, loginUser, verifyOtp, resendOtp, changePassword,forgotPassword, resetPassowrd, addAddress, deleteAddress } from "../Controller/authController.js";
import generateToken from "../utils/generateToken.js";
import {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
  verifyOtpLimiter,
  resendOtpLimiter,
  changePasswordLimiter,
  googleAuthLimiter,
  userLimiter
} from "../Middleware/rateLimiters.js";

const router = express.Router();

/* Manual Auth */
router.post("/register", registerLimiter, registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/verify-otp", verifyOtpLimiter, verifyOtp);
router.post("/resend-otp", resendOtpLimiter, resendOtp);
router.post(
  "/change-password",
  passport.authenticate("jwt", { session: false }),
  changePasswordLimiter,
  changePassword
);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password/:resetToken", resetPasswordLimiter, resetPassowrd);
router.post("/address", passport.authenticate("jwt", {session: false }), userLimiter, addAddress)
router.delete("/address/:id", passport.authenticate("jwt", {session: false }), userLimiter, deleteAddress)

/* Google Auth */
const getCookie = (req, name) => {
  if (!req.headers.cookie) return null;
  const match = req.headers.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
};

router.get(
  "/google",
  googleAuthLimiter,
  (req, res, next) => {
    const state = crypto.randomBytes(16).toString("hex");
    res.cookie("oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 300000,
      secure: process.env.NODE_ENV === "production",
    });
    passport.authenticate("google", { scope: ["profile", "email"], state })(req, res, next);
  }
);

router.get(
  "/google/callback",
  googleAuthLimiter,
  (req, res, next) => {
    const queryState = req.query.state;
    const cookieState = getCookie(req, "oauth_state");
    res.clearCookie("oauth_state");

    if (!queryState || !cookieState || queryState.length !== cookieState.length) {
      return res.redirect(`http://localhost:5173/login?error=${encodeURIComponent("Invalid OAuth state")}`);
    }

    if (!crypto.timingSafeEqual(Buffer.from(queryState), Buffer.from(cookieState))) {
      return res.redirect(`http://localhost:5173/login?error=${encodeURIComponent("OAuth state mismatch")}`);
    }
    next();
  },
  (req, res, next) => {
    passport.authenticate("google", { session: false }, async (err, user, info) => {
      if (err) {
        return res.redirect(`http://localhost:5173/login?error=${encodeURIComponent("Internal server error during authentication")}`);
      }
      if (!user) {
        return res.redirect(`http://localhost:5173/login?error=${encodeURIComponent(info?.message || "Authentication failed")}`);
      }

      try {
        const authCode = crypto.randomBytes(32).toString("hex");
        await connection.set(`oauth_code:${authCode}`, user._id.toString(), "EX", 300);
        res.redirect(`http://localhost:5173/auth/callback?code=${authCode}`);
      } catch (error) {
        return res.redirect(`http://localhost:5173/login?error=${encodeURIComponent("Internal server error during OAuth handoff")}`);
      }
    })(req, res, next);
  }
);

router.post("/google/exchange", async (req, res) => {
  try {
    const { code } = req.body;
    if (typeof code !== "string" || code.length !== 64 || !/^[0-9a-f]{64}$/i.test(code)) {
      return res.status(400).json({ message: "Invalid authorization code format" });
    }

    const userId = await connection.getdel(`oauth_code:${code}`);
    if (!userId) {
      return res.status(401).json({ message: "Invalid or expired authorization code" });
    }

    const token = generateToken(userId);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error during token exchange" });
  }
});

export default router;
