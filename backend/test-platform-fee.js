const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testPlatformFee() {
  try {
    console.log("1. Logging in as Admin...");
    const loginRes = await axios.post(`${API_BASE}/admin/login`, {
      email: "admin@careertalk.com",
      password: "Admin@123"
    });
    
    const token = loginRes.data.token;
    console.log("✅ Admin login successful. Token received.");

    console.log("\n2. Fetching current Platform Fee...");
    const getRes = await axios.get(`${API_BASE}/admin/platform-fee`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("✅ Current Fee:", getRes.data.data.fee_percent + "%");

    console.log("\n3. Updating Platform Fee to 20%...");
    const putRes = await axios.put(`${API_BASE}/admin/platform-fee`, {
      fee_percent: 20
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("✅ Update successful. New Fee:", putRes.data.data.fee_percent + "%");

    console.log("\n4. Changing back to 10% (Default)...");
    const revertRes = await axios.put(`${API_BASE}/admin/platform-fee`, {
      fee_percent: 10
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("✅ Revert successful. Fee is back to:", revertRes.data.data.fee_percent + "%");

    console.log("\n🎉 Platform Fee Admin APIs are working perfectly!");

  } catch (error) {
    console.error("❌ Test failed:", error.response ? error.response.data : error.message);
  }
}

testPlatformFee();
