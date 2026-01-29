# Database Dumps

This directory contains PostgreSQL database dumps for the Software Hub application.

## Directory Structure

```
database/
├── dumps/              # Database dump files
│   ├── latest.sql     # Symlink to latest full dump
│   ├── software_hub_dump_YYYYMMDD_HHMMSS.sql    # Full database dump (SQL)
│   ├── software_hub_dump_YYYYMMDD_HHMMSS.dump   # Full database dump (Custom format, compressed)
│   ├── schema_YYYYMMDD_HHMMSS.sql               # Schema only
│   └── data_YYYYMMDD_HHMMSS.sql                 # Data only
├── backups/           # Backup files
├── migrations/        # Database migrations
├── init/             # Initialization scripts
└── scripts/          # Database scripts
```

## Latest Export

- **Date**: 2026-01-29 22:23:57
- **Database**: softwarehub
- **Files**:
  - Full dump (SQL): `software_hub_dump_20260129_222356.sql`
  - Full dump (Custom): `software_hub_dump_20260129_222356.dump`
  - Schema only: `schema_20260129_222356.sql`
  - Data only: `data_20260129_222356.sql`

## How to Restore

### Restore from SQL dump:
```bash
psql -h localhost -U postgres -d postgres < dumps/latest.sql
```

### Restore from custom format dump:
```bash
pg_restore -h localhost -U postgres -d softwarehub -c dumps/software_hub_dump_*.dump
```

### Restore schema only:
```bash
psql -h localhost -U postgres -d softwarehub < dumps/schema_*.sql
```

### Restore data only:
```bash
psql -h localhost -U postgres -d softwarehub < dumps/data_*.sql
```

## Notes

- The `latest.sql` symlink always points to the most recent full dump
- Custom format dumps are compressed and can be restored with pg_restore
- Schema dumps contain only table structures, no data
- Data dumps contain only INSERT statements, no schema

## Automated Export

To export database regularly, run:
```bash
./scripts/export-database.sh
```

Or set up a cron job:
```bash
# Export database every day at 2 AM
0 2 * * * cd /path/to/software_hub && ./scripts/export-database.sh >> logs/db-export.log 2>&1
```
