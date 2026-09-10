import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  const baseURL = 'http://localhost:5000/api/auth';
  const email = 'real_test_' + Date.now() + '@example.com';
  const password = 'mytestpassword';

  console.log(`Testing with email: ${email}`);

  // 1. Register
  try {
    await axios.post(`${baseURL}/register`, {
      name: 'Real Test',
      email,
      password
    });
    console.log('1. Registration succeeded');
  } catch (err) {
    console.log('1. Registration failed', err.response?.data);
    process.exit(1);
  }

  // 2. Login before verify
  let userId;
  try {
    await axios.post(`${baseURL}/login`, { email, password });
    console.log('2. Login unexpectedly succeeded before verify!');
    process.exit(1);
  } catch (err) {
    if (err.response?.status === 403 && err.response?.data?.requiresOtp) {
      console.log('2. Got 403 requiresOtp correctly');
      userId = err.response.data.userId;
    } else {
      console.log('2. Login failed unexpectedly', err.response?.status, err.response?.data);
      process.exit(1);
    }
  }

  // 3. Verify OTP (Fetch OTP from DB since we don't have the email)
  await mongoose.connect(process.env.MONGO_URL);
  const User = (await import('./Models/User.js')).default;
  const user = await User.findById(userId);
  const otp = user.otp;
  console.log(`OTP from DB: ${otp}`);

  try {
    await axios.post(`${baseURL}/verify-otp`, { userId, otp });
    console.log('3. OTP verified successfully');
  } catch (err) {
    console.log('3. OTP verification failed', err.response?.data);
    process.exit(1);
  }

  // 4. Login after verify
  try {
    const res = await axios.post(`${baseURL}/login`, { email, password });
    console.log('4. Login succeeded after verify! Token:', !!res.data.token);
  } catch (err) {
    console.log('4. Login failed after verify!', err.response?.status, err.response?.data);
    process.exit(1);
  }

  process.exit(0);
})();
