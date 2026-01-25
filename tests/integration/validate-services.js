#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ServiceValidator {
  constructor() {
    this.services = [
      { name: 'PostgreSQL', port: 5432, healthUrl: null },
      { name: 'Redis', port: 6379, healthUrl: null },
      { name: 'MongoDB', port: 27017, healthUrl: null },
      { name: 'Email Service', port: 3001, healthUrl: 'http://localhost:3001/health' },
      { name: 'Chat Service', port: 3002, healthUrl: 'http://localhost:3002/health' },
      { name: 'Notification Service', port: 3003, healthUrl: 'http://localhost:3003/health' },
      { name: 'Main App', port: 5000, healthUrl: 'http://localhost:5000/health' }
    ];
  }

  async checkPortStatus(port) {
    try {
      const result = execSync(`netstat -tulpn | grep :${port}`, { encoding: 'utf8' });
      return result.trim().length > 0;
    } catch {
      return false;
    }
  }

  async checkServiceHealth(url) {
    try {
      const response = await fetch(url, { 
        method: 'GET',
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        return { status: 'unhealthy', error: `HTTP ${response.status}` };
      }
      
      const health = await response.json();
      return { status: 'healthy', data: health };
      
    } catch (error) {
      return { status: 'unreachable', error: error.message };
    }
  }

  async validateDockerServices() {
    console.log('🔍 Validating Docker services...\n');
    
    try {
      const result = execSync('docker-compose ps --format json', { encoding: 'utf8' });
      const containers = result.trim().split('\n').map(line => JSON.parse(line));
      
      containers.forEach(container => {
        const status = container.State === 'running' ? '✅' : '❌';
        console.log(`${status} ${container.Name}: ${container.State}`);
        
        if (container.State !== 'running') {
          console.log(`   ⚠️  Check logs: docker logs ${container.Name}`);
        }
      });
      
      console.log('');
      return containers.every(c => c.State === 'running');
      
    } catch (error) {
      console.log('❌ Docker Compose not running or not available');
      console.log('   💡 Run: docker-compose up -d\n');
      return false;
    }
  }

  async validateServices() {
    console.log('🔍 Validating service connectivity...\n');
    
    for (const service of this.services) {
      const portOpen = await this.checkPortStatus(service.port);
      const portStatus = portOpen ? '✅' : '❌';
      
      console.log(`${portStatus} ${service.name} (Port ${service.port}): ${portOpen ? 'OPEN' : 'CLOSED'}`);
      
      if (portOpen && service.healthUrl) {
        const health = await this.checkServiceHealth(service.healthUrl);
        const healthStatus = health.status === 'healthy' ? '✅' : '❌';
        
        console.log(`   ${healthStatus} Health check: ${health.status}`);
        
        if (health.status === 'healthy' && health.data) {
          if (health.data.dependencies) {
            console.log('   📊 Dependencies:');
            Object.entries(health.data.dependencies).forEach(([dep, status]) => {
              const depStatus = status === 'connected' || status === 'configured' ? '✅' : '⚠️';
              console.log(`      ${depStatus} ${dep}: ${status}`);
            });
          }
        } else if (health.error) {
          console.log(`   ⚠️  Error: ${health.error}`);
        }
      } else if (!portOpen) {
        console.log(`   💡 Start service or check Docker container`);
      }
      
      console.log('');
    }
  }

  async validateEnvironment() {
    console.log('🔍 Validating environment configuration...\n');
    
    const requiredEnvVars = [
      'DATABASE_URL',
      'REDIS_URL',
      'SESSION_SECRET'
    ];
    
    const optionalEnvVars = [
      'SENDGRID_API_KEY',
      'FIREBASE_PROJECT_ID',
      'CLOUDFLARE_R2_ACCESS_KEY_ID'
    ];
    
    console.log('Required Environment Variables:');
    requiredEnvVars.forEach(envVar => {
      const exists = process.env[envVar] ? '✅' : '❌';
      console.log(`${exists} ${envVar}: ${exists === '✅' ? 'SET' : 'MISSING'}`);
    });
    
    console.log('\nOptional Environment Variables:');
    optionalEnvVars.forEach(envVar => {
      const exists = process.env[envVar] ? '✅' : '⚠️';
      console.log(`${exists} ${envVar}: ${exists === '✅' ? 'SET' : 'NOT SET'}`);
    });
    
    console.log('');
  }

  async validateFileStructure() {
    console.log('🔍 Validating file structure...\n');
    
    const criticalFiles = [
      'docker-compose.yml',
      'package.json',
      'server/index.ts',
      'services/email-service/src/app.js',
      'services/chat-service/src/app.js',
      'services/notification-service/src/app.js',
      'services/worker-service/src/app.js'
    ];
    
    criticalFiles.forEach(file => {
      const exists = fs.existsSync(file);
      const status = exists ? '✅' : '❌';
      console.log(`${status} ${file}: ${exists ? 'EXISTS' : 'MISSING'}`);
    });
    
    console.log('');
  }

  async generateFixCommands() {
    console.log('🔧 Suggested fix commands:\n');
    
    console.log('1. Restart all services:');
    console.log('   docker-compose down && docker-compose up -d --build\n');
    
    console.log('2. Check service logs:');
    console.log('   docker-compose logs -f [service-name]\n');
    
    console.log('3. Rebuild specific service:');
    console.log('   docker-compose up -d --build [service-name]\n');
    
    console.log('4. Reset database:');
    console.log('   docker-compose down -v && docker-compose up -d postgres redis mongo\n');
    
    console.log('5. Check network connectivity:');
    console.log('   docker network ls');
    console.log('   docker network inspect softwarehub_softwarehub-network\n');
  }

  async run() {
    console.log('🚀 SoftwareHub Service Validation\n');
    console.log('=' * 50 + '\n');
    
    await this.validateFileStructure();
    await this.validateEnvironment();
    await this.validateDockerServices();
    await this.validateServices();
    await this.generateFixCommands();
    
    console.log('✅ Validation complete!\n');
  }
}

// Run if called directly
if (require.main === module) {
  const validator = new ServiceValidator();
  validator.run().catch(console.error);
}

module.exports = ServiceValidator;