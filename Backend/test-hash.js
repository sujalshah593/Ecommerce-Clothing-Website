import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

async function run() {
  const client = await MongoClient.connect("mongodb+srv://mern:PZfCpjgWSjXJJQEB@cluster0.5cn0oid.mongodb.net/?appName=Cluster0");
  const db = client.db("test");
  const email2 = "test2_1789293944335@example.com";
  let u2 = await db.collection("users").findOne({ email: email2 });
  
  console.log("Hash in DB:", u2.password);
  
  let matchNew = await bcrypt.compare("NewPassword1!", u2.password);
  let matchOld = await bcrypt.compare("OldPassword1!", u2.password);
  console.log("Match New:", matchNew);
  console.log("Match Old:", matchOld);
  
  await client.close();
}

run();
