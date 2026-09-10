import mongoose from 'mongoose';
import User from './Models/User.js';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  await mongoose.connect(process.env.MONGO_URL);

  const testEmail = 'bugtest5@example.com';
  
  await User.deleteOne({ email: testEmail });
  const user = await User.create({ name: 'Bug Test', email: testEmail, password: 'testpassword' });
  
  console.log('Original hash:', user.password);

  // simulate verifyOtp
  const verifyUser = await User.findById(user._id);
  verifyUser.isVerified = true;
  verifyUser.otp = null;
  verifyUser.otpExpires = null;
  await verifyUser.save();
  
  console.log('Hash after verifyOtp:', verifyUser.password);
  
  if (user.password !== verifyUser.password) {
    console.log('HASH CHANGED!!! DOUBLE HASH DETECTED!!!');
  } else {
    console.log('Hash remained exactly the same.');
  }

  process.exit(0);
})();
