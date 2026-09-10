import mongoose from 'mongoose';
import User from './Models/User.js';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  await mongoose.connect(process.env.MONGO_URL);

  const email = 'checkdb@example.com';
  
  const u = await User.findOne({ email });
  if (u) console.log('User found in DB');
  else console.log('User not found');

  process.exit(0);
})();
