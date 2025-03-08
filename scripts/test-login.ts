import axios from 'axios';

async function testLogin() {
  console.log('Testing login API directly...');
  
  // Configure axios to log request details
  axios.interceptors.request.use(request => {
    console.log('Request:', {
      method: request.method,
      url: request.url,
      data: request.data,
      headers: request.headers
    });
    return request;
  });

  // Configure axios to log response details
  axios.interceptors.response.use(
    response => {
      console.log('Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });
      return response;
    },
    error => {
      console.log('Error:', {
        message: error.message,
        code: error.code,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data
        } : 'No response'
      });
      return Promise.reject(error);
    }
  );
  
  try {
    // Test user login
    console.log('\n=== Testing login with test user ===');
    const testUserResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    // Test admin login
    console.log('\n=== Testing login with admin user ===');
    const adminUserResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@example.com',
      password: 'adminpass123'
    });
    
  } catch (error: any) {
    console.error('Login test failed');
  }
}

testLogin().catch(console.error); 