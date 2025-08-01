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
- ✅ Database provisioned and connected
- ✅ Server running on port 5000
- ⚠️ Some TypeScript errors in schema and storage files need fixing
- 📋 Frontend structure needs review

## Development Guidelines
- Follow modern web application patterns
- Maximize frontend functionality, minimize backend complexity
- Use Drizzle ORM for all database operations
- Implement proper error handling and validation
- Maintain separation between client and server code

## Recent Changes
- **2025-01-01**: Migrated project from Replit Agent environment
- **2025-01-01**: Created PostgreSQL database and configured environment variables
- **2025-01-01**: Started Express server successfully on port 5000

## Next Steps
1. Fix TypeScript errors in schema and storage files
2. Review and optimize frontend structure
3. Test all major functionality
4. Ensure proper security implementation

## User Preferences
- Language: English
- Communication: Technical but accessible
- Focus: Security, performance, and maintainability