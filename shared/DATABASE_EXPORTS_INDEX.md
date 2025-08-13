# SoftwareHub Database Exports Index

## Latest Export (August 13, 2025)

### Complete Export Set
- **complete_database_dump_20250813_042000.sql** - Full database backup
- **schema_dump_20250813_042012.sql** - Schema structure only  
- **data_only_dump_20250813_042016.sql** - Data only
- **full_database_with_cleanup_20250813_042021.sql** - Full backup with cleanup
- **database_export_summary_20250813_042031.md** - Detailed export documentation

## Previous Exports

### August 10, 2025
- **complete_database_export_20250810_113452.sql**
- **full_database_dump_20250810_113321.sql** 
- **postgresql_full_dump_20250810_113452.sql**

### August 4, 2025
- **data_export.sql**
- **full_database_export.sql**
- **schema_export.sql**

## Documentation Files
- **database_export_readme.md** - General export information
- **export_summary.md** - Previous export summary
- **environment_variables_guide.md** - Environment setup guide
- **DATABASE_EXPORTS_INDEX.md** - This index file

## Current Database Statistics (Latest Export)
- **29 Tables** with complete schema
- **355+ Live Rows** across all tables
- **Active Development Data** including users, products, orders
- **85 Software Items** in catalog
- **28 Chat Messages** and real-time features
- **16 Orders** with payment processing

## Quick Reference

### For Complete Restoration:
```bash
psql -d new_database -f complete_database_dump_20250813_042000.sql
```

### For Schema Only:
```bash  
psql -d empty_database -f schema_dump_20250813_042012.sql
```

### For Data Import:
```bash
psql -d existing_schema -f data_only_dump_20250813_042016.sql
```

---
**Last Updated**: August 13, 2025 04:20 AM  
**Database**: SoftwareHub Development Environment  
**Status**: ✅ Complete export set available