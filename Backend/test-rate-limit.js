import axios from 'axios';

(async () => {
  let hit429 = false;
  let passedCount = 0;

  console.log("Sending 15 login requests with spoofed IPs...");

  for (let i = 0; i < 15; i++) {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', 
        { email: 'nonexistent_test@example.com', password: 'pwd' },
        { 
          headers: { 'X-Forwarded-For': '192.168.100.' + i },
          validateStatus: null // Don't throw on 4xx/5xx
        }
      );
      
      console.log(`Attempt ${i + 1}: Status ${res.status}`);
      
      if (res.status === 401) {
        passedCount++;
      } else if (res.status === 429) {
        hit429 = true;
      }
    } catch (err) {
      console.log(`Attempt ${i + 1} Error:`, err.message);
    }
  }

  if (passedCount === 10 && hit429) {
    console.log("✅ Rate limit successfully enforced after 10 requests despite IP spoofing.");
  } else {
    console.error("❌ Rate limit bypass test failed. Check logic.");
    process.exit(1);
  }
})();
