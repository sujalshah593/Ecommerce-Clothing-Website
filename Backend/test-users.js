import mongoose from 'mongoose';
import User from './Models/User.js';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  await mongoose.connect(process.env.MONGO_URL);

  const users = await User.find().sort({ createdAt: -1 }).limit(1);
  console.log(users[0].toObject());

  process.exit(0);
})();
