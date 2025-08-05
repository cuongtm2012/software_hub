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

## Microservices Architecture

### Overview
The application now follows a comprehensive microservices architecture with the following services:

1. **Main Application** (Port 5000) - SoftwareHub web application
2. **Email Service** (Port 3001) - SendGrid email handling with retry mechanisms
3. **Chat Service** (Port 3002) - Real-time messaging with Socket.IO and Redis
4. **Notification Service** (Port 3003) - Push notifications with FCM integration
5. **Worker Service** - Background job processing for emails, notifications, and analytics

### Service Communication
- **Email Service**: Integrated into main app with `/api/email/*` endpoints
- **Inter-service Communication**: REST APIs between services
- **Message Queue**: Redis-based queuing for asynchronous processing
- **Real-time**: WebSocket connections handled by Chat Service
- **Data Storage**: PostgreSQL (main), MongoDB (chat), Redis (cache/queue)

### Docker Orchestration
Complete Docker Compose setup with:
- Service networking and load balancing
- Environment variable management
- Volume persistence for databases
- Nginx reverse proxy for routing

### Development vs Production
- **Development**: In-memory implementations for external dependencies
- **Production**: Full Redis, MongoDB, FCM, and SendGrid integrations
- **Scalability**: Each service can be scaled independently

## Recent Changes
- **2025-08-05**: Implemented comprehensive microservices architecture:
  - ✅ Created Email Service with SendGrid integration and retry mechanisms
  - ✅ Built Chat Service with Socket.IO, real-time messaging, and presence management
  - ✅ Developed Notification Service with FCM support and bulk notifications
  - ✅ Implemented Worker Service for background job processing with Redis queues
  - ✅ Added Docker Compose orchestration with PostgreSQL, MongoDB, Redis, and Nginx
  - ✅ Integrated Email Service into main application with `/api/email/*` endpoints
  - ✅ Created comprehensive service architecture with proper error handling and logging
  - ✅ Established inter-service communication patterns and health checks
  - ✅ Set up development environment with in-memory implementations for external dependencies
- **2025-08-04**: Fixed critical admin authentication and routing issue:
  - ✅ Resolved admin login redirect problem - admin users now properly route to /admin dashboard instead of regular user dashboard
  - ✅ Enhanced authentication flow to automatically redirect based on user role (admin → /admin, others → /dashboard)
  - ✅ Fixed auth page redirect logic to handle admin users correctly when already logged in
  - ✅ Added role-based redirect with timeout to ensure proper navigation after login
  - ✅ Backend authentication confirmed working consistently with proper session persistence
- **2025-08-04**: Fixed critical data synchronization issue between "Recent Projects" and "View All Available Projects" sections:
  - ✅ Identified root cause: /api/projects endpoint blocked sellers with 403 error due to role restrictions
  - ✅ Updated dashboard to use unified data source (/api/my-combined-projects) for both sections to ensure synchronization
  - ✅ Added seller role access to /api/projects endpoint for backward compatibility
  - ✅ Fixed database column errors by adding missing columns (title, description, budget, deadline) to external_requests table
  - ✅ Updated all storage methods to use externalRequests table exclusively, eliminating projects table references
  - ✅ Resolved 113 LSP diagnostics and compilation errors across server/storage.ts and server/routes.ts
  - ✅ Both sections now display consistent project data from the unified external_requests table
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