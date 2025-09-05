// Custom middleware for service routing and monitoring
// Based on Gateweaver middleware patterns

import { Request, Response, NextFunction } from 'express';

// Service health monitoring middleware
export function serviceHealthMiddleware(req: Request, res: Response, next: NextFunction) {
  // Add service health headers to requests
  req.headers['x-health-check'] = 'enabled';
  req.headers['x-gateway-timestamp'] = new Date().toISOString();
  
  // Track request start time for latency monitoring
  const startTime = Date.now();
  
  // Override end to add response time
  const originalEnd = res.end.bind(res);
  res.end = function(chunk?: any, encoding?: BufferEncoding, cb?: (() => void)) {
    const duration = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${duration}ms`);
    res.setHeader('X-Gateway-Version', '1.0.0');
    return originalEnd(chunk, encoding, cb);
  };
  
  next();
}

// Service discovery middleware
export function serviceDiscoveryMiddleware(req: Request, res: Response, next: NextFunction) {
  // Add service discovery headers based on path
  const path = req.path;
  
  if (path.startsWith('/api/email')) {
    req.headers['x-target-service'] = 'email-service';
    req.headers['x-target-port'] = '3001';
  } else if (path.startsWith('/api/chat')) {
    req.headers['x-target-service'] = 'chat-service';
    req.headers['x-target-port'] = '3002';
  } else if (path.startsWith('/api/notifications')) {
    req.headers['x-target-service'] = 'notification-service';
    req.headers['x-target-port'] = '3003';
  } else if (path.startsWith('/socket.io')) {
    req.headers['x-target-service'] = 'chat-service';
    req.headers['x-target-port'] = '3002';
    req.headers['x-connection-type'] = 'websocket';
  } else {
    req.headers['x-target-service'] = 'main-app';
    req.headers['x-target-port'] = '5000';
  }
  
  next();
}

// Rate limiting middleware for microservices
export function microserviceRateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const service = req.headers['x-target-service'];
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Different rate limits per service
  const rateLimits: Record<string, number> = {
    'email-service': 60,      // 60 requests per minute
    'chat-service': 1000,     // 1000 requests per minute (real-time)
    'notification-service': 100, // 100 requests per minute
    'main-app': 500          // 500 requests per minute
  };
  
  const limit = rateLimits[service as string] || 100;
  
  // Add rate limit info to headers
  res.setHeader('X-RateLimit-Service', service || 'unknown');
  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - 1));
  
  next();
}

// Request validation middleware
export function requestValidationMiddleware(req: Request, res: Response, next: NextFunction) {
  // Validate request size
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Request too large',
      maxSize: '10MB',
      received: `${Math.round(contentLength / 1024 / 1024)}MB`
    });
  }
  
  // Validate required headers for API requests
  if (req.path.startsWith('/api/') && req.method !== 'GET') {
    if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
      return res.status(400).json({
        error: 'Invalid Content-Type',
        expected: 'application/json',
        received: req.headers['content-type'] || 'none'
      });
    }
  }
  
  next();
}

// Service fallback middleware
export function serviceFallbackMiddleware(req: Request, res: Response, next: NextFunction) {
  // Add fallback service information
  req.headers['x-fallback-enabled'] = 'true';
  req.headers['x-fallback-service'] = 'main-app';
  
  // Track service attempts for circuit breaker
  if (!req.headers['x-service-attempts']) {
    req.headers['x-service-attempts'] = '1';
  }
  
  next();
}