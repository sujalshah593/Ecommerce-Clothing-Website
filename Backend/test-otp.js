import generateOTP from "./utils/generateOtp.js";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
  } else {
    console.error('❌ ' + message);
    failed++;
  }
}

try {
  console.log("Testing generateOTP()...");
  for (let i = 0; i < 100000; i++) {
    const otp = generateOTP();
    assert(typeof otp === 'string', 'OTP should be a string');
    assert(otp.length === 6, `OTP should be 6 digits, got: ${otp}`);
    assert(/^[1-9][0-9]{5}$/.test(otp), `OTP should be between 100000 and 999999, got: ${otp}`);
  }
} catch (err) {
  console.error("Test failed:", err);
  failed++;
}

console.log(`\nTests completed: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
