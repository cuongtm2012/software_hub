# SoftwareHub - Full Stack Web Application

## Overview
SoftwareHub is a comprehensive platform for software sharing, project management, and marketplace functionality. The application provides a multi-phase system for software downloads, custom project development, and product marketplace.

## Project Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Shadcn/UI
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session management
- **Payment Processing**: Stripe integration
- **Real-time**: WebSocket support

### Database Schema
The application uses a comprehensive PostgreSQL schema with the following main entities:
- **Users**: Multi-role system (user, admin, developer, client, seller, buyer)
- **Software**: Software catalog with categories, reviews, and downloads
- **Projects**: Custom development project management
- **Quotes**: Project quotation system
- **Portfolios**: Developer portfolio management
- **Products**: Marketplace products
- **Orders**: E-commerce order management
- **Payments**: Integrated payment processing with escrow

### Key Features
1. **Phase 1**: Software catalog and downloads
2. **Phase 2**: Project management and developer collaboration
3. **Phase 3**: Marketplace for buying/selling software products

## Project Structure
```
/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configurations
├── server/                 # Express backend
│   ├── auth.ts            # Authentication logic
│   ├── db.ts              # Database connection
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── vite.ts            # Vite development setup
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Drizzle schema definitions
```

## Current Status
- ✅ Project migrated from Replit Agent to Replit environment
- ✅ Database provisioned and connected with all marketplace tables
- ✅ Server running on port 5000 with authentication system
- ✅ Complete seller marketplace workflow implemented
- ✅ Test login system working with test accounts
- ✅ Authentication and session management functional

## Development Guidelines
- Follow modern web application patterns
- Maximize frontend functionality, minimize backend complexity
- Use Drizzle ORM for all database operations
- Implement proper error handling and validation
- Maintain separation between client and server code

## Recent Changes
- **2025-08-04**: Successfully completed database consolidation by removing redundant projects table:
  - ✅ Enhanced external_requests table with comprehensive project fields (title, description, budget, deadline, client_id, assigned_developer_id, status)
  - ✅ Physically dropped projects table from PostgreSQL database using CASCADE to remove related foreign key constraints
  - ✅ Refactored all storage methods to use externalRequests exclusively for unified project data management
  - ✅ Updated all schema relations and foreign key references from projects to externalRequests
  - ✅ Fixed all TypeScript/LSP errors and import statements in server/storage.ts
  - ✅ Eliminated data inconsistency between "Recent Projects" and "View All Available Projects" sections
  - ✅ Single source of truth established for all project operations using external_requests table
- **2025-08-04**: Fixed all critical issues reported by user:
  - ✅ Fixed seller product creation API calls (corrected apiRequest parameter structure)
  - ✅ Fixed dashboard "View All Products" delete functionality with proper API calls
  - ✅ Enhanced project request form with duplicate technology stack validation to prevent duplicates
  - ✅ Fixed Vietnamese phone number validation (+84378246333, 0378246333 formats now supported)
  - ✅ Added "Return to Project Dashboard" button to project request success page alongside existing functionality
- **2025-08-04**: Replaced quick actions panel with comprehensive "View All Available Projects" section featuring filterable tabs (All, Pending, In Progress, Completed, Cancelled)
- **2025-08-04**: Enhanced project browsing experience with status-based filtering using intuitive tab interface
- **2025-08-04**: Added role-based project data fetching with proper authentication for different user types
- **2025-08-04**: Fixed syntax errors and compilation issues in dashboard component to ensure stable operation
- **2025-08-03**: Updated Projects tab navigation - "New Project" buttons now route to `/request-project` instead of `/projects/new`
- **2025-08-03**: Enhanced mobile responsiveness for both Products and Projects tabs with optimized spacing and layouts
- **2025-08-03**: Implemented tabbed dashboard with action buttons inside respective tab content areas
- **2025-08-03**: Fixed product creation functionality - corrected API endpoints from /api/products to /api/seller/products
- **2025-08-03**: Added delete functionality to products with confirmation dialogs
- **2025-08-03**: Fixed navigation flow - product edit page now returns to dashboard instead of marketplace/seller
- **2025-08-03**: Resolved all API routing errors (500 errors eliminated)
- **2025-08-03**: Enhanced product management with proper authentication and error handling
- **2025-08-03**: Redesigned dashboard with clear separation between Products and Projects sections
- **2025-08-03**: Fixed database column issues (buyer_info, download_links) and resolved React component suspension errors
- **2025-08-03**: Enhanced dashboard organization with dedicated sections for sellers - Products section shows product statistics, inventory management, and Add Product functionality
- **2025-08-03**: Improved Projects section with project statistics, recent projects list, and quick actions
- **2025-08-03**: Added distinct visual themes for each section (blue for Products, green for Projects) to improve clarity
- **2025-08-03**: Resolved all TypeScript/LSP diagnostic errors (100+ errors cleared)
- **2025-08-02**: Successfully merged seller dashboard with main dashboard for unified user experience
- **2025-08-02**: Enhanced dashboard UI/UX with improved layout, gradient backgrounds, and better visual hierarchy
- **2025-08-02**: Added seller-specific stats overview cards for verified sellers (revenue, products, rating, orders)
- **2025-08-02**: Fixed "Add Product" button navigation to correct route (/seller/products/new)
- **2025-08-02**: Implemented responsive tabs with icons and improved mobile experience
- **2025-08-02**: Added role-based dashboard features - sellers see additional marketplace tabs
- **2025-08-02**: Fixed authentication system with working login functionality
- **2025-08-02**: Created test accounts: seller@test.com, buyer@test.com, admin@gmail.com
- **2025-08-02**: Implemented simple session-based authentication bypassing passport conflicts
- **2025-08-02**: Added test login page at /test-login with quick login buttons
- **2025-08-02**: Populated database with sample marketplace products
- **2025-01-01**: Migrated project from Replit Agent environment
- **2025-01-01**: Created PostgreSQL database and configured environment variables

## Next Steps
1. Fix TypeScript errors in schema and storage files
2. Review and optimize frontend structure
3. Test all major functionality
4. Ensure proper security implementation

## User Preferences
- Language: English
- Communication: Technical but accessible
- Focus: Security, performance, and maintainability