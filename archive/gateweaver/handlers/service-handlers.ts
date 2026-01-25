// Custom handlers for Gateweaver service management
// Based on Gateweaver handler patterns

import { Request, Response } from 'express';

// Health check aggregation handler
export const aggregateHealth = async (req: Request, res: Response) => {
  try {
    const services = [
      {
        name: 'email-service',
        url: 'http://softwarehub-email-service:3001/health',
        port: 3001
      },
      {
        name: 'chat-service',
        url: 'http://softwarehub-chat-service:3002/health',
        port: 3002
      },
      {
        name: 'notification-service',
        url: 'http://softwarehub-notification-service:3003/health',
        port: 3003
      },
      {
        name: 'main-app',
        url: 'http://softwarehub-app:5000/api/health',
        port: 5000
      }
    ];

    const healthPromises = services.map(async (service) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(service.url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'X-Health-Check': 'gateway',
            'User-Agent': 'Gateweaver/1.0.0'
          }
        });

        clearTimeout(timeoutId);
        const healthData = await response.json();
        
        return {
          name: service.name,
          status: response.ok ? 'healthy' : 'unhealthy',
          port: service.port,
          responseTime: response.headers.get('X-Response-Time') || 'unknown',
          lastChecked: new Date().toISOString(),
          details: healthData
        };
      } catch (error: any) {
        return {
          name: service.name,
          status: 'unreachable',
          port: service.port,
          error: error.message,
          lastChecked: new Date().toISOString()
        };
      }
    });

    const healthResults = await Promise.all(healthPromises);
    const overallStatus = healthResults.every(s => s.status === 'healthy') ? 'healthy' : 'degraded';

    res.json({
      status: overallStatus,
      gateway: 'Gateweaver',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: healthResults,
      summary: {
        total: services.length,
        healthy: healthResults.filter(s => s.status === 'healthy').length,
        unhealthy: healthResults.filter(s => s.status === 'unhealthy').length,
        unreachable: healthResults.filter(s => s.status === 'unreachable').length
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      gateway: 'Gateweaver',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Simple gateway health check
export const healthCheck = async (req: Request, res: Response) => {
  try {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    res.json({
      status: 'healthy',
      gateway: 'Gateweaver',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptime),
        human: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
      },
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
        unit: 'MB'
      },
      routes: {
        '/api/email/*': 'email-service:3001',
        '/api/chat/*': 'chat-service:3002',
        '/api/notifications/*': 'notification-service:3003',
        '/socket.io/*': 'chat-service:3002 (WebSocket)',
        '/*': 'main-app:5000 (fallback)'
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      gateway: 'Gateweaver',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Service metrics handler
export const serviceMetrics = async (req: Request, res: Response) => {
  try {
    // Simulate basic metrics (in production, this would come from actual monitoring)
    const metrics = {
      gateway: {
        requests_total: Math.floor(Math.random() * 10000),
        requests_per_second: Math.floor(Math.random() * 100),
        response_time_avg_ms: Math.floor(Math.random() * 200) + 50,
        uptime_seconds: Math.floor(process.uptime())
      },
      services: {
        'email-service': {
          requests_total: Math.floor(Math.random() * 1000),
          success_rate: 0.95 + Math.random() * 0.05,
          avg_response_time_ms: Math.floor(Math.random() * 100) + 50
        },
        'chat-service': {
          requests_total: Math.floor(Math.random() * 5000),
          success_rate: 0.98 + Math.random() * 0.02,
          avg_response_time_ms: Math.floor(Math.random() * 50) + 20,
          websocket_connections: Math.floor(Math.random() * 100)
        },
        'notification-service': {
          requests_total: Math.floor(Math.random() * 2000),
          success_rate: 0.92 + Math.random() * 0.08,
          avg_response_time_ms: Math.floor(Math.random() * 150) + 75
        },
        'main-app': {
          requests_total: Math.floor(Math.random() * 8000),
          success_rate: 0.97 + Math.random() * 0.03,
          avg_response_time_ms: Math.floor(Math.random() * 200) + 100
        }
      },
      timestamp: new Date().toISOString()
    };

    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to collect metrics',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Service discovery handler
export const serviceDiscovery = async (req: Request, res: Response) => {
  try {
    const services = {
      gateway: {
        name: 'Gateweaver API Gateway',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          metrics: '/metrics',
          discovery: '/discovery'
        }
      },
      microservices: [
        {
          name: 'email-service',
          type: 'microservice',
          url: 'http://softwarehub-email-service:3001',
          routes: ['/api/email/*'],
          capabilities: ['email-sending', 'template-rendering', 'sendgrid-integration']
        },
        {
          name: 'chat-service',
          type: 'microservice',
          url: 'http://softwarehub-chat-service:3002',
          routes: ['/api/chat/*', '/socket.io/*'],
          capabilities: ['real-time-messaging', 'websockets', 'chat-history', 'file-sharing']
        },
        {
          name: 'notification-service',
          type: 'microservice',
          url: 'http://softwarehub-notification-service:3003',
          routes: ['/api/notifications/*'],
          capabilities: ['push-notifications', 'firebase-integration', 'notification-history']
        },
        {
          name: 'main-app',
          type: 'monolith',
          url: 'http://softwarehub-app:5000',
          routes: ['/api/*', '/*'],
          capabilities: ['frontend-serving', 'api-gateway', 'authentication', 'database-access']
        }
      ],
      routing_rules: {
        priority_order: [
          { pattern: '/api/email/*', service: 'email-service', priority: 1 },
          { pattern: '/api/chat/*', service: 'chat-service', priority: 1 },
          { pattern: '/api/notifications/*', service: 'notification-service', priority: 1 },
          { pattern: '/socket.io/*', service: 'chat-service', priority: 1 },
          { pattern: '/api/*', service: 'main-app', priority: 1000 },
          { pattern: '/*', service: 'main-app', priority: 2000 }
        ]
      }
    };

    res.json(services);
  } catch (error: any) {
    res.status(500).json({
      error: 'Service discovery failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};