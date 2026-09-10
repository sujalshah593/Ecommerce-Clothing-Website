import axios from 'axios';
import mongoose from 'mongoose';
import User from './Models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const baseURL = 'http://localhost:5000/api/auth';

(async () => {
  await mongoose.connect(process.env.MONGO_URL);

  const email = 'flowtest@example.com';
  const password = 'mytestpassword';

  await User.deleteOne({ email });

  console.log('1. Registering user...');
  await axios.post(`${baseURL}/register`, { name: 'Flow Test', email, password });

  console.log('2. Logging in before verify...');
  let userId;
  try {
    await axios.post(`${baseURL}/login`, { email, password });
  } catch (err) {
    if (err.response?.status === 403 && err.response?.data?.requiresOtp) {
      console.log('Got 403 requiresOtp correctly');
      userId = err.response.data.userId;
    } else {
      console.error('Failed to get 403 requiresOtp');
      process.exit(1);
    }
  }

  // Get OTP from DB
  const user = await User.findById(userId);
  const otp = user.otp;
  console.log('Retrieved OTP:', otp);

  console.log('3. Verifying OTP...');
  await axios.post(`${baseURL}/verify-otp`, { userId, otp });
  console.log('OTP Verified successfully');

  console.log('4. Logging in after verify...');
  try {
    const res = await axios.post(`${baseURL}/login`, { email, password });
    console.log('Login success! Token:', !!res.data.token);
  } catch (err) {
    console.error('Login failed! Status:', err.response?.status, err.response?.data);
  }

  process.exit(0);
})();
