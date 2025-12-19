/**
 * Simple server test script
 */

const http = require('http');

const testEndpoint = (url, description) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: url,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ ${description}:`);
        console.log(`   Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          console.log(`   Response: ${JSON.stringify(json, null, 2)}`);
        } catch (e) {
          console.log(`   Response: ${data}`);
        }
        console.log('');
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${description} failed: ${err.message}`);
      console.log('');
      resolve();
    });

    req.end();
  });
};

async function testServer() {
  console.log('🧪 Testing VF-TryOn Backend Server...\n');
  
  await testEndpoint('/health', 'Health Check');
  await testEndpoint('/api/test-db', 'Database Test');
  await testEndpoint('/api/products', 'Products API');
  
  console.log('🎉 Server tests completed!');
  process.exit(0);
}

// Wait 2 seconds for server to be ready
setTimeout(testServer, 2000);