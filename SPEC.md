# Software Hub - Product Specification Document

> Generated from source code review (June 2026)

---

## 1. Executive Summary

**Software Hub** is a full-stack multi-tenant platform combining software catalog distribution, digital marketplace, IT service management (freelance/project outsourcing), and educational course listings. Built with React + Express + PostgreSQL + Redis/MongoDB microservices architecture.

**Status**: Active development / production-ready monolith with optional microservices.

---

## 2. Architecture

### 2.1. Deployment Models

| Model | Container Layout | When To Use |
|---|---|---|
| **Monolith** (default) | Single `app` container + Postgres + Redis | Development, low-traffic production |
| **Full Microservices** | app + email-service + chat-service + notification-service + worker-service + payment-service + gateweaver | High traffic, team separation |
| **Monolith + Gateweaver** | app + gateweaver + all microservices | Production with API gateway |

### 2.2. Tech Stack

**Frontend**
- React 18 + TypeScript + Vite 5
- TailwindCSS 3 + shadcn/ui (Radix UI primitives)
- Wouter (lightweight routing)
- TanStack Query (data fetching)
- Framer Motion (animations)
- Firebase SDK (push notifications, messaging)
- Uppy (file uploads)
- Stripe / VietQR (payments)
- Recharts (analytics)

**Backend**
- Node.js 20 + Express (TypeScript via tsx)
- Drizzle ORM (PostgreSQL)
- Redis (session cache, message queue)
- MongoDB (chat history)
- Socket.IO (real-time chat)
- Passport.js (local/OAuth auth)
- SendGrid / Resend (email)
- Firebase Admin SDK (push notifications)
- Stripe API (payment processing)
- AWS S3 / Cloudflare R2 (file storage)

**DevOps**
- Docker + Docker Compose (multi-stage builds)
- nginx (reverse proxy)
- GitHub Actions (CI/CD)

---

## 3. Database Schema (PostgreSQL)

### 3.1. Core Tables (22+ tables via Drizzle ORM)

**Users & Auth**
| Table | Purpose | Key Fields |
|---|---|---|
| `users` | User accounts | id, name, email, password, role, profile_data, email_verified, reset_token |
| `seller_profiles` | Marketplace seller verification | user_id, business_name, tax_id, verification_status, commission_rate |

**Software Catalog**
| Table | Purpose | Key Fields |
|---|---|---|
| `categories` | Software categories (hierarchical) | id, name, parent_id |
| `softwares` | Software/API listings | name, description, type (software|api), category_id, platform[], download_link, status |
| `reviews` | Software reviews | user_id, target_type, target_id, rating, comment |
| `courses` | IT learning courses | title, topic, youtube_url, playlist_id, level, language |
| `user_downloads` | Download tracking | user_id, software_id, version |

**Project Management**
| Table | Purpose | Key Fields |
|---|---|---|
| `external_requests` | Unified project requests | name, email, title, project_description, budget, status, client_id, assigned_developer_id |
| `quotes` | Developer quotes for projects | project_id, developer_id, price, timeline_days, deliverables[], deposit_amount |
| `messages` | Project communication | project_id, sender_id, content |
| `portfolios` | Developer portfolios | developer_id, title, images[], demo_link, technologies[] |
| `portfolio_reviews` | Portfolio ratings | portfolio_id, user_id, rating |

**Marketplace**
| Table | Purpose | Key Fields |
|---|---|---|
| `products` | Digital products for sale | seller_id, title, price, price_type, stock_quantity, images[], pricing_rows, status |
| `orders` | Purchase orders | buyer_id, seller_id, status, total_amount, commission_amount, payment_method |
| `order_items` | Order line items | order_id, product_id, quantity, price |
| `payments` | Payment records | order_id, project_id, amount, payment_method, status, escrow_release |
| `cart_items` | Shopping cart | user_id, product_id, quantity |
| `support_tickets` | Post-purchase support | order_id, buyer_id, seller_id, subject, status |
| `product_reviews` | Product ratings | order_id, product_id, buyer_id, rating |
| `sales_analytics` | Seller analytics | seller_id, product_id, date, revenue, units_sold |

**IT Services (Phase 3)**
| Table | Purpose |
|---|---|
| `service_requests` | Client service requests |
| `service_quotations` | Admin quotations with pricing/deliverables |
| `service_projects` | In-progress service projects with milestones |
| `service_payments` | Deposit/final payments for services |

**Chat**
| Table | Purpose |
|---|---|
| `chat_rooms` | Direct/group chat rooms |
| `chat_room_members` | Room membership |
| `chat_messages` | Chat messages (also stores in MongoDB) |
| `user_presence` | Online/offline status |

**Notifications**
| Table | Purpose |
|---|---|
| `notifications` | In-app notifications |
| `fcm_tokens` | Firebase Cloud Messaging push tokens |

---

## 4. API Structure

### 4.1. Route Map

| Prefix | Module | Type | Description |
|---|---|---|---|
| `/api/login` | Auth | Inline | Login (hardcoded test passwords) |
| `/api/register` | Auth | Inline | Email-only registration with verification |
| `/api/logout` | Auth | Inline | Session destroy |
| `/api/user` | User | Inline | Current user / dev auto-login |
| `/api/forgot-password` | Auth | Inline | Password reset flow |
| `/api/reset-password` | Auth | Inline | Token-based reset |
| `/api/quick-login/seller|buyer` | Demo | Test account quick login |
| `/api/auth/*` | OAuth | Router | Google/Facebook OAuth routes |
| `/api/reviews/*` | Reviews | Router | Software reviews CRUD |
| `/api/seller/*` | Seller | Router | Seller dashboard & management |
| `/api/buyer/*` | Buyer | Router | Buyer dashboard |
| `/api/notifications/*` | Notifications | Router | In-app & push notifications |
| `/api/chat/*` | Chat | Router | Real-time chat endpoints |
| `/api/orders/*` | Orders | Router | Order management |
| `/api/admin/*` | Admin | Router | Admin panels (users, software, projects, queues, tests) |
| `/api/products/*` | Products | Router | Marketplace products CRUD |
| `/api/softwares/*` | Software | Router | Software catalog CRUD |
| `/api/courses/*` | Courses | Router | Course listings |
| `/api/marketplace/*` | Marketplace | Function | Advanced marketplace routes |
| `/api/users/*` | Users | Function | Profile management |
| `/api/payments/*` | Payments | Function | Stripe/VietQR payment processing |
| `/api/services/*` | IT Services | Function | Service request/quotation/project lifecycle |
| `/health` | Health | Inline | Service health check |

### 4.2. Key API Design Notes

- **No real password hashing in `/api/login`** — uses hardcoded plaintext password matching for test accounts. Password in DB is random hex for real accounts.
- **Session-based auth** with express-session (MemoryStore in dev, PostgreSQL store in prod).
- **Dev mode**: `DISABLE_AUTH=true` bypasses auth entirely with mock user.

---

## 5. Frontend (React SPA)

### 5.1. Route Structure

| Path | Page | Access |
|---|---|---|
| `/` | HomePage | Public |
| `/auth` | AuthPageNew | Public |
| `/auth/set-password` | SetPasswordPage | Public (token) |
| `/request-project` | ProjectRequestPage | Public |
| `/software` | SoftwareListPage | Public |
| `/software/:id` | SoftwareDetailPage | Public |
| `/courses` | CoursesListPage | Public |
| `/courses/:id` | CourseDetailPage | Public |
| `/marketplace` | MarketplacePageNew | Public |
| `/marketplace/category/:cat` | MarketplaceCategoryPage | Public |
| `/marketplace/product/:id` | ProductDetailPage | Public |
| `/marketplace/checkout` | CheckoutPageNew | Protected |
| `/portfolios/gallery` | PortfolioGallery | Public |
| `/portfolios/:id` | PortfolioDetailPage | Public |
| `/it-services` | ITServicesPage | Public |
| `/profile` | UserProfilePage | Protected |
| `/dashboard` | DashboardPage | Protected |
| `/seller/*` | Seller pages | Seller/Admin |
| `/buyer` | BuyerDashboardPage | Buyer/User |
| `/admin/*` | Admin pages | Admin only |
| `/test-login` | TestLoginPage | Public |

### 5.2. Shared Components

- `Header` + `Footer` — site-wide layout
- `ShoppingCartSidebar` — slide-over cart
- `FloatingChatButton` — real-time chat widget
- `AppSidebar` — navigation sidebar
- `Pagination`, `StarRating`, `Breadcrumb`, `Stepper`
- `SearchWithAutocomplete` — global search
- `ObjectUploader`, `R2DocumentUploader` — file uploads to R2/S3
- 50+ shadcn/ui components (accordion, dialog, sheet, table, form, etc.)

### 5.3. Custom Hooks

- `use-auth` — auth context + queries
- `use-cart` — shopping cart context
- `use-chat` — real-time chat via Socket.IO
- `use-profile` — user profile management
- `use-toast` — toast notifications
- `use-mobile` — responsive detection

---

## 6. Microservices Architecture

### 6.1. Services Overview

| Service | Language | Port | Purpose | DB Dependencies |
|---|---|---|---|---|
| **app** (monolith) | TypeScript/Node | 5000 | All business logic | PostgreSQL, Redis |
| **email-service** | JavaScript/Node | 3001 | SendGrid/Resend email dispatch | Redis, SendGrid |
| **chat-service** | JavaScript/Node | 3002 | Real-time chat (separate from main app) | MongoDB, Redis |
| **notification-service** | JavaScript/Node | 3003 | FCM push notifications | PostgreSQL, Firebase |
| **worker-service** | JavaScript/Node | — | Background job processing (RedisSMQ) | Redis, email + notification |
| **payment-service** | PHP | — | Legacy NL_Checkoutv3 payment processing | N/A (standalone) |
| **gateweaver** | Go | 8080 | API gateway (replacing APISIX) | None |
| **postgres-backup** | Shell | — | Daily pg_dump + cleanup | PostgreSQL |

### 6.2. Message Queue

- **RedisSMQ** for async email/notification dispatching
- Fallback: monolith queue via Redis (in-app)
- Workers: emailWorker, notificationWorker, chatWorker

### 6.3. Real-Time Communication

- **Socket.IO** (main app) — admin-user chat, presence tracking
- **Socket.IO** (chat-service) — separate chat microservice for scalability
- **Firebase Cloud Messaging** — push notifications to mobile/web

---

## 7. Storage

### 7.1. File Storage

| Provider | Purpose | Notes |
|---|---|---|
| Cloudflare R2 | Primary file storage | S3-compatible, used for product files, course thumbnails |
| AWS S3 | Secondary/backup | Via @aws-sdk/client-s3 |
| Uppy | Client-side uploads | Pre-sign URLs, progress bars, drag-drop |

### 7.2. Session Storage

| Environment | Store | Notes |
|---|---|---|
| Development | MemoryStore | No setup needed |
| Production | PostgreSQL (connect-pg-simple) | `session` table auto-created |
| Alternative | Redis | Via connect-redis |

---

## 8. Security Considerations

### ⚠️ Known Issues (from code review)

1. **Hardcoded passwords in login** (`/api/login` lines 49-53) — plaintext matching, not production grade
2. **No real password hashing** — bcrypt mentioned in README but NOT implemented in code
3. **`DISABLE_AUTH=true` in dev mode** — bypasses all auth, exposes full API
4. **Session MemoryStore in dev** — sessions lost on restart, no persistence
5. **`.env` files committed to git** — contains placeholder secrets
6. **No rate limiting** on auth endpoints (brute force possible)
7. **`cookies.txt` committed** — potentially sensitive data
8. **No input sanitization** beyond Drizzle ORM parameterization
9. **Firebase private keys** in env — must be properly secured in production

### Mitigations In Place

- Drizzle ORM prevents SQL injection
- React XSS protection
- CORS configurable per environment
- HttpOnly + Secure session cookies

---

## 9. DevOps & Deployment

### 9.1. Docker Deployments

| Compose File | Purpose |
|---|---|
| `docker-compose.yml` | Full dev: app + all microservices + gateweaver |
| `docker-compose.dev.yml` | Minimal dev: app + postgres + redis |
| `docker-compose.prod.yml` | Production: app + postgres + redis (minimal) |
| `docker-compose.production.yml` | Full production: all microservices |
| `docker-compose.vps.yml` | VPS-specific deployment |

### 9.2. CI/CD

- GitHub Actions (`deploy.yml`, `deploy-docker.yml`)
- Health check: `GET /health` endpoint
- Automated database backups via cron (postgres-backup container)
- Scripts: `deploy.sh` (interactive), `deploy-vps-docker.sh`

### 9.3. Nginx

- `nginx.conf` — production reverse proxy config
- SSL setup scripts in `scripts/setup-ssl-certificate.sh`
- Domain setup: `scripts/setup-domain.sh`

---

## 10. Data & Seeding

### 10.1. Seed Data Sources

| Source | Description | Script |
|---|---|---|
| Awesome Linux/Windows | Curated software lists | `scripts/parse-awesome-*.ts` |
| Voz forum | Community software reviews | `scripts/scrape-voz-software.ts` |
| Free apps | Open-source/free software catalogue | `scripts/parse-free-apps.ts` |
| IT courses | YouTube-based course listings | `scripts/seed-it-courses.ts` |
| APIs | API listing catalogue | `scripts/parse-apis.ts` |

### 10.2. Database Dumps

- Location: `database/dumps/` and `shared/data-dumps/`
- Format: Full SQL dumps + schema-only + data-only
- Latest: `software_hub_dump_20260129_222356.sql` (~400MB+)

---

## 11. Testing

| Test Type | File | Status |
|---|---|---|
| E2E | `tests/e2e/comprehensive-e2e-test-suite.js` | Written, manual |
| Integration | `tests/integration/` (chat, notification, services) | Partial |
| Manual | `tests/manual/` (chat HTML, test scripts) | For debugging |
| SendGrid direct | `tests/integration/direct-sendgrid-test.js` | Yes |

**Note**: No automated test framework (Jest/Vitest) is configured — tests are run manually via Node.

---

## 12. Phase Roadmap (from Code)

| Phase | Status | Description |
|---|---|---|
| Phase 1 | ✅ Done | Software catalog, categories, reviews, user auth |
| Phase 2 | ✅ Done | Project management, quotes, portfolios, messaging |
| Phase 3 | ✅ Done | Marketplace (products, orders, cart, payments) |
| Phase 4 | 🟡 In Progress | IT Services (requests, quotations, service projects) |
| Phase 5 | 🔄 Evolving | Microservices extraction, gateweaver, FCM push, chat scaling |

---

## 13. Recommendations

### Immediate (High Priority)

1. **Replace hardcoded password matching** with bcrypt/argon2
2. **Remove committed `cookies.txt`** from repo
3. **Add rate limiting** to auth routes (express-rate-limit)
4. **Fix `server/vite.ts`** — referenced but missing from some installs
5. **Clean up duplicate pages** (`marketplace-page.tsx` vs `marketplace-page-new.tsx`)

### Medium Priority

6. **Standardize error handling** — some routes use `next(error)`, others `res.status(500).json()`
7. **Consolidate storage layers** — `storage/` directory has per-domain sub-modules but main `storage.ts` has fallthrough logic
8. **Add proper test framework** (Vitest + Playwright)
9. **Remove unused imports** — many Radix UI components imported but unused
10. **Fix `DISABLE_AUTH` env variable** — has `=*** 'true'` syntax error on line 178

### Low Priority

11. **Deduplicate multiple docker-compose files** into one with profiles
12. **Add OpenAPI/Swagger** documentation
13. **Implement proper password hashing** (already declared in README)

---

## 14. Project Stats

| Metric | Value |
|---|---|
| Total source files | ~180 |
| Frontend pages | ~45 |
| API routes | ~150+ |
| Database tables | 22+ |
| Microservices | 6 |
| Docker containers (full) | 10+ |
| Seed data (software entries) | ~2000+ |
| Scripts | ~50+ |
| Documentation files | ~40 |

---

*Generated from source code by Hermes Agent*
