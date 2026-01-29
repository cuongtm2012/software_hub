# Scripts Directory

This directory contains utility scripts for the Software Hub application.

## 🚀 Production Deployment

### Main Deployment Script
- **`deploy-production-final.sh`** - Complete production deployment script
  - Pulls latest code
  - Builds Docker images
  - Starts all services
  - Runs health checks
  - Usage: `./scripts/deploy-production-final.sh`

## 🛠️ Development & Utilities

### Docker Management
- **`docker-manage.sh`** - Comprehensive Docker management tool
- **`docker-deploy.sh`** - Deploy with Docker
- **`docker-dev.sh`** - Development environment setup
- **`docker-clean.sh`** - Clean up Docker resources

### Service Management
- **`start-services.sh`** - Start all services
- **`stop-services.sh`** - Stop all services
- **`start-chat-service.sh`** - Start chat service separately
- **`check-services.sh`** - Health check for all services
- **`vps-health-check.sh`** - VPS server health monitoring

### Database
- **`export-database.sh`** - Export database backup
- **`import-database.sh`** - Import database from backup

### Configuration
- **`configure-env.sh`** - Environment configuration helper
- **`build-app.sh`** - Build application

## 📊 Data Seeding Scripts (TypeScript)

### Software Data
- `seed-software-data.ts` - Seed software catalog
- `seed-free-software.ts` - Free software data
- `seed-free-apps.ts` - Free apps data
- `seed-combined-awesome.ts` - Combined awesome lists
- `seed-awesome-windows.ts` - Windows software
- `seed-voz-software.ts` - VOZ forum software data

### Courses & APIs
- `seed-it-courses.ts` - IT courses data
- `seed-apis.ts` - API catalog
- `seed-sysadmin.ts` - Sysadmin tools

### Data Parsing
- `parse-*.ts` - Various data parsing scripts
- `scrape-voz-software.ts` - Scrape VOZ forum

### Database Migrations
- `migrate-categories.ts` - Category migration
- `create-courses-table.ts` - Create courses table
- `delete-discussion-forums.ts` - Cleanup script

## 📁 Archive

Old/deprecated scripts are moved to `archive/` directory.

## 🎯 Quick Start

### Deploy to Production
```bash
./scripts/deploy-production-final.sh
```

### Start Development
```bash
./scripts/docker-dev.sh
```

### Check Health
```bash
./scripts/check-services.sh
```

### Seed Data
```bash
npx tsx scripts/seed-software-data.ts
```

---

**Note**: All scripts assume you're running from the project root directory.
