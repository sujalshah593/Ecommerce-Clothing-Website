import axios from "axios";
import { MongoClient } from "mongodb";

async function run() {
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
    const client = await MongoClient.connect("mongodb://127.0.0.1:27017");
    const db = client.db("ecommerce");
    const user = await db.collection("users").findOne({ email });
    const otp = user.otp;
    console.log("OTP:", otp);
    
    console.log("4. Verifying OTP");
    await api.post("/auth/verify-otp", { userId, otp });
    
    console.log("5. Logging in after OTP");
    const res = await api.post("/auth/login", { email, password });
    console.log("Login success:", res.data.email);
    
    client.close();
  } catch (e) {
    console.error("Error:", e.response ? e.response.data : e.message);
  }
}
run();
