import mongoose from 'mongoose';
import User from './Models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  await mongoose.connect(process.env.MONGO_URL);
  
  const email = 'hash_test_2@example.com';
  const password = 'mytestpassword';

  await User.deleteOne({ email });

  const user = await User.create({ name: 'Test', email, password });
  console.log('Stored Hash:', user.password);

  const match1 = await bcrypt.compare(password, user.password);
  console.log('Match with original password:', match1);
  
  const doubleHash = await bcrypt.hash(password, 10);
  const match2 = await bcrypt.compare(doubleHash, user.password);
  console.log('Match with double-hashed password:', match2);

  process.exit(0);
})();
