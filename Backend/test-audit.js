import mongoose from "mongoose";
import User from "./Models/User.js";
import dotenv from "dotenv";

dotenv.config();

async function runTest() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecommerce");
  
  const testEmail = "test_audit123@example.com";
  await User.deleteOne({ email: testEmail });
  
  console.log("Creating user...");
  const user = await User.create({ name: "Test", email: testEmail, password: "Password123!" });
  console.log("Original Hash looks valid:", user.password.startsWith("$2a$") || user.password.startsWith("$2b$"));
  const origHash = user.password;
  
  console.log("Simulating OTP verification...");
  const foundUser = await User.findById(user._id);
  foundUser.isVerified = true;
  foundUser.otp = null;
  foundUser.otpExpires = null;
  await foundUser.save();
  
  const finalUser = await User.findById(user._id);
  console.log("Final Hash looks valid:", finalUser.password.startsWith("$2a$") || finalUser.password.startsWith("$2b$"));
  console.log("Hash matches original hash?", finalUser.password === origHash);
  
  const matches = await finalUser.matchPassword("Password123!");
  console.log("Password matches expected?", matches);
  
  await mongoose.disconnect();
}
runTest().catch(console.error);
