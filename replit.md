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
- ✅ GitHub API integration implemented
- ✅ TypeScript errors fixed
- ✅ Frontend working with live GitHub data
- ✅ Categories, software cards, and download functionality implemented

## Development Guidelines
- Follow modern web application patterns
- Maximize frontend functionality, minimize backend complexity
- Use Drizzle ORM for all database operations
- Implement proper error handling and validation
- Maintain separation between client and server code

## Recent Changes
- **2025-01-14**: Successfully migrated project from Replit Agent environment
- **2025-01-14**: Created PostgreSQL database and configured environment variables
- **2025-01-14**: Implemented GitHub REST API integration with rate limiting
- **2025-01-14**: Added category-based software grouping and filtering
- **2025-01-14**: Implemented download functionality for GitHub releases
- **2025-01-14**: Created modern UI with software cards, star ratings, and pagination
- **2025-01-14**: Added Popular Software, Recent Software, and Latest Software sections

## Next Steps
1. ✅ Migration completed successfully
2. ✅ GitHub API integration working
3. ✅ Modern UI implemented with category filtering
4. ✅ Download functionality operational
5. Ready for further development and customization

## User Preferences
- Language: English
- Communication: Technical but accessible
- Focus: Security, performance, and maintainability