import mongoose from "mongoose";
import User from "./Models/User.js";
import dotenv from "dotenv";

dotenv.config();

async function runTest() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecommerce");
  
  const testEmail = "test_audit2@example.com";
  await User.deleteOne({ email: testEmail });
  
  console.log("Creating user (Registration)...");
  const user = await User.create({ name: "Test", email: testEmail, password: "Password123!" });
  const origHash = user.password;
  console.log("Original Hash looks valid:", origHash.startsWith("$2a$") || origHash.startsWith("$2b$"));
  
  console.log("Simulating Login before OTP verification...");
  const loginUser = await User.findOne({ email: testEmail });
  loginUser.otp = "123456";
  loginUser.otpExpires = Date.now() + 10000;
  await loginUser.save(); // THIS is what loginUser does!
  
  console.log("Simulating OTP verification...");
  const verifyUser = await User.findById(loginUser._id);
  verifyUser.isVerified = true;
  verifyUser.otp = null;
  verifyUser.otpExpires = null;
  await verifyUser.save();
  
  const finalUser = await User.findById(loginUser._id);
  console.log("Final Hash looks valid:", finalUser.password.startsWith("$2a$") || finalUser.password.startsWith("$2b$"));
  console.log("Hash matches original hash?", finalUser.password === origHash);
  
  const matches = await finalUser.matchPassword("Password123!");
  console.log("Password matches expected?", matches);
  
  await mongoose.disconnect();
}
runTest().catch(console.error);
