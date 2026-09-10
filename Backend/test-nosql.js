import axios from 'axios';
(async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', 
      { email: { "$ne": "unknown@example.com" }, password: "pwd" }
    );
  } catch (err) {
    console.log('Status:', err.response?.status, 'Message:', err.response?.data);
  }
})();
