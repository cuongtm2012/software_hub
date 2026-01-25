#!/usr/bin/env node

const QueueManager = require('./src/utils/queueManager');
const config = require('./src/config/redisSMQConfig');

class QueueCLI {
  constructor() {
    this.queueManager = new QueueManager();
  }

  async connect() {
    try {
      await this.queueManager.connect();
      console.log('🚀 Connected to Redis SMQ');
    } catch (error) {
      console.error('💥 Connection failed:', error.message);
      process.exit(1);
    }
  }

  async disconnect() {
    await this.queueManager.disconnect();
  }

  async runCommand(command, args = []) {
    await this.connect();

    try {
      switch (command) {
        case 'health':
          await this.healthCheck();
          break;
        
        case 'stats':
          await this.showStats();
          break;
        
        case 'test':
          await this.addTestMessages();
          break;
        
        case 'purge':
          await this.purgeQueues(args[0]);
          break;
        
        case 'monitor':
          await this.startMonitoring(args[0]);
          break;
        
        case 'config':
          this.showConfig();
          break;
        
        case 'help':
        default:
          this.showHelp();
          break;
      }
    } catch (error) {
      console.error('💥 Command failed:', error.message);
    } finally {
      if (command !== 'monitor') {
        await this.disconnect();
        process.exit(0);
      }
    }
  }

  async healthCheck() {
    console.log('🩺 Running health check...\n');
    const health = await this.queueManager.healthCheck();
    
    if (health.status === 'healthy') {
      console.log('✅ System is healthy');
      console.log(`📊 Queues configured: ${health.queuesConfigured}`);
      console.log(`🔧 Redis SMQ version: ${health.redisSMQVersion}`);
      console.log(`⏰ Timestamp: ${health.timestamp}`);
    } else {
      console.log('❌ System is unhealthy');
      console.log(`🚨 Reason: ${health.reason}`);
    }
  }

  async showStats() {
    console.log('📊 Fetching queue statistics...\n');
    const stats = await this.queueManager.getDetailedStats();
    
    console.log('='.repeat(50));
    console.log('QUEUE STATISTICS');
    console.log('='.repeat(50));
    
    Object.entries(stats.queues).forEach(([queueName, queueData]) => {
      console.log(`\n📦 ${queueName.toUpperCase()}`);
      console.log(`   Size: ${queueData.size || 'N/A'}`);
      if (queueData.config) {
        console.log(`   Rate Limit: ${queueData.config.rateLimit.requests}/${queueData.config.rateLimit.interval}ms`);
        console.log(`   Retry Attempts: ${queueData.config.retryAttempts}`);
        console.log(`   Retry Delay: ${queueData.config.retryDelay}ms`);
      }
      if (queueData.error) {
        console.log(`   ❌ Error: ${queueData.error}`);
      }
    });
    
    console.log(`\n⏰ Report generated: ${stats.timestamp}`);
  }

  async addTestMessages() {
    console.log('🧪 Adding test messages to queues...\n');
    const results = await this.queueManager.addTestMessages();
    
    console.log('📤 Test Message Results:');
    results.forEach(result => {
      if (result.status === 'success') {
        console.log(`   ✅ ${result.queue}: ${result.messageId}`);
      } else {
        console.log(`   ❌ ${result.queue}: ${result.error}`);
      }
    });
  }

  async purgeQueues(queueName) {
    if (queueName) {
      console.log(`🗑️ Purging queue: ${queueName}...`);
      // Add single queue purge functionality if needed
    } else {
      console.log('🗑️ Purging all queues...\n');
      const results = await this.queueManager.purgeAllQueues();
      
      console.log('🧹 Purge Results:');
      results.forEach(result => {
        if (result.status === 'purged') {
          console.log(`   ✅ ${result.queue}: purged`);
        } else {
          console.log(`   ❌ ${result.queue}: ${result.error}`);
        }
      });
    }
  }

  async startMonitoring(interval = '10000') {
    const intervalMs = parseInt(interval, 10) || 10000;
    console.log(`👀 Starting real-time monitoring (${intervalMs}ms intervals)...`);
    console.log('Press Ctrl+C to stop\n');
    
    const stopMonitoring = await this.queueManager.startMonitoring(intervalMs);
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping monitoring...');
      stopMonitoring();
      await this.disconnect();
      process.exit(0);
    });
  }

  showConfig() {
    console.log('⚙️ Current Redis SMQ Configuration:\n');
    console.log(JSON.stringify(config, null, 2));
  }

  showHelp() {
    console.log(`
🔧 Redis SMQ Queue Manager CLI

Usage: node queue-cli.js <command> [args]

Commands:
  health                    Check system health
  stats                     Show detailed queue statistics
  test                      Add test messages to all queues
  purge [queue-name]        Purge all queues (or specific queue)
  monitor [interval-ms]     Start real-time monitoring (default: 10000ms)
  config                    Show current configuration
  help                      Show this help message

Examples:
  node queue-cli.js health
  node queue-cli.js stats
  node queue-cli.js test
  node queue-cli.js purge
  node queue-cli.js monitor 5000
  node queue-cli.js config

Environment Variables:
  REDIS_HOST                Redis server host (default: localhost)
  REDIS_PORT                Redis server port (default: 6379)
  REDIS_PASSWORD            Redis server password
  NODE_ENV                  Environment (development/production)
    `);
  }
}

// CLI Entry Point
if (require.main === module) {
  const cli = new QueueCLI();
  const command = process.argv[2] || 'help';
  const args = process.argv.slice(3);
  
  cli.runCommand(command, args).catch(error => {
    console.error('💥 CLI Error:', error.message);
    process.exit(1);
  });
}

module.exports = QueueCLI;