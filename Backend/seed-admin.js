import "dotenv/config";
import mongoose from "mongoose";
import User from "./Models/User.js";
import connectDB from "./Config/db.js";

const email = (process.env.ADMIN_EMAIL || "admin@example.com").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "adminpassword123";
const name = process.env.ADMIN_NAME || "Admin";

if (!email || !password) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must not be empty");
}

try {
  await connectDB();

  let admin = await User.findOne({ email });

  if (!admin) {
    admin = new User({ email });
  }

  // Setting password before save lets the User model hash it via its pre-save hook.
  admin.name = name;
  admin.password = password;
  admin.isAdmin = true;
  admin.isVerified = true;
  admin.otp = undefined;
  admin.otpExpires = undefined;
  admin.resetPasswordToken = undefined;
  admin.resetPasswordExpire = undefined;

  await admin.save();

  console.log(`Admin account ready: ${email}`);
  console.log("Use ADMIN_PASSWORD (or the development default) to log in.");
} catch (error) {
  console.error(`Failed to seed admin: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
