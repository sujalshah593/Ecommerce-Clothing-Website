import mongoose from 'mongoose';
import User from './Models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const originalHash = bcrypt.hash;
bcrypt.hash = async function(data, salt) {
  console.log(`[BCRYPT HASH CALLED] Data: "${data}", Salt: ${salt}`);
  return originalHash.call(this, data, salt);
};

(async () => {
  await mongoose.connect(process.env.MONGO_URL);
  
  const email = 'hash_test_' + Date.now() + '@example.com';
  const password = 'mytestpassword';

  console.log('1. User.create()');
  const user = await User.create({ name: 'Test', email, password });

  console.log('\n2. User.findOne() & user.save() [like loginUser]');
  const loginUser = await User.findOne({ email });
  loginUser.otp = '123456';
  loginUser.otpExpires = Date.now() + 10000;
  await loginUser.save();

  console.log('\n3. User.findById() & user.save() [like verifyOtp]');
  const verifyUser = await User.findById(user._id);
  verifyUser.isVerified = true;
  verifyUser.otp = null;
  verifyUser.otpExpires = null;
  await verifyUser.save();

  console.log('\n4. matchPassword');
  const match = await verifyUser.matchPassword(password);
  console.log('Match:', match);

  process.exit(0);
})();
