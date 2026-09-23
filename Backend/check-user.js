import { MongoClient } from "mongodb";
async function run() {
  const client = await MongoClient.connect("mongodb+srv://mern:PZfCpjgWSjXJJQEB@cluster0.5cn0oid.mongodb.net/?appName=Cluster0");
  const db = client.db("test");
  let u2 = await db.collection("users").findOne({ email: "test2_1789293944335@example.com" });
  console.log(u2);
  await client.close();
}
run();
