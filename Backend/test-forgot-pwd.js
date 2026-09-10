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
    const email = `forgot_pwd_test_${Date.now()}@example.com`;
    const password = 'Password123';
    
    // 1. Test non-existing email
    let res = await axios.post(`${baseURL}/auth/forgot-password`, { email: 'nonexistent@example.com' });
    assert(res.status === 200, 'Non-existing email returns 200 OK');
    assert(res.data.message === 'If the account exists, a password reset instruction has been sent.', 'Non-existing email returns exact generic message');

    // 2. Register user
    await User.create({ name: 'Forgot Pwd Test', email, password, isVerified: true });
    
    // 3. Test existing email
    res = await axios.post(`${baseURL}/auth/forgot-password`, { email });
    assert(res.status === 200, 'Existing email returns 200 OK');
    assert(res.data.message === 'If the account exists, a password reset instruction has been sent.', 'Existing email returns exact generic message');

    // Verify token was actually generated and saved for existing email
    const updatedUser = await User.findOne({ email });
    assert(updatedUser.resetPasswordToken && updatedUser.resetPasswordExpire > Date.now(), 'Token was securely generated and saved for existing user');

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
