import axios from "axios";
import { MongoClient } from "mongodb";

async function run() {
  const api = axios.create({ baseURL: "http://localhost:5000/api", validateStatus: () => true });
  const email2 = `test2_${Date.now()}@example.com`;
  
  try {
    let r = await api.post("/auth/register", { name: "Test 2", email: email2, password: "OldPassword1!" });
    console.log("Register T2 (Old):", r.status);
    
    r = await api.post("/auth/register", { name: "Test 2 Updated", email: email2, password: "NewPassword1!" });
    console.log("Register T2 (New):", r.status);
    
    r = await api.post("/auth/login", { email: email2, password: "NewPassword1!" });
    console.log("Login T2 (should be 403):", r.status, r.data);
    let userId2 = r.data.userId;
    
    // We can just use the DB to fetch OTP
    const client = await MongoClient.connect("mongodb+srv://mern:PZfCpjgWSjXJJQEB@cluster0.5cn0oid.mongodb.net/?appName=Cluster0");
    const db = client.db("test");
    let u2 = await db.collection("users").findOne({ email: email2 });
    let otp2 = u2.otp; 
    console.log("OTP:", otp2);
    
    r = await api.post("/auth/verify-otp", { userId: userId2, otp: otp2 });
    console.log("Verify T2:", r.status, r.data);
    
    r = await api.post("/auth/login", { email: email2, password: "NewPassword1!" });
    console.log("Login T2 final with NEW password:", r.status, r.data);
    
    await client.close();
  } catch (e) {
    console.error(e);
  }
}

run();
