# SoftwareHub Database Backup Guide

## Quick Access
All database exports are stored in `shared/data-dumps/` directory.

## Available Export Types

### 1. **Complete Database Backup** (Recommended)
- **File Pattern**: `complete_database_dump_YYYYMMDD_HHMMSS.sql`
- **Contains**: Full schema + all data
- **Best For**: Complete backups, migrations, development setup

### 2. **Clean Installation Backup**
- **File Pattern**: `full_database_with_cleanup_YYYYMMDD_HHMMSS.sql`
- **Contains**: Schema + data with DROP statements
- **Best For**: Fresh installations, overwriting existing databases

### 3. **Schema Only Backup**
- **File Pattern**: `schema_dump_YYYYMMDD_HHMMSS.sql`
- **Contains**: Database structure only
- **Best For**: Setting up empty databases with correct structure

### 4. **Data Only Backup**
- **File Pattern**: `data_only_dump_YYYYMMDD_HHMMSS.sql` 
- **Contains**: All data without schema
- **Best For**: Data migration to existing databases

## Restoration Commands

```bash
# Complete restoration
psql $DATABASE_URL < shared/data-dumps/complete_database_dump_[timestamp].sql

# Clean installation (removes existing data first)
psql $DATABASE_URL < shared/data-dumps/full_database_with_cleanup_[timestamp].sql

# Schema only
psql $DATABASE_URL < shared/data-dumps/schema_dump_[timestamp].sql

# Data only (requires existing compatible schema)
psql $DATABASE_URL < shared/data-dumps/data_only_dump_[timestamp].sql
```

## Database Schema Summary

- **Core Platform**: 15+ tables for users, software, categories, reviews
- **Project Management**: External requests, quotes, portfolios, messaging
- **Marketplace**: Products, orders, payments, seller profiles
- **Support Systems**: Tickets, analytics, notifications
- **Real-time Features**: User presence, notifications

## Environment Variables Required
```
DATABASE_URL=postgresql://username:password@host:port/database
```

## Backup Schedule Recommendation
- **Production**: Daily automated backups
- **Development**: Weekly or before major changes
- **Testing**: Before deployment or major updates

## File Management
- Keep at least 7 days of backups
- Archive monthly backups for historical reference
- Test restoration procedures regularly