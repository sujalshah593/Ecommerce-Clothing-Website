import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/test";
  const client = await MongoClient.connect(mongoUrl);
  const db = client.db("test");
  let u2 = await db.collection("users").findOne({ email: "test2_1789293944335@example.com" });
  console.log(u2);
  await client.close();
}
run();
