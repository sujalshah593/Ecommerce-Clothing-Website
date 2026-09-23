import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import User from "./Models/User.js";

async function run() {
  await mongoose.connect(process.env.MONGO_URL);
  const api = axios.create({ baseURL: "http://localhost:5000/api" });
  const email = `test_${Date.now()}@example.com`;
  const password = "Password123!";
  
  try {
    console.log("1. Registering");
    await api.post("/auth/register", { name: "Test", email, password });
    
    console.log("2. Logging in before OTP");
    let userId;
    try {
      await api.post("/auth/login", { email, password });
    } catch (e) {
      console.log("Login failed as expected:", e.response.status);
      userId = e.response.data.userId;
    }
    
    console.log("3. Fetching OTP from DB");
    const user = await User.findById(userId);
    const otp = user.otp;
    console.log("OTP:", otp);
    
    console.log("4. Verifying OTP");
    await api.post("/auth/verify-otp", { userId, otp });
    
    console.log("5. Logging in after OTP");
    const res = await api.post("/auth/login", { email, password });
    console.log("Login success:", res.data.email);
    
  } catch (e) {
    console.error("Error:", e.response ? e.response.data : e.message);
  } finally {
    await mongoose.disconnect();
  }
}
run();
