

const BASE_URL = "http://localhost:5000/api";

const testLoginRateLimit = async () => {
  console.log("Testing Login Rate Limit...");
  let successCount = 0;
  let blockCount = 0;

  for (let i = 0; i < 12; i++) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "password" }),
    });

    if (res.status === 429) {
      blockCount++;
    } else {
      successCount++;
    }
  }

  console.log(`Login requests succeeded (expected ~10): ${successCount}`);
  console.log(`Login requests blocked (expected > 0): ${blockCount}`);
  
  if (blockCount === 0) {
    throw new Error("Rate limiting for login failed to engage.");
  }
};

const testPublicRateLimit = async () => {
    console.log("Testing Public Rate Limit...");
    // 120 is limit, run 125 requests
    let successCount = 0;
    let blockCount = 0;
    
    // Doing it sequentially so node doesn't run out of sockets
    for (let i = 0; i < 125; i++) {
      const res = await fetch(`${BASE_URL}/products`);
      if (res.status === 429) {
          blockCount++;
      } else {
          successCount++;
      }
    }

    console.log(`Public requests succeeded (expected ~120): ${successCount}`);
    console.log(`Public requests blocked (expected > 0): ${blockCount}`);
    
    if (blockCount === 0) {
      throw new Error("Rate limiting for public APIs failed to engage.");
    }
}

const main = async () => {
  try {
    await testLoginRateLimit();
    // Wait a sec
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testPublicRateLimit();
    console.log("All rate limit tests passed!");
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
};

main();
