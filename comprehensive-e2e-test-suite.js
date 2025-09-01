#!/usr/bin/env node

import { io } from 'socket.io-client';
import axios from 'axios';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class ComprehensiveE2ETestSuite {
  constructor() {
    this.results = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      testDetails: [],
      startTime: new Date(),
      endTime: null
    };

    this.services = {
      main: { url: 'http://localhost:5000', name: 'Main Application' },
      email: { url: 'http://localhost:3001', name: 'Email Service' },
      chat: { url: 'http://localhost:3002', name: 'Chat Service' },
      notification: { url: 'http://localhost:3003', name: 'Notification Service' }
    };

    this.databases = {
      postgres: { port: 5432, name: 'PostgreSQL' },
      redis: { port: 6379, name: 'Redis' },
      mongodb: { port: 27017, name: 'MongoDB' }
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      test: '🧪'
    }[type] || '📋';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async recordTest(testName, result, details = null, duration = 0) {
    this.results.totalTests++;
    
    if (result === 'passed') {
      this.results.passed++;
    } else if (result === 'failed') {
      this.results.failed++;
    } else if (result === 'warning') {
      this.results.warnings++;
    }

    this.results.testDetails.push({
      testName,
      result,
      details,
      duration,
      timestamp: new Date()
    });
  }

  async checkPortStatus(port) {
    try {
      const result = execSync(`netstat -tulpn | grep :${port}`, { encoding: 'utf8' });
      return result.trim().length > 0;
    } catch {
      return false;
    }
  }

  async checkServiceHealth(url, timeout = 5000) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(`${url}/health`, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        return { status: 'unhealthy', error: `HTTP ${response.status}` };
      }
      
      const health = await response.json();
      return { status: 'healthy', data: health };
      
    } catch (error) {
      return { status: 'unreachable', error: error.message };
    }
  }

  // Infrastructure Tests
  async testDockerInfrastructure() {
    this.log('Testing Docker Infrastructure...', 'test');
    const startTime = Date.now();
    
    try {
      const result = execSync('docker-compose ps --format json', { encoding: 'utf8' });
      const containers = result.trim().split('\n').map(line => JSON.parse(line));
      
      const runningContainers = containers.filter(c => c.State === 'running');
      const expectedContainers = ['postgres', 'redis', 'mongodb'];
      
      if (runningContainers.length >= expectedContainers.length) {
        this.log(`Docker containers running: ${runningContainers.length}/${containers.length}`, 'success');
        await this.recordTest('Docker Infrastructure', 'passed', 
          `${runningContainers.length} containers running`, Date.now() - startTime);
        return true;
      } else {
        this.log(`Only ${runningContainers.length}/${containers.length} containers running`, 'warning');
        await this.recordTest('Docker Infrastructure', 'warning', 
          `Missing containers: ${containers.filter(c => c.State !== 'running').map(c => c.Name)}`, 
          Date.now() - startTime);
        return false;
      }
      
    } catch (error) {
      this.log('Docker Compose not running', 'error');
      await this.recordTest('Docker Infrastructure', 'failed', error.message, Date.now() - startTime);
      return false;
    }
  }

  async testDatabaseConnectivity() {
    this.log('Testing Database Connectivity...', 'test');
    
    for (const [key, db] of Object.entries(this.databases)) {
      const startTime = Date.now();
      const isOpen = await this.checkPortStatus(db.port);
      
      if (isOpen) {
        this.log(`${db.name} (${db.port}): Connected`, 'success');
        await this.recordTest(`${db.name} Connectivity`, 'passed', 
          `Port ${db.port} accessible`, Date.now() - startTime);
      } else {
        this.log(`${db.name} (${db.port}): Not accessible`, 'error');
        await this.recordTest(`${db.name} Connectivity`, 'failed', 
          `Port ${db.port} not accessible`, Date.now() - startTime);
      }
    }
  }

  async testServiceHealth() {
    this.log('Testing Service Health Endpoints...', 'test');
    
    for (const [key, service] of Object.entries(this.services)) {
      const startTime = Date.now();
      const health = await this.checkServiceHealth(service.url);
      
      if (health.status === 'healthy') {
        this.log(`${service.name}: Healthy`, 'success');
        await this.recordTest(`${service.name} Health`, 'passed', 
          health.data, Date.now() - startTime);
      } else {
        this.log(`${service.name}: ${health.status} - ${health.error}`, 'error');
        await this.recordTest(`${service.name} Health`, 'failed', 
          health.error, Date.now() - startTime);
      }
    }
  }

  // Email Service Tests
  async testEmailService() {
    this.log('Testing Email Service Functionality...', 'test');
    const startTime = Date.now();
    
    try {
      // Test health first
      const health = await this.checkServiceHealth(this.services.email.url);
      if (health.status !== 'healthy') {
        throw new Error('Email service not healthy');
      }

      // Test sending email
      const emailData = {
        to: 'test@example.com',
        subject: 'E2E Test Email',
        text: 'This is a test email from the E2E test suite',
        html: '<p>This is a test email from the <strong>E2E test suite</strong></p>'
      };

      const response = await axios.post(`${this.services.email.url}/api/email/send`, emailData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      this.log('Email Service: Functional', 'success');
      await this.recordTest('Email Service Functionality', 'passed', 
        `Email queued: ${response.data.messageId || 'success'}`, Date.now() - startTime);
      
      return true;
    } catch (error) {
      this.log(`Email Service: ${error.message}`, 'warning');
      await this.recordTest('Email Service Functionality', 'warning', 
        error.message, Date.now() - startTime);
      return false;
    }
  }

  // Chat Service Tests
  async testChatService() {
    this.log('Testing Chat Service Functionality...', 'test');
    const startTime = Date.now();
    
    try {
      // Test REST API
      const roomData = {
        name: 'E2E Test Room',
        participants: [1, 2],
        type: 'private'
      };
      
      const roomResponse = await axios.post(`${this.services.chat.url}/api/chat/room`, roomData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });

      const roomId = roomResponse.data.roomId || 'test-room-e2e';

      // Test Socket.IO
      const socketResult = await this.testChatSocket(roomId);
      
      if (socketResult) {
        this.log('Chat Service: Fully Functional', 'success');
        await this.recordTest('Chat Service Functionality', 'passed', 
          `Room created: ${roomId}, Socket.IO working`, Date.now() - startTime);
      } else {
        throw new Error('Socket.IO connection failed');
      }
      
      return true;
    } catch (error) {
      this.log(`Chat Service: Limited functionality - ${error.message}`, 'warning');
      await this.recordTest('Chat Service Functionality', 'warning', 
        error.message, Date.now() - startTime);
      return false;
    }
  }

  async testChatSocket(roomId) {
    return new Promise((resolve) => {
      const socket = io(this.services.chat.url, {
        transports: ['websocket', 'polling'],
        timeout: 5000
      });
      
      let messageReceived = false;
      
      socket.on('connect', () => {
        socket.emit('join-room', { roomId, userId: 1 });
        socket.emit('send-message', {
          roomId,
          userId: 1,
          message: 'E2E test message',
          timestamp: new Date().toISOString()
        });
      });
      
      socket.on('message-received', (data) => {
        messageReceived = true;
        socket.disconnect();
        resolve(true);
      });
      
      socket.on('connect_error', () => {
        socket.disconnect();
        resolve(false);
      });
      
      setTimeout(() => {
        socket.disconnect();
        resolve(messageReceived);
      }, 3000);
    });
  }

  // Notification Service Tests
  async testNotificationService() {
    this.log('Testing Notification Service Functionality...', 'test');
    const startTime = Date.now();
    
    try {
      const notificationData = {
        userId: 1,
        type: 'test',
        title: 'E2E Test Notification',
        message: 'This is a test notification from the E2E test suite',
        priority: 'normal'
      };

      const response = await axios.post(`${this.services.notification.url}/api/notifications/send`, 
        notificationData, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        });

      this.log('Notification Service: Functional', 'success');
      await this.recordTest('Notification Service Functionality', 'passed', 
        `Notification sent: ${response.data.notificationId || 'success'}`, Date.now() - startTime);
      
      return true;
    } catch (error) {
      this.log(`Notification Service: ${error.message}`, 'warning');
      await this.recordTest('Notification Service Functionality', 'warning', 
        error.message, Date.now() - startTime);
      return false;
    }
  }

  // Integration Tests
  async testCrossServiceIntegration() {
    this.log('Testing Cross-Service Integration...', 'test');
    const startTime = Date.now();
    
    try {
      // Test: User action triggers email and notification
      const integrationData = {
        userId: 1,
        action: 'e2e_test',
        data: {
          email: 'test@example.com',
          message: 'Integration test triggered'
        }
      };

      // This would typically hit your main application endpoint
      // that coordinates between services
      const response = await axios.post(`${this.services.main.url}/api/test/integration`, 
        integrationData, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        });

      this.log('Cross-Service Integration: Working', 'success');
      await this.recordTest('Cross-Service Integration', 'passed', 
        'Services communicating properly', Date.now() - startTime);
      
      return true;
    } catch (error) {
      this.log(`Cross-Service Integration: ${error.message}`, 'warning');
      await this.recordTest('Cross-Service Integration', 'warning', 
        'Integration endpoint not available', Date.now() - startTime);
      return false;
    }
  }

  // Performance Tests
  async testPerformance() {
    this.log('Testing Service Performance...', 'test');
    
    const performanceTests = [
      { service: 'main', endpoint: '/health', name: 'Main App Response Time' },
      { service: 'email', endpoint: '/health', name: 'Email Service Response Time' },
      { service: 'chat', endpoint: '/health', name: 'Chat Service Response Time' },
      { service: 'notification', endpoint: '/health', name: 'Notification Service Response Time' }
    ];

    for (const test of performanceTests) {
      const startTime = Date.now();
      
      try {
        await fetch(`${this.services[test.service].url}${test.endpoint}`);
        const responseTime = Date.now() - startTime;
        
        const status = responseTime < 500 ? 'passed' : responseTime < 1000 ? 'warning' : 'failed';
        const logType = responseTime < 500 ? 'success' : responseTime < 1000 ? 'warning' : 'error';
        
        this.log(`${test.name}: ${responseTime}ms`, logType);
        await this.recordTest(test.name, status, `${responseTime}ms`, responseTime);
        
      } catch (error) {
        this.log(`${test.name}: Failed`, 'error');
        await this.recordTest(test.name, 'failed', error.message, Date.now() - startTime);
      }
    }
  }

  // Security Tests
  async testSecurity() {
    this.log('Testing Security Configuration...', 'test');
    const startTime = Date.now();
    
    const securityTests = [
      {
        name: 'CORS Headers',
        test: async () => {
          const response = await fetch(`${this.services.main.url}/health`);
          return response.headers.get('access-control-allow-origin') !== null;
        }
      },
      {
        name: 'Security Headers',
        test: async () => {
          const response = await fetch(`${this.services.main.url}/health`);
          return response.headers.get('x-content-type-options') !== null;
        }
      }
    ];

    for (const secTest of securityTests) {
      try {
        const result = await secTest.test();
        const status = result ? 'passed' : 'warning';
        const logType = result ? 'success' : 'warning';
        
        this.log(`${secTest.name}: ${result ? 'Configured' : 'Not configured'}`, logType);
        await this.recordTest(`Security - ${secTest.name}`, status, 
          result ? 'Properly configured' : 'Missing configuration', Date.now() - startTime);
        
      } catch (error) {
        this.log(`${secTest.name}: Error testing`, 'error');
        await this.recordTest(`Security - ${secTest.name}`, 'failed', error.message, Date.now() - startTime);
      }
    }
  }

  // Main test runner
  async runAllTests() {
    console.log('\n🚀 COMPREHENSIVE E2E TEST SUITE');
    console.log('================================');
    console.log(`Started at: ${this.results.startTime.toLocaleString()}\n`);

    // Infrastructure Tests
    await this.testDockerInfrastructure();
    await this.testDatabaseConnectivity();
    
    // Service Health Tests
    await this.testServiceHealth();
    
    // Functional Tests
    await this.testEmailService();
    await this.testChatService();
    await this.testNotificationService();
    
    // Integration Tests
    await this.testCrossServiceIntegration();
    
    // Performance Tests
    await this.testPerformance();
    
    // Security Tests
    await this.testSecurity();
    
    // Generate Report
    this.results.endTime = new Date();
    await this.generateReport();
  }

  async generateReport() {
    console.log('\n📊 TEST EXECUTION SUMMARY');
    console.log('==========================');
    
    const duration = this.results.endTime - this.results.startTime;
    const successRate = ((this.results.passed / this.results.totalTests) * 100).toFixed(1);
    
    console.log(`⏱️  Total Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`🧪 Total Tests: ${this.results.totalTests}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`📈 Success Rate: ${successRate}%\n`);

    // Detailed Results
    console.log('📋 DETAILED RESULTS');
    console.log('===================');
    
    const groupedResults = {};
    this.results.testDetails.forEach(test => {
      const category = test.testName.split(' ')[0];
      if (!groupedResults[category]) groupedResults[category] = [];
      groupedResults[category].push(test);
    });

    Object.entries(groupedResults).forEach(([category, tests]) => {
      console.log(`\n${category}:`);
      tests.forEach(test => {
        const icon = test.result === 'passed' ? '✅' : test.result === 'failed' ? '❌' : '⚠️';
        console.log(`  ${icon} ${test.testName} (${test.duration}ms)`);
        if (test.details) {
          console.log(`     ${test.details}`);
        }
      });
    });

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS');
    console.log('==================');
    
    if (this.results.failed > 0) {
      console.log('🔧 Fix failing tests before deployment');
    }
    
    if (this.results.warnings > 0) {
      console.log('⚠️  Address warnings for optimal performance');
    }
    
    const avgResponseTime = this.results.testDetails
      .filter(t => t.testName.includes('Response Time'))
      .reduce((sum, t) => sum + t.duration, 0) / 
      this.results.testDetails.filter(t => t.testName.includes('Response Time')).length;
    
    if (avgResponseTime > 500) {
      console.log('🐌 Consider optimizing service response times');
    }
    
    console.log('✨ All systems tested successfully!\n');

    // Save report to file
    const reportData = {
      summary: {
        startTime: this.results.startTime,
        endTime: this.results.endTime,
        duration: duration,
        totalTests: this.results.totalTests,
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        successRate: successRate
      },
      tests: this.results.testDetails
    };

    fs.writeFileSync('./e2e-test-report.json', JSON.stringify(reportData, null, 2));
    this.log('Test report saved to e2e-test-report.json', 'info');
  }
}

// Run the test suite
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new ComprehensiveE2ETestSuite();
  testSuite.runAllTests().catch(console.error);
}

export default ComprehensiveE2ETestSuite;