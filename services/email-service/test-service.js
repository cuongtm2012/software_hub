const http = require('http');

// Simple test script for email service
async function testEmailService() {
  const port = process.env.PORT || 3001;
  
  console.log('Testing Email Service...');
  
  // Test health endpoint
  const healthOptions = {
    hostname: 'localhost',
    port: port,
    path: '/health',
    method: 'GET'
  };
  
  return new Promise((resolve, reject) => {
    const req = http.request(healthOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          console.log('Health check response:', health);
          
          if (health.status === 'ok') {
            console.log('✅ Email service is healthy!');
            resolve(true);
          } else {
            console.log('❌ Email service health check failed');
            resolve(false);
          }
        } catch (error) {
          console.error('Error parsing health response:', error);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Health check request failed:', error);
      reject(error);
    });
    
    req.end();
  });
}

// Test welcome email endpoint
async function testWelcomeEmail() {
  const port = process.env.PORT || 3001;
  
  const testData = JSON.stringify({
    userEmail: 'test@example.com',
    userName: 'Test User'
  });
  
  const options = {
    hostname: 'localhost',
    port: port,
    path: '/api/test-welcome',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': testData.length
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('Welcome email test response:', response);
          
          if (response.success) {
            console.log('✅ Welcome email test successful!');
            resolve(true);
          } else {
            console.log('❌ Welcome email test failed');
            resolve(false);
          }
        } catch (error) {
          console.error('Error parsing welcome email response:', error);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Welcome email test request failed:', error);
      reject(error);
    });
    
    req.write(testData);
    req.end();
  });
}

// Main test function
async function runTests() {
  try {
    console.log('🔍 Starting email service tests...\n');
    
    // Wait a bit for the service to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const healthPassed = await testEmailService();
    
    if (healthPassed) {
      console.log('\n🔍 Testing welcome email endpoint...');
      const emailPassed = await testWelcomeEmail();
      
      if (emailPassed) {
        console.log('\n🎉 All tests passed! Email service is working correctly.');
      } else {
        console.log('\n⚠️ Email service is healthy but email sending may have issues.');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Test failed with error:', error);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testEmailService, testWelcomeEmail };