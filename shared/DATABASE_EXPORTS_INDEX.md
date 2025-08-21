# Database Exports Index

## Latest Exports (August 21, 2025)

### Available Files
1. **schema_dump_20250821_155252.sql** (57KB) - Database structure only
2. **data_only_dump_20250821_155257.sql** (63KB) - Data without structure  
3. **complete_database_dump_20250821_155301.sql** (120KB) - Complete backup
4. **full_database_with_cleanup_20250821_155312.sql** (134KB) - Clean install backup

### Quick Restore Commands
```bash
# Full restoration (recommended)
psql $DATABASE_URL < shared/data-dumps/complete_database_dump_20250821_155301.sql

# Clean installation (removes existing first)
psql $DATABASE_URL < shared/data-dumps/full_database_with_cleanup_20250821_155312.sql
```

### Export Statistics
- **Total Tables**: 20+
- **Total Records**: Multiple thousands across all tables
- **Schema Version**: Latest (includes all marketplace, review, and project management features)
- **Data Integrity**: Verified ✅

### What's Included
- Complete user system with multiple roles
- Software catalog with platform filtering
- Review and rating system (recently fixed)
- Marketplace with products and orders
- Project management system
- Real-time notifications
- Payment tracking
- Support ticket system

### Backup Quality
- No truncated data
- All foreign key relationships preserved
- Indexes and constraints included
- Compatible with current application version

See `DATABASE_BACKUP_README.md` for detailed instructions.