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
- **Docker Orchestration**: Complete microservices architecture with Docker containers for all services, including health checks, security hardening, and volume persistence.
- **Containerization Features**: Multi-stage Docker builds, non-root users, health monitoring, network isolation, and production-ready security configurations.
- **UI/UX Decisions**: Emphasizes a modern, component-based design using Shadcn/UI and Tailwind CSS for a consistent and responsive user experience. The dashboard is organized with clear sections, visual themes, and role-based features. Page breadcrumbs are consistently implemented.
- **Development Guidelines**: Focus on modern web application patterns, maximizing frontend functionality, minimizing backend complexity, using Drizzle ORM, implementing proper error handling and validation, and maintaining separation between client and server code.
- **Product Management Features**: Includes JIRA-style product cloning with immediate duplication, unified API for product details, and integrated seller dashboard functionality. Cloudflare R2 is integrated for file storage.
- **Deployment Strategy**: Full Docker containerization with production and development environments, automated deployment scripts, and comprehensive monitoring.

### Key Features
- **Software Catalog and Downloads**: Core functionality for software distribution.
- **Project Management**: Tools for custom development projects, including quotation and collaboration.
- **Marketplace**: Functionality for buying and selling software products with e-commerce detailed product pages and shopping cart.
- **User Management**: Multi-role system (user, admin, developer, client, seller, buyer).
- **Real-time Communication**: Admin chat management and real-time messaging.
- **Notifications**: Push notification system for various user activities (integrated Firebase Cloud Messaging).

## External Dependencies

- **Stripe**: For payment processing and escrow functionality.
- **SendGrid**: For email sending services (configured with `cuongeurovnn@gmail.com` as verified sender).
- **Socket.IO**: For real-time bi-directional communication (used in Chat Service).
- **Redis**: Used for caching, message queuing, and real-time chat data.
- **FCM (Firebase Cloud Messaging)**: For push notifications (integrated with Firebase Admin SDK and VAPID key).
- **PostgreSQL**: Relational database.
- **MongoDB**: NoSQL database.
- **Nginx**: Used as a reverse proxy for Docker orchestration.
- **Cloudflare R2**: For file storage.

## Docker Infrastructure

### Container Architecture
- **Multi-stage builds** for optimized production images with security hardening
- **Health checks** and automatic restart policies for all services
- **Non-root users** and proper permission management
- **Network isolation** with custom Docker networks
- **Volume persistence** for data storage with backup integration

### Deployment Configuration
- **Production deployment**: Automated via `./scripts/docker-deploy.sh`
- **Development environment**: Hot reloading via `./scripts/docker-dev.sh` 
- **Cleanup operations**: Comprehensive cleanup via `./scripts/docker-clean.sh`
- **Environment management**: Template-based configuration with `.env.docker`
- **Data migration**: Automatic database initialization from `shared/data-dumps/`

### Service Ports
- Main Application: 5000
- Email Service: 3001
- Chat Service: 3002  
- Notification Service: 3003
- Worker Service: 3004
- PostgreSQL: 5432
- Redis: 6379
- MongoDB: 27017
- Nginx: 80/443