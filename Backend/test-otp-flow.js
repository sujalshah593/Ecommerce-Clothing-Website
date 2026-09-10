import mongoose from "mongoose";
import User from "./Models/User.js";
import dotenv from "dotenv";
dotenv.config();

const baseURL = 'http://localhost:5000/api';

async function runTests() {
  await mongoose.connect(process.env.MONGO_URL);
  
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log('✅ ' + message);
      passed++;
    } else {
      console.error('❌ ' + message);
      failed++;
    }
  }

  try {
    const { default: axios } = await import('axios');
    const email = `otp_test_${Date.now()}@example.com`;
    const password = 'Password123';
    
    // 1. Register a new user
    let res = await axios.post(`${baseURL}/auth/register`, { name: 'OTP Test', email, password });
    assert(res.status === 201, 'Registered successfully');

    // 2. Login, which should trigger OTP sent
    try {
      await axios.post(`${baseURL}/auth/login`, { email, password });
      assert(false, 'Login for unverified account should trigger OTP challenge');
    } catch (err) {
      assert(err.response?.status === 403 && err.response?.data?.requiresOtp === true, 'Login triggered OTP challenge');
    }

    // Read OTP from DB
    let user = await User.findOne({ email });
    assert(user.otp && user.otp.length === 6, `OTP saved to DB successfully: ${user.otp}`);

    // 3. Verify OTP
    res = await axios.post(`${baseURL}/auth/verify-otp`, { userId: user._id, otp: user.otp });
    assert(res.status === 200, 'OTP verified successfully');

    // Verify DB update
    user = await User.findOne({ email });
    assert(user.isVerified === true && user.otp === null, 'User marked as verified in DB');

    // 4. Test resend OTP (mock unverified user again)
    user.isVerified = false;
    await user.save();

    res = await axios.post(`${baseURL}/auth/resend-otp`, { email });
    assert(res.status === 200, 'OTP resent successfully');

    user = await User.findOne({ email });
    assert(user.otp && user.otp.length === 6, `New OTP saved to DB successfully: ${user.otp}`);

    // Clean up
    await User.deleteOne({ email });

  } catch (error) {
    console.error('Testing error:', error.response?.data || error.message);
  } finally {
    console.log(`\nTests completed: ${passed} passed, ${failed} failed`);
    process.exit(0);
  }
}

runTests();
