import mongoose from "mongoose";
import passport from "./Config/passport.js";
import User from "./Models/User.js";
import dotenv from "dotenv";
dotenv.config();

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
    const googleStrategy = passport._strategies.google;
    const verifyCallback = googleStrategy._verify;

    // Helper to call verify callback
    const invokeVerify = (profile) => {
      return new Promise((resolve, reject) => {
        verifyCallback('accessToken', 'refreshToken', profile, (err, user, info) => {
          if (err) return reject(err);
          resolve({ user, info });
        });
      });
    };

    const testEmail = `oauth_test_${Date.now()}@example.com`;

    // 1. New Google user
    const profileNew = { id: 'google123', emails: [{ value: testEmail }], displayName: 'Test User' };
    const res1 = await invokeVerify(profileNew);
    assert(res1.user && res1.user.email === testEmail && res1.user.googleId === 'google123' && res1.user.isVerified === true, '1. New Google user creates account securely');

    // Clean up
    await User.deleteOne({ email: testEmail });

    // 2. Existing local verified account
    await User.create({ name: 'Local', email: testEmail, password: 'hash', isVerified: true });
    const profileExistingVerified = { id: 'google456', emails: [{ value: testEmail }], displayName: 'Local User' };
    const res2 = await invokeVerify(profileExistingVerified);
    assert(!res2.user && res2.info.message.includes('already exists'), '2. Existing local verified account correctly rejected');

    // Clean up
    await User.deleteOne({ email: testEmail });

    // 3. Existing local unverified account
    await User.create({ name: 'Local2', email: testEmail, password: 'hash', isVerified: false });
    const profileExistingUnverified = { id: 'google789', emails: [{ value: testEmail }], displayName: 'Local User 2' };
    const res3 = await invokeVerify(profileExistingUnverified);
    assert(!res3.user && res3.info.message.includes('unverified account'), '3. Existing local unverified account correctly rejected');

    const unverifiedUserAfter = await User.findOne({ email: testEmail });
    assert(unverifiedUserAfter.isVerified === false && !unverifiedUserAfter.googleId, '3b. Unverified account was NOT modified by failed attempt');

    // Clean up
    await User.deleteOne({ email: testEmail });

    // 4. Existing Google account
    await User.create({ name: 'Google Only', email: testEmail, password: 'randomhash', googleId: 'google999', isVerified: true });
    const profileExistingGoogle = { id: 'google999', emails: [{ value: testEmail }], displayName: 'Google Only' };
    const res4 = await invokeVerify(profileExistingGoogle);
    assert(res4.user && res4.user.googleId === 'google999', '4. Existing Google account authenticates normally');

    // Clean up
    await User.deleteOne({ email: testEmail });

  } catch (error) {
    console.error('Testing error:', error);
  } finally {
    console.log(`\nTests completed: ${passed} passed, ${failed} failed`);
    process.exit(0);
  }
}

runTests();
