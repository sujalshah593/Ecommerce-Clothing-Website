import axios from 'axios';
import mongoose from 'mongoose';
import User from './Models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const baseURL = 'http://localhost:5000/api/auth';
let passed = 0, failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log('✅ ' + message);
    passed++;
  } else {
    console.error('❌ ' + message);
    failed++;
  }
}

async function runTests() {
  await mongoose.connect(process.env.MONGO_URL);
  
  const emails = {
    new: 'new_user_reg@example.com',
    verified: 'verified_reg@example.com',
    unverified: 'unverified_reg@example.com',
    google: 'google_reg@example.com'
  };

  // Cleanup
  await User.deleteMany({ email: { $in: Object.values(emails) } });

  // Setup initial users
  await User.create({ name: 'Verified', email: emails.verified, password: 'pwd', isVerified: true });
  await User.create({ name: 'Unverified', email: emails.unverified, password: 'pwd', isVerified: false, otp: '123456' });
  await User.create({ name: 'Google', email: emails.google, password: 'pwd', isVerified: true, googleId: 'google123' });

  // A. New email
  let res = await axios.post(`${baseURL}/register`, { name: 'New User', email: emails.new, password: 'pwd' });
  assert(res.status === 201 && res.data.message && !res.data.token, 'A. Normal registration succeeds with generic response and NO token');
  
  let userInDb = await User.findOne({ email: emails.new });
  assert(userInDb && userInDb.name === 'New User', 'A. New user created in DB');

  // B. Verified email
  const beforeB = await User.findOne({ email: emails.verified });
  res = await axios.post(`${baseURL}/register`, { name: 'Attacker', email: emails.verified, password: 'pwd' });
  assert(res.status === 201 && !res.data.token && res.data.message, 'B. Existing verified email returns generic 201 response with NO token');

  const afterB = await User.find({ email: emails.verified });
  assert(afterB.length === 1 && afterB[0].name === 'Verified', 'B. No duplicate created, existing user intact');

  // C. Unverified email
  const beforeC = await User.findOne({ email: emails.unverified });
  res = await axios.post(`${baseURL}/register`, { name: 'Attacker', email: emails.unverified, password: 'pwd' });
  assert(res.status === 201, 'C. Existing unverified email returns normal 201 response');

  const afterC = await User.find({ email: emails.unverified });
  assert(afterC.length === 1 && afterC[0].otp === '123456', 'C. Unverified user OTP state not corrupted');

  // D. Google OAuth email
  const beforeD = await User.findOne({ email: emails.google });
  res = await axios.post(`${baseURL}/register`, { name: 'Attacker', email: emails.google, password: 'pwd' });
  assert(res.status === 201, 'D. Existing Google email returns normal 201 response');

  const afterD = await User.find({ email: emails.google });
  assert(afterD.length === 1 && afterD[0].googleId === 'google123', 'D. Google account remains intact without changes');

  // NoSQLi check
  try {
    await axios.post(`${baseURL}/register`, { name: 'Attack', email: { "$ne": "unknown" }, password: 'pwd' });
    assert(false, 'NoSQLi object bypassed validation!');
  } catch (err) {
    assert(err.response?.status === 400 && err.response?.data?.message === 'Invalid email format', 'NoSQLi correctly rejected');
  }

  // Cleanup
  await User.deleteMany({ email: { $in: Object.values(emails) } });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
