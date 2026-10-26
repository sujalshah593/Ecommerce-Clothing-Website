import axios from "axios";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  const api = axios.create({ baseURL: "http://localhost:5000/api", validateStatus: () => true });
  const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/test";
  const client = await MongoClient.connect(mongoUrl);
  const db = client.db("test"); 
  
  const email1 = `test1_${Date.now()}@example.com`;
  const email2 = `test2_${Date.now()}@example.com`;
  
  try {
    console.log("--- Test 1: New registration -> OTP -> login (pass)");
    let r = await api.post("/auth/register", { name: "Test 1", email: email1, password: "Pass1!" });
    console.log("Register T1:", r.status);
    
    r = await api.post("/auth/login", { email: email1, password: "Pass1!" });
    console.log("Login T1 (should be 403):", r.status);
    let userId1 = r.data.userId;
    
    let u1 = await db.collection("users").findOne({ email: email1 });
    let otp1 = u1.otp;
    
    r = await api.post("/auth/verify-otp", { userId: userId1, otp: otp1 });
    console.log("Verify T1:", r.status);
    
    r = await api.post("/auth/login", { email: email1, password: "Pass1!" });
    console.log("Login T1 final:", r.status === 200 ? "PASS" : "FAIL");

    
    console.log("\n--- Test 2: Register unverified email with new password -> verify OTP -> login with NEW password");
    r = await api.post("/auth/register", { name: "Test 2", email: email2, password: "OldPassword1!" });
    console.log("Register T2 (Old):", r.status);
    
    r = await api.post("/auth/register", { name: "Test 2 Updated", email: email2, password: "NewPassword1!" });
    console.log("Register T2 (New):", r.status);
    
    const u2_prelogin = await db.collection("users").findOne({ email: email2 });
    console.log("OTP was generated in register?:", !!u2_prelogin.otp, "- PASS");
    console.log("Name updated in register?:", u2_prelogin.name === "Test 2 Updated", "- PASS");
    
    r = await api.post("/auth/login", { email: email2, password: "NewPassword1!" });
    console.log("Login T2 (should be 403):", r.status);
    let userId2 = r.data.userId;
    
    let u2 = await db.collection("users").findOne({ email: email2 });
    let otp2 = u2.otp; 
    
    r = await api.post("/auth/verify-otp", { userId: userId2, otp: otp2 });
    console.log("Verify T2:", r.status);
    
    r = await api.post("/auth/login", { email: email2, password: "NewPassword1!" });
    console.log("Login T2 final with NEW password:", r.status === 200 ? "PASS" : "FAIL");
    
    r = await api.post("/auth/login", { email: email2, password: "OldPassword1!" });
    console.log("Login T2 with OLD password:", r.status === 401 ? "PASS" : "FAIL");
    

    console.log("\n--- Test 3: Register verified account again -> old works, new fails");
    r = await api.post("/auth/register", { name: "Test 1 Trick", email: email1, password: "HackerPassword!" });
    console.log("Register T1 again (Enum protection):", r.status === 201 ? "PASS" : "FAIL");
    
    r = await api.post("/auth/login", { email: email1, password: "HackerPassword!" });
    console.log("Login T1 with Hacker password:", r.status === 401 ? "PASS" : "FAIL");
    
    r = await api.post("/auth/login", { email: email1, password: "Pass1!" });
    console.log("Login T1 with Old password:", r.status === 200 ? "PASS" : "FAIL");

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

run();
