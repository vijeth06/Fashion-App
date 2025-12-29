

const API_BASE = 'http://localhost:5000';

export class APIConnectionTester {
  constructor() {
    this.results = [];
  }

  async testEndpoint(name, url, method = 'GET', body = null) {
    console.log(`Testing: ${name}...`);
    const startTime = Date.now();
    
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const data = await response.json();
      const duration = Date.now() - startTime;

      const result = {
        name,
        url,
        method,
        status: response.status,
        success: response.ok,
        duration: `${duration}ms`,
        data
      };

      this.results.push(result);
      console.log(`✓ ${name}: ${response.status} (${duration}ms)`);
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      const result = {
        name,
        url,
        method,
        status: 'ERROR',
        success: false,
        duration: `${duration}ms`,
        error: error.message
      };

      this.results.push(result);
      console.error(`✗ ${name}: ${error.message}`);
      return result;
    }
  }

  async runAllTests() {
    console.log('ðŸ” Starting API Connection Tests...\n');

    await this.testEndpoint(
      'Health Check',
      `${API_BASE}/health`
    );

    await this.testEndpoint(
      'Database Connection',
      `${API_BASE}/api/test-db`
    );

    await this.testEndpoint(
      'Database Status',
      `${API_BASE}/api/db-status`
    );

    await this.testEndpoint(
      'Auth - Signup',
      `${API_BASE}/api/v1/auth/signup`,
      'POST',
      {
        email: 'test@example.com',
        password: 'Test123456',
        displayName: 'Test User'
      }
    );

    await this.testEndpoint(
      'Auth - Login',
      `${API_BASE}/api/v1/auth/login`,
      'POST',
      {
        email: 'test@example.com',
        password: 'Test123456'
      }
    );

    await this.testEndpoint(
      'Products - Get All',
      `${API_BASE}/api/v1/products`
    );

    await this.testEndpoint(
      'Products - Get by Category',
      `${API_BASE}/api/v1/products/category/tops`
    );

    await this.testEndpoint(
      'Wishlist - Get Items',
      `${API_BASE}/api/v1/wishlist/test-user-id`
    );

    await this.testEndpoint(
      'Looks - Get All',
      `${API_BASE}/api/v1/looks`
    );

    await this.testEndpoint(
      'Analytics - Post Events',
      `${API_BASE}/api/v1/analytics/events`,
      'POST',
      {
        events: [
          {
            sessionId: 'test-session',
            userId: 'test-user',
            eventName: 'test_event',
            eventData: { test: true },
            timestamp: new Date().toISOString(),
            url: window.location.href,
            pathname: window.location.pathname
          }
        ]
      }
    );

    await this.testEndpoint(
      'Analytics - Get Summary',
      `${API_BASE}/api/v1/analytics/summary`
    );

    await this.testEndpoint(
      'Analytics - Get Realtime',
      `${API_BASE}/api/v1/analytics/realtime`
    );

    await this.testEndpoint(
      'Error Logging',
      `${API_BASE}/api/v1/errors/log`,
      'POST',
      {
        errorMessage: 'Test error',
        errorStack: 'Test stack trace',
        componentName: 'TestComponent',
        userId: 'test-user'
      }
    );

    console.log('\nðŸ“Š Test Results Summary:');
    console.log('=========================');
    
    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    
    console.log(`✓ Successful: ${successful}`);
    console.log(`✗ Failed: ${failed}`);
    console.log(`Total: ${this.results.length}`);

    return {
      results: this.results,
      summary: {
        total: this.results.length,
        successful,
        failed,
        successRate: `${((successful / this.results.length) * 100).toFixed(1)}%`
      }
    };
  }

  getResults() {
    return this.results;
  }

  printResults() {
    console.table(this.results.map(r => ({
      Name: r.name,
      Status: r.status,
      Success: r.success ? '✓' : '✗',
      Duration: r.duration
    })));
  }
}

export default APIConnectionTester;

if (typeof window !== 'undefined') {
  window.testAPI = async () => {
    const tester = new APIConnectionTester();
    const results = await tester.runAllTests();
    tester.printResults();
    return results;
  };
  console.log('ðŸ’¡ Run window.testAPI() in console to test all API endpoints');
}
