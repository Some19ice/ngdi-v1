import axios from 'axios';

async function checkApiStatus() {
  console.log('Checking API server status...');
  
  try {
    // Try to connect to the API server
    const response = await axios.get('http://localhost:3001/health');
    console.log('API server is running:');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    return true;
  } catch (error: any) {
    console.error('API server check failed:');
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. The API server is not running.');
    } else {
      console.error('Error:', error.message);
      console.error('Response:', error.response?.data);
    }
    return false;
  }
}

checkApiStatus().catch(console.error); 