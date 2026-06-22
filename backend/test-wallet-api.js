/**
 * Quick test script to verify wallet API endpoints
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const TEST_EMAIL = 'faisal.hussain696@hotmail.com';
const TEST_PASSWORD = 'Test@123';

async function testWalletAPI() {
  try {
    console.log('🔐 Step 1: Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful! Token:', token.substring(0, 20) + '...');

    // Configure axios with auth header
    const authAxios = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('\n💰 Step 2: Fetching wallet balance...');
    const balanceResponse = await authAxios.get('/wallet/balance');
    console.log('✅ Wallet Balance Response:');
    console.log(JSON.stringify(balanceResponse.data, null, 2));

    console.log('\n📊 Step 3: Fetching wallet statistics...');
    const statsResponse = await authAxios.get('/wallet/statistics');
    console.log('✅ Statistics Response:');
    console.log(JSON.stringify(statsResponse.data, null, 2));

    console.log('\n📜 Step 4: Fetching transactions...');
    const txResponse = await authAxios.get('/wallet/transactions?limit=5');
    console.log('✅ Transactions Response:');
    console.log(JSON.stringify(txResponse.data, null, 2));

    console.log('\n✅ All wallet API endpoints are working correctly!');

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testWalletAPI();
