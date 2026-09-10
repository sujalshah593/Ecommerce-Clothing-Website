import express from "express";
import passport from "passport";
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
router.get(
  "/google",
  googleAuthLimiter,
  passport.authenticate("google", { scope: ["profile", "email"] })
);



router.get(
  "/google/callback",
  googleAuthLimiter,
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error during authentication" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      const token = generateToken(user._id);
      res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
    })(req, res, next);
  }
);


export default router;
