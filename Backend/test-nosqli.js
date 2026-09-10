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

async function testEndpoint(endpoint, validEmail, runAssertions = true) {
  console.log(`\nTesting ${endpoint}...`);
  const payloads = [
    { name: 'C. { "$ne": ... }', value: { "$ne": validEmail } },
    { name: 'D. { "$gt": "" }', value: { "$gt": "" } },
    { name: 'E. { "$regex": ".*" }', value: { "$regex": ".*" } },
    { name: 'F. Array', value: ["test@example.com"] },
    { name: 'G. Number', value: 12345 },
    { name: 'H. Boolean', value: true },
    { name: 'I. Null', value: null }
  ];

  for (const { name, value } of payloads) {
    try {
      await axios.post(`${baseURL}/${endpoint}`, { email: value, password: 'pwd' });
      assert(false, `${name} bypassed validation!`);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message === 'Invalid email format') {
        assert(true, `${name} correctly rejected with 400`);
      } else {
        assert(false, `${name} failed with wrong status: ${err.response?.status}`);
      }
    }
  }

  if (!runAssertions) return;
  // A. Valid string
  try {
    const res = await axios.post(`${baseURL}/${endpoint}`, { email: validEmail, password: 'pwd' });
    assert(res.status === 200 || res.status === 401 || res.status === 403, 'A. Valid string allowed through validation');
  } catch(err) {
    assert(err.response?.status !== 400 || err.response?.data?.message !== 'Invalid email format', 'A. Valid string correctly handled');
  }

  // B. Nonexistent string
  try {
    await axios.post(`${baseURL}/${endpoint}`, { email: 'doesnotexist@example.com', password: 'pwd' });
    assert(true, 'B. Nonexistent string handled');
  } catch(err) {
    assert(err.response?.status !== 400 || err.response?.data?.message !== 'Invalid email format', 'B. Nonexistent string correctly handled');
  }
}

(async () => {
  await mongoose.connect(process.env.MONGO_URL);
  
  // Clean DB for tests
  const testEmail = 'nosql_test@example.com';
  await User.deleteOne({ email: testEmail });
  await User.create({ name: 'NoSQL Test', email: testEmail, password: 'pwd', isVerified: true });

  await testEndpoint('login', testEmail);
  await testEndpoint('forgot-password', testEmail);
  await testEndpoint('resend-otp', testEmail);

  await User.deleteOne({ email: testEmail });
  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
})();
