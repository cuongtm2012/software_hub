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
- **Main Application**: SoftwareHub web application (Port 5000).
- **Email Service**: Handles email sending with retry mechanisms (Port 3001).
- **Chat Service**: Manages real-time messaging with Socket.IO and Redis (Port 3002).
- **Notification Service**: Manages push notifications (Port 3003).
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

### Email System - COMPLETELY RESOLVED ✅
- **Root Issue Fixed**: Updated all email methods in `server/services/emailService.ts` to use verified sender address
- **Problem**: Different email types used different sender addresses (some unverified like `noreply@replit.dev`)  
- **Solution**: Standardized all emails to use `cuongeurovnn@gmail.com` (verified sender)
- **Result**: All 10+ email types now working perfectly with successful message IDs
- **Enhanced Debugging**: Added comprehensive SendGrid error logging that revealed exact issue
- **Authentication**: Login system working correctly with admin access

### Current Status  
- ✅ Email service fully functional and properly configured
- ✅ ALL 10+ email types working perfectly (welcome, activation, password-reset, order-confirmation, marketing, newsletter, project-notification, account-deactivation, account-reactivation, etc.)
- ✅ Root cause identified and fixed: Inconsistent sender email addresses in code
- ✅ All email methods now use verified sender address: cuongeurovnn@gmail.com
- ✅ Comprehensive error logging implemented for future debugging