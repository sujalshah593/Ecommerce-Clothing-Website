import axios from "axios";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  const api = axios.create({ baseURL: "http://localhost:5000/api", validateStatus: () => true });
  
  try {
    console.log("--- Testing Invalid State ---");
    let res = await api.get("/auth/google/callback?state=invalid");
    console.log("Invalid State Status:", res.status); // Expect 403

    console.log("\n--- Testing Invalid Code Exchange ---");
    res = await api.post("/auth/google/exchange", { code: "invalid_code_which_is_wrong" });
    console.log("Invalid Code Length Status:", res.status); // Expect 400

    res = await api.post("/auth/google/exchange", { code: "a".repeat(64) });
    console.log("Valid length, invalid code Status:", res.status); // Expect 401

    // Simulate an OAuth redirect directly into DB to test valid code
    const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/test";
    const client = await MongoClient.connect(mongoUrl);
    const db = client.db("test");
    const user = await db.collection("users").findOne();
    const userId = user._id.toString();
    
    // Inject into redis
    const Redis = (await import("ioredis")).default;
    const redis = new Redis("redis://127.0.0.1:6379");
    const fakeCode = "b".repeat(64);
    await redis.set(`oauth_code:${fakeCode}`, userId, "EX", 300);
    
    console.log("\n--- Testing Valid Code Exchange ---");
    res = await api.post("/auth/google/exchange", { code: fakeCode });
    console.log("Valid Code Exchange Status:", res.status); // Expect 200
    console.log("Has token?", !!res.data.token);

    console.log("\n--- Testing Reused Code Exchange ---");
    res = await api.post("/auth/google/exchange", { code: fakeCode });
    console.log("Reused Code Status:", res.status); // Expect 401
    
    await redis.quit();
    await client.close();

  } catch (e) {
    console.error(e);
  }
}

run();
