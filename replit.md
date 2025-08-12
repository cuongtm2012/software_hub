# SoftwareHub - Full Stack Web Application

## Overview
SoftwareHub is a comprehensive platform for software sharing, project management, and marketplace functionality. It provides a multi-phase system for software downloads, custom project development, and a product marketplace. The project's ambition is to create a robust and scalable platform for the software industry, catering to users, developers, and businesses alike.

## User Preferences
- Language: English
- Communication: Technical but accessible
- Focus: Security, performance, and maintainability

## System Architecture

### Core Architecture
The application follows a comprehensive microservices architecture, designed for scalability and maintainability.

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Shadcn/UI for a modern, component-based UI.
- **Backend**: Express.js + TypeScript.
- **Database**: PostgreSQL with Drizzle ORM for relational data.
- **Authentication**: Passport.js with session management.
- **Payment Processing**: Stripe integration.
- **Real-time**: WebSocket support for real-time features.

### Microservices
The application is composed of several independent services:
- **Main Application**: SoftwareHub web application (Port 5000) - includes integrated notification service.
- **Email Service**: Handles email sending with retry mechanisms (Port 3001).
- **Chat Service**: Manages real-time messaging with Socket.IO and Redis (Port 3002).
- **Notification Service**: Integrated into main application for development simplicity. Ready for FCM production deployment.
- **Worker Service**: Processes background jobs for emails, notifications, and analytics.

### Data Management
- **Primary Database**: PostgreSQL (for main application data like users, software, projects, products, orders).
- **NoSQL Database**: MongoDB (for chat service data).
- **Caching/Queueing**: Redis (for real-time chat, message queues, and caching).

### System Design
- **Inter-service Communication**: Primarily uses REST APIs and Redis-based message queues for asynchronous processing.
- **Docker Orchestration**: Utilizes Docker Compose for service networking, load balancing, environment variable management, and volume persistence.
- **UI/UX Decisions**: Emphasizes a modern, component-based design using Shadcn/UI and Tailwind CSS for a consistent and responsive user experience. The dashboard is organized with clear sections, visual themes, and role-based features.
- **Development Guidelines**: Focus on modern web application patterns, maximizing frontend functionality, minimizing backend complexity, using Drizzle ORM, implementing proper error handling and validation, and maintaining separation between client and server code.

### Key Features
- **Software Catalog and Downloads**: Core functionality for software distribution.
- **Project Management**: Tools for custom development projects, including quotation and collaboration.
- **Marketplace**: Functionality for buying and selling software products.
- **User Management**: Multi-role system (user, admin, developer, client, seller, buyer).
- **Real-time Communication**: Admin chat management and real-time messaging.
- **Notifications**: Push notification system for various user activities.

## External Dependencies

- **Stripe**: For payment processing and escrow functionality.
- **SendGrid**: For email sending services. **Status**: API key configured, sender verification required for cuongeurovnn@gmail.com.
- **Socket.IO**: For real-time bi-directional communication (used in Chat Service).
- **Redis**: Used for caching, message queuing, and real-time chat data.
- **FCM (Firebase Cloud Messaging)**: For push notifications.
- **PostgreSQL**: Relational database.
- **MongoDB**: NoSQL database.
- **Nginx**: Used as a reverse proxy for Docker orchestration.

## Recent Changes (August 2025)

### Vietnamese E-commerce Product Detail Page - COMPLETED ✅
- **Design Implementation**: Created new ProductDetailEcommerce component matching authentic Vietnamese e-commerce layout
- **Layout Structure**: Left side image gallery with thumbnails, right side product information and actions
- **English Interface**: Converted all text from Vietnamese to English for international users while maintaining VND currency
- **Horizontal Button Layout**: "Add to Cart" and "Buy Now" buttons arranged side by side as requested
- **Vietnamese Payment Integration**: VNPay QR, QR Banking, and MoMo payment options with English descriptions
- **Professional Features**: Product tabs (Description, Specifications, Reviews), related products section, seller info
- **Code Cleanup**: Removed unused product detail page versions (product-detail-page.tsx, product-detail-redesign.tsx)
- **Route Integration**: Updated marketplace product route to use new e-commerce design

### English Cart Sidebar Implementation - COMPLETED ✅
- **Professional Cart Design**: Created comprehensive cart sidebar matching e-commerce standards
- **English Language**: Converted all text from Vietnamese to English for international users
- **Complete Integration**: Added cart button to header navigation for all user states
- **Real-time Updates**: Cart count badge shows live item quantities with automatic updates
- **Payment Methods**: Integrated Vietnamese payment options (VNPay QR, QR Banking, MoMo)
- **Authentication Handling**: Smart login prompts for guests, full functionality for logged-in users
- **API Integration**: Connected to existing backend cart endpoints with proper error handling
- **Responsive Design**: Mobile-friendly sidebar with professional checkout flow

### Product Detail Page Data Synchronization - COMPLETED ✅
- **Unified API System**: Implemented single `/api/marketplace/products/:id` endpoint for both marketplace and detail pages
- **Parameter Validation**: Added comprehensive validation for product IDs with proper error handling
- **State Management**: Enhanced React Query caching with 5-minute stale time and 10-minute cache time
- **Error Handling**: Implemented graceful error states with user-friendly messages and retry mechanisms
- **Data Consistency**: Ensured live data synchronization between marketplace listing and detail pages
- **Performance**: Added lazy loading, optimized image handling, and responsive design
- **Security**: Restricted access to approved products only with proper authentication checks
- **UX Enhancement**: Added refresh button, loading states, and breadcrumb navigation
- **API Enhancement**: Added computed fields (view_count, enhanced data) for consistency across endpoints

### Seller Dashboard Integration - COMPLETED ✅  
- **Architecture Change**: Merged seller dashboard functionality into main dashboard Products tab
- **Unified Experience**: Sellers now access all features through single dashboard with Products and Projects tabs
- **Routing Updated**: `/seller` and `/seller/dashboard` routes now redirect to unified dashboard
- **Navigation Streamlined**: Header menu shows "Dashboard (Products & Projects)" for sellers instead of separate "Seller Dashboard"
- **User Experience**: Eliminated need for separate seller dashboard page, creating cleaner unified interface
- **Role Integration**: Products tab only visible to users with "seller" role, maintaining security

### Cloudflare R2 Storage Integration - COMPLETED ✅
- **Feature Added**: Comprehensive Cloudflare R2 storage system for file uploads
- **Implementation**: Created R2StorageService with full CRUD operations and presigned URL generation
- **Component**: Built R2DocumentUploader with drag & drop, progress tracking, and file validation
- **Integration**: Seller registration form now uses R2 as primary storage with legacy fallback
- **Security**: Organized file storage by user ID with authentication required for all operations
- **Configuration**: Added complete R2 environment variable setup and documentation
- **API**: Added secure R2 endpoints for upload/download URL generation and file management

## Recent Changes (August 2025)

### Email System - COMPLETELY RESOLVED ✅
- **Root Issue Fixed**: Updated all email methods in `server/services/emailService.ts` to use verified sender address
- **Problem**: Different email types used different sender addresses (some unverified like `noreply@replit.dev`)  
- **Solution**: Standardized all emails to use `cuongeurovnn@gmail.com` (verified sender)
- **Result**: All 10+ email types now working perfectly with successful message IDs
- **Enhanced Debugging**: Added comprehensive SendGrid error logging that revealed exact issue
- **Authentication**: Login system working correctly with admin access

### Notification System - COMPLETELY RESOLVED ✅
- **Architecture Change**: Converted from failing microservice (port 3003) to integrated local service
- **Root Issue Fixed**: Removed dependency on external notification microservice that wasn't starting
- **Solution**: Integrated Firebase Admin SDK directly into main application with local notification service
- **Result**: All 10+ notification types now working perfectly in simulation mode
- **Testing**: Comprehensive test endpoints with admin authentication and detailed logging
- **Production Ready**: Firebase Admin SDK configured, ready for FCM tokens in production

### Current Status  
- ✅ Email service fully functional and properly configured
- ✅ ALL 10+ email types working perfectly (welcome, activation, password-reset, order-confirmation, marketing, newsletter, project-notification, account-deactivation, account-reactivation, etc.)
- ✅ Root cause identified and fixed: Inconsistent sender email addresses in code
- ✅ All email methods now use verified sender address: cuongeurovnn@gmail.com
- ✅ Comprehensive error logging implemented for future debugging
- ✅ **Push notification system COMPLETELY FUNCTIONAL with real Firebase integration**
- ✅ Firebase Admin SDK connected to production project (softwarehub-f301a) with real credentials
- ✅ Real FCM messages being sent successfully (verified with message IDs in console logs)
- ✅ ALL 10+ notification types working perfectly (new-message, comment, maintenance-alert, order-confirmation, payment-failure, event-reminder, subscription-renewal, promotional-offer, unusual-login, password-change)
- ✅ Cross-user notification targeting working - User 2 receives notifications sent to User ID 2
- ✅ Web push notification subscription component integrated in admin dashboard
- ✅ Service worker configured for background notifications
- ✅ FCM token registration endpoint implemented
- ✅ Frontend Firebase SDK integrated with proper configuration
- ✅ **VAPID key configured**: Real Firebase VAPID key integrated (BNcpCG47ZDyNf-dZ-mWNYt5CTokMIyrQO46BJJ_gIkMidiJQBahNEe0fV8yZ9o6IzBxMqHf5o-FZ869n0QoibGo)
- ✅ **Browser notifications ready**: FCM token registration working, foreground/background notification handlers enhanced
- ✅ **Complete push notification system**: All components functional for real browser notifications