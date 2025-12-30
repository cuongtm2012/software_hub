# Software Hub Docker Setup Guide

This guide provides complete instructions for setting up and running the Software Hub application using Docker with PostgreSQL database and automatic data import functionality.

## 🐳 Docker Architecture

The setup includes the following services:
- **softwarehub-app**: Main Node.js application (Port 5000)
- **postgres**: PostgreSQL database with auto-import (Port 5432)
- **redis**: Redis cache and message queue (Port 6379)
- **mongo**: MongoDB for chat history (Port 27017)
- **nginx**: Reverse proxy and load balancer (Ports 80, 443)
- **email-service**: Email microservice (Port 3001)
- **chat-service**: Chat microservice (Port 3002)
- **notification-service**: Push notification service (Port 3003)
- **worker-service**: Background task worker
- **postgres-backup**: Automated database backup service

## 📁 Directory Structure

```
database/
├── init/           # Database initialization scripts
├── dumps/          # SQL dump files for import
├── scripts/        # Backup and restore scripts
├── backups/        # Automated backups storage
└── mongo-init/     # MongoDB initialization scripts
```

## 🚀 Quick Start

### 1. Prerequisites
- Docker and Docker Compose installed
- At least 4GB RAM available
- 10GB free disk space

### 2. Initial Setup

```bash
# Clone/navigate to your project directory
cd /Users/jack/Desktop/1.PROJECT/software_hub

# Copy environment configuration
cp .env.example .env

# Edit the .env file with your actual values
nano .env
```

### 3. Start the Application

```bash
# Start all services
./docker-manage.sh start

# Or using docker-compose directly
docker-compose up -d --build
```

### 4. Access the Application
- **Main Application**: http://localhost
- **Direct App Access**: http://localhost:5000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **MongoDB**: localhost:27017

## 📊 Database Data Import

### Automatic Import on Startup
The PostgreSQL container automatically imports data from the `database/dumps/` directory on first startup.

### Supported File Formats
- `full_database*.sql` - Complete database dumps (highest priority)
- `schema*.sql` - Schema-only files
- `data*.sql` - Data-only files
- `*.sql.gz` - Compressed SQL files

### Manual Data Import

```bash
# Place your SQL dump files in database/dumps/
cp your_database_dump.sql database/dumps/

# Import data manually
./docker-manage.sh import

# Or using docker-compose
docker-compose exec postgres /scripts/import-data.sh
```

## 🛠 Management Commands

### Service Management
```bash
./docker-manage.sh start          # Start all services
./docker-manage.sh stop           # Stop all services
./docker-manage.sh restart        # Restart all services
./docker-manage.sh status         # Check service status
```

### Logs and Monitoring
```bash
./docker-manage.sh logs                    # View all logs
./docker-manage.sh logs softwarehub-app    # View specific service logs
./docker-manage.sh logs postgres           # View database logs
```

### Database Operations
```bash
./docker-manage.sh backup                 # Create database backup
./docker-manage.sh restore               # List available backups
./docker-manage.sh restore latest        # Restore from latest backup
./docker-manage.sh restore backup_file   # Restore from specific file
./docker-manage.sh import                # Import from dumps directory
```

### Cleanup
```bash
./docker-manage.sh cleanup               # Stop services and clean Docker resources
```

## 🔧 Configuration

### Environment Variables
Key environment variables in `.env`:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@postgres:5432/softwarehub
POSTGRES_PASSWORD=your-secure-password

# Email Service
SENDGRID_API_KEY=your-sendgrid-api-key

# Firebase (Push Notifications)
FCM_SERVER_KEY=your-fcm-server-key
FCM_PROJECT_ID=your-firebase-project-id

# Cloudflare R2 (File Storage)
CLOUDFLARE_R2_ACCESS_KEY_ID=your-r2-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-r2-secret-key
```

### Volume Mounts
- `./database/init:/docker-entrypoint-initdb.d` - Initialization scripts
- `./database/dumps:/dumps` - SQL dump files for import
- `./database/backups:/backups` - Backup storage
- `./database/scripts:/scripts` - Management scripts

## 📋 Database Management

### Backup Strategy
- Automatic daily backups at midnight
- 7-day retention policy (configurable)
- Compressed backups to save space
- Manual backup capability

### Import Priority Order
1. `full_database*.sql*` files (complete dumps)
2. `schema*.sql*` files (schema only)
3. `data*.sql*` files (data only)
4. Other `*.sql*` files

### Manual Database Access
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d softwarehub

# Connect to MongoDB
docker-compose exec mongo mongosh softwarehub-chat

# Connect to Redis
docker-compose exec redis redis-cli
```

## 🔍 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 80, 443, 5000, 5432, 6379, 27017 are available
2. **Memory issues**: Increase Docker memory allocation to at least 4GB
3. **Permission issues**: Ensure database scripts are executable

### Health Checks
```bash
# Check all service health
docker-compose ps

# Check specific service logs
docker-compose logs service-name

# Check database connectivity
docker-compose exec postgres pg_isready -U postgres
```

### Service Dependencies
Services start in this order:
1. postgres (with health check)
2. redis, mongo
3. email-service, chat-service, notification-service
4. softwarehub-app
5. nginx

## 🔄 Development vs Production

### Development Mode
```bash
# Use development environment
NODE_ENV=development docker-compose up -d

# Enable hot reloading (modify docker-compose.yml)
```

### Production Mode
```bash
# Use production environment (default)
NODE_ENV=production docker-compose up -d

# Enable SSL (place certificates in ssl/ directory)
```

## 📦 Microservices

The application is designed with a microservices architecture:
- **Main App**: Core application logic
- **Email Service**: Handles all email operations
- **Chat Service**: Real-time messaging
- **Notification Service**: Push notifications
- **Worker Service**: Background job processing

## 🎯 Next Steps

1. Configure your `.env` file with actual API keys
2. Place your database dump files in `database/dumps/`
3. Start the services with `./docker-manage.sh start`
4. Access the application at http://localhost
5. Set up SSL certificates for production use

## 📞 Support

For issues or questions:
1. Check service logs: `./docker-manage.sh logs`
2. Verify service status: `./docker-manage.sh status`
3. Review this documentation
4. Check Docker and system resources