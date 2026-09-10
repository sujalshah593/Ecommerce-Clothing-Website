import mongoose from "mongoose";
import bcrypt from "bcryptjs";
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
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'Password123';
    
    // Create verified user directly
    const user = await User.create({ name: 'Test', email, password, isVerified: true });
    
    // Using dynamic import for axios to support ES module script
    const { default: axios } = await import('axios');

    // 1. Login with a non-existent email -> 401
    try {
      await axios.post(`${baseURL}/auth/login`, { email: 'nonexistent@example.com', password: 'password' });
      assert(false, 'Login non-existent should fail');
    } catch (err) {
      console.log('Login non-existent error response:', err.response?.data);
      assert(err.response?.status === 401, `Non-existent email returned ${err.response?.status}`);
    }

    // 2. Login with an existing user and wrong password -> 401
    try {
      await axios.post(`${baseURL}/auth/login`, { email, password: 'wrongpassword' });
      assert(false, 'Login wrong password should fail');
    } catch (err) {
      assert(err.response?.status === 401, `Wrong password returned ${err.response?.status}`);
    }

    // 3. Login with correct password
    let token = null;
    try {
      const res = await axios.post(`${baseURL}/auth/login`, { email, password });
      token = res.data.token;
      assert(res.status === 200 && token, 'Login successful');
    } catch (err) {
      assert(false, 'Login correct password failed');
    }

    // 4. Change password successfully
    const newPassword = 'NewPassword456';
    try {
      const res = await axios.post(`${baseURL}/auth/change-password`, {
        currentPassword: password,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      assert(res.status === 200, 'Changed password successfully');
    } catch (err) {
      console.log('Change password error:', err.response?.data);
      assert(false, 'Change password failed: ' + err.response?.data?.message);
    }

    // 5. Login using NEW password -> succeed
    try {
      const res = await axios.post(`${baseURL}/auth/login`, { email, password: newPassword });
      assert(res.status === 200, 'Login with new password successful');
    } catch (err) {
      assert(false, 'Login with new password failed');
    }

    // 6. Login using OLD password -> fail
    try {
      await axios.post(`${baseURL}/auth/login`, { email, password });
      assert(false, 'Login with old password should fail');
    } catch (err) {
      assert(err.response?.status === 401, 'Login with old password failed properly');
    }

    // 7. Verify stored password is hashed only once
    const updatedUser = await User.findOne({ email });
    const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
    assert(isMatch, 'Password verified to be hashed exactly once (bcrypt match succeeds)');

    // 8. Test resend OTP with a non-existent email
    try {
      const res = await axios.post(`${baseURL}/auth/resend-otp`, { email: 'nonexistent@example.com' });
      assert(res.status === 200 && res.data.message === 'OTP resent', 'Resend OTP returned safe generic response');
    } catch (err) {
      assert(false, 'Resend OTP failed for non-existent email');
    }

    // Clean up
    await User.deleteOne({ email });

  } catch (error) {
    console.error('Testing error:', error);
  } finally {
    console.log(`\nTests completed: ${passed} passed, ${failed} failed`);
    process.exit(0);
  }
}

runTests();
