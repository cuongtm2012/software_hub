# SoftwareHub Database Export

This folder contains the complete database export for the SoftwareHub application as of 2025-08-04.

## Files Exported

### 1. `schema_export.sql`
- Contains the complete database schema (tables, columns, indexes, constraints, types)
- Schema-only export without data
- Can be used to recreate the database structure

### 2. `data_export.sql`  
- Contains all data from all tables
- Uses INSERT statements for easy import
- Data-only export without schema

### 3. `full_database_export.sql`
- Complete database export including both schema and data
- Single file containing everything needed to recreate the database

## Database Overview

### Main Tables
- **users**: User accounts with roles (user, admin, developer, client, seller, buyer)
- **external_requests**: Project requests (consolidated from projects table)
- **products**: Marketplace products
- **orders**: Product orders and transactions
- **payments**: Payment processing and escrow
- **softwares**: Software catalog
- **categories**: Software categories
- **portfolios**: Developer portfolios
- **quotes**: Project quotations
- **reviews**: Various review types (software, product, portfolio)
- **seller_profiles**: Seller verification and business info

### Authentication System
- Session-based authentication using express-session
- Role-based access control
- Admin users have full access to admin dashboard

### Key Features
- **Phase 1**: Software catalog and downloads
- **Phase 2**: Project management and developer collaboration  
- **Phase 3**: Marketplace for buying/selling software products

## Import Instructions

To restore the database:

```bash
# Schema only
psql your_database < schema_export.sql

# Data only (after schema is created)
psql your_database < data_export.sql

# Complete restore (schema + data)
psql your_database < full_database_export.sql
```

## Database Statistics
- **Total Tables**: 20+ tables
- **User Roles**: 6 different roles (user, admin, developer, client, seller, buyer)
- **Main Features**: Authentication, Software Catalog, Project Management, Marketplace, Payments

## Test Accounts
- **Admin**: admin@gmail.com / abcd@1234
- **Seller**: seller@test.com / testpassword  
- **Buyer**: buyer@test.com / testpassword

## Recent Changes (2025-08-04)
- Fixed admin authentication and routing issues
- Consolidated projects table into external_requests
- Enhanced role-based dashboard access
- Implemented comprehensive admin user management
- Merged external requests and projects functionality

Export generated on: 2025-08-04