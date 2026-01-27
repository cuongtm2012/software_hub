# 🚀 Software Hub

A comprehensive platform for software distribution, marketplace, and learning resources.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Development](#development)
  - [Production (Docker)](#production-docker)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## ✨ Features

- **Software Catalog**: Browse and download software applications
- **Marketplace**: Buy and sell digital products
- **Course Platform**: Access learning resources and tutorials
- **User Management**: Authentication with OAuth (Google, Facebook)
- **Reviews & Ratings**: Community feedback system
- **Admin Dashboard**: Comprehensive management interface
- **Multi-language Support**: Vietnamese and English
- **Responsive Design**: Works on all devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **Wouter** for routing
- **TanStack Query** for data fetching
- **Radix UI** for accessible components

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** database
- **Drizzle ORM** for database operations
- **Redis** for caching and sessions
- **Passport.js** for authentication

### DevOps
- **Docker** & **Docker Compose**
- **Multi-stage builds** for optimization
- **Health checks** for reliability

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- PostgreSQL >= 14
- Redis (optional, for sessions)
- Docker & Docker Compose (for production)

### Development

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd software_hub
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.development
# Edit .env.development with your configuration
```

4. **Start development server**

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Production (Docker)

For production deployment using Docker, see our comprehensive guides:

#### Quick Start

```bash
# 1. Copy environment file
cp .env.production.example .env.production

# 2. Edit with your values
nano .env.production

# 3. Deploy using automated script
chmod +x deploy.sh
./deploy.sh
```

#### Manual Deployment

```bash
# Build and start containers
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### Health Check

```bash
curl http://localhost:5000/api/health
```

## 📚 Documentation

### Docker Deployment

- **[DOCKER_README.md](./DOCKER_README.md)** - Quick start guide
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Complete deployment checklist
- **[docs/DOCKER_DEPLOYMENT.md](./docs/DOCKER_DEPLOYMENT.md)** - Detailed deployment guide
- **[docs/DOCKER_ARCHITECTURE.md](./docs/DOCKER_ARCHITECTURE.md)** - Architecture overview

### Development

- **[docs/VIETNAMESE_LOCALIZATION.md](./docs/VIETNAMESE_LOCALIZATION.md)** - Localization guide
- **API Documentation** - Coming soon
- **Component Library** - Coming soon

## 📁 Project Structure

```
software_hub/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities
│   └── public/            # Static assets
│
├── server/                # Backend Node.js application
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── middleware/       # Express middleware
│
├── shared/               # Shared code (types, schemas)
│   └── schema.ts        # Database schema
│
├── docs/                # Documentation
│
├── Dockerfile           # Development Dockerfile
├── Dockerfile.prod      # Production Dockerfile
├── docker-compose.yml   # Development compose
├── docker-compose.prod.yml  # Production compose
├── deploy.sh           # Deployment script
│
└── package.json        # Dependencies and scripts
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server

# Build
npm run build           # Build for production
npm run build:client    # Build client only
npm run build:server    # Build server only

# Production
npm start               # Start production server

# Database
npm run db:push         # Push schema changes to database

# Type checking
npm run check           # Run TypeScript type checking
```

## 🐳 Docker Commands

```bash
# Development
docker-compose up -d                              # Start dev environment
docker-compose down                               # Stop dev environment

# Production
docker-compose -f docker-compose.prod.yml up -d   # Start production
docker-compose -f docker-compose.prod.yml down    # Stop production
docker-compose -f docker-compose.prod.yml logs -f # View logs

# Automated deployment
./deploy.sh                                       # Interactive menu
```

## 🔐 Environment Variables

### Required

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
SESSION_SECRET=your_random_secret_key
NODE_ENV=development|production
```

### Optional

```bash
# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...

# Email
RESEND_API_KEY=...

# Payment
STRIPE_SECRET_KEY=...
VIETQR_API_KEY=...

# Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

See `.env.production.example` for complete list.

## 🧪 Testing

```bash
# Run tests (coming soon)
npm test

# Run tests in watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## 🚢 Deployment

### Docker (Recommended)

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for complete guide.

### Traditional Deployment

1. Build the application
```bash
npm run build
```

2. Set environment variables
```bash
export NODE_ENV=production
export DATABASE_URL=...
export SESSION_SECRET=...
```

3. Start the server
```bash
npm start
```

## 🔒 Security

- **Authentication**: Passport.js with local and OAuth strategies
- **Password Hashing**: bcrypt
- **Session Management**: express-session with Redis
- **CORS**: Configured for production
- **Rate Limiting**: Built-in API rate limiting
- **SQL Injection**: Protected by Drizzle ORM
- **XSS**: React's built-in protection

## 📈 Performance

- **Code Splitting**: Automatic with Vite
- **Lazy Loading**: React.lazy for route components
- **Caching**: Redis for session and data caching
- **CDN**: Static assets can be served via CDN
- **Compression**: gzip enabled
- **Database Indexing**: Optimized queries

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite team for the blazing fast build tool
- All contributors who helped with this project

## 📞 Support

For support, email support@yourdomain.com or join our Slack channel.

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI-powered recommendations
- [ ] Multi-tenant support
- [ ] API rate limiting per user
- [ ] Webhook system
- [ ] GraphQL API

---

**Made with ❤️ by the Software Hub Team**
