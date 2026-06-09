# Software Hub - Product Specification Document

> Generated from source code review | Last updated: June 2026

---

## 1. Executive Summary

**Software Hub** is a full-stack multi-tenant platform combining software catalog distribution, digital marketplace, IT service management (freelance/project outsourcing), educational course listings, and blog/lead capture for go-to-market.

**Architecture:** Monolith-first — single Express app serves API + built React SPA. Optional microservices (email, chat, notification) run under PM2. Primary database, auth, and file storage run on **Supabase** (managed PostgreSQL). Redis + MongoDB run locally on VPS via Docker for queue/chat.

**Status:** Production-deployed (`swhubco.com`). Core marketplace + IT Services + GTM shipped; H1–H4 and M1–M6 implemented locally — backlog còn H5 (ops) và low-priority items.

---

## 2. Architecture

### 2.1. Deployment Models

| Model | Layout | When To Use |
|---|---|---|
| **VPS Monolith** (current prod) | PM2 app :5000 + Docker Redis/Mongo + Supabase cloud | Production (Contabo VPS) |
| **Local Dev** | `npm run dev` (Vite + tsx) + Supabase cloud or local | Development |
| **Full Microservices** (optional) | app + email + chat + notification + worker | High traffic, team separation |

```
Internet → Nginx (80/443) → PM2 app :5000
                              ↓
                    Supabase (DB + Auth + Storage)
                    Docker: Redis + Mongo (local on VPS)
```

### 2.2. Tech Stack

**Frontend**
- React 18 + TypeScript + Vite 5
- TailwindCSS 3 + shadcn/ui (Radix UI primitives)
- Wouter (lightweight routing)
- TanStack Query (data fetching)
- Framer Motion (animations)
- **Supabase JS SDK** — primary auth client (`@supabase/supabase-js`)
- Firebase SDK (push notifications)
- Uppy (file uploads → Supabase Storage)
- Recharts (analytics)
- Google Tag Manager / GA4 (`VITE_GA_MEASUREMENT_ID`)

**Backend**
- Node.js 20 + Express (TypeScript via `tsx` dev, compiled to `dist/server/`)
- Drizzle ORM (PostgreSQL via Supabase)
- **Supabase Auth** — JWT verification server-side (`verifySupabaseToken`)
- Redis (message queue — background jobs, optional fallback)
- Socket.IO (real-time chat in monolith)
- SendGrid / Resend (email via `email-service`)
- Firebase Admin SDK (push notifications via `notification-service`)
- **SePay** (`sepay-pg-node`) — primary payment gateway
- Google Generative AI (`@google/generative-ai`) — chat AI

**Testing**
- Vitest (unit tests — `npm run test`)
- Playwright (e2e — `npm run test:e2e`)

**DevOps**
- PM2 cluster (`ecosystem.config.cjs`) — app + 3 microservices
- Docker Compose (`docker-compose.vps.yml`) — Redis + MongoDB on VPS only
- GitHub Actions (`.github/workflows/deploy.yml`) — CI/CD to Contabo VPS
- nginx reverse proxy + SSL on VPS
- Supabase Studio — database admin UI

---

## 3. Database Schema (PostgreSQL via Supabase)

Schema defined in `shared/schema.ts`, managed with Drizzle Kit (`npm run db:push`).

### 3.1. Core Tables (29 tables)

**Users & Auth**
| Table | Purpose | Key Fields |
|---|---|---|
| `users` | User accounts | id, name, email, password, role, supabase_id, profile_data (JSONB — includes `wallet_balance`), email_verified, reset_token |
| `seller_profiles` | Marketplace seller verification | user_id, business_name, tax_id, verification_status, commission_rate |

**Software Catalog**
| Table | Purpose | Key Fields |
|---|---|---|
| `categories` | Software categories (hierarchical) | id, name, parent_id |
| `softwares` | Software/API listings | name, description, type (software\|api), category_id, platform[], download_link, status |
| `reviews` | Software reviews | user_id, target_type, target_id, rating, comment |
| `courses` | IT learning courses | title, topic, youtube_url, playlist_id, level, language, slug |
| `blog_posts` | Blog articles (GTM) | title, slug, content, status, author_id |
| `leads` | Lead capture forms (GTM) | name, email, phone, source, status |
| `user_downloads` | Download tracking | user_id, software_id, version |

**Project Management**
| Table | Purpose | Key Fields |
|---|---|---|
| `external_requests` | Unified project requests (replaces legacy `projects`) | name, email, title, project_description, budget, status, client_id, assigned_developer_id |
| `quotes` | Developer quotes for projects | project_id, developer_id, price, timeline_days, deliverables[], deposit_amount |
| `messages` | Project communication | project_id, sender_id, content |
| `portfolios` | Developer portfolios | developer_id, title, images[], demo_link, technologies[] |
| `portfolio_reviews` | Portfolio ratings | portfolio_id, user_id, rating |

**Marketplace**
| Table | Purpose | Key Fields |
|---|---|---|
| `products` | Digital products for sale | seller_id, title, price, price_type, stock_quantity, images[], pricing_rows (JSONB), status |
| `orders` | Purchase orders | buyer_id, seller_id, status, total_amount, commission_amount, payment_method, buyer_info |
| `order_items` | Order line items | order_id, product_id, quantity, price |
| `payments` | Payment records | order_id, project_id, amount, payment_method, status, escrow_release, transaction_id |
| `cart_items` | DB cart (**legacy, unused**) | user_id, product_id, quantity — client uses `localStorage` via `useCart` |
| `pending_checkouts` | SePay pending wallet/marketplace checkouts | invoice_number, type, payload (JSONB), expires_at |
| `support_tickets` | Post-purchase support | order_id, buyer_id, seller_id, subject, status, priority |
| `product_reviews` | Product ratings | order_id, product_id, buyer_id, rating |
| `sales_analytics` | Seller analytics | seller_id, product_id, date, revenue, units_sold |

**IT Services**
| Table | Purpose |
|---|---|
| `service_requests` | Client service requests |
| `service_quotations` | Admin quotations with pricing/deliverables |
| `service_projects` | In-progress service projects with milestones |
| `service_payments` | Deposit/final payments for services |

**Chat & Notifications**
| Table | Purpose |
|---|---|
| `chat_rooms` | Direct/group chat rooms |
| `chat_room_members` | Room membership |
| `chat_messages` | Chat messages (also stored in MongoDB via chat-service) |
| `user_presence` | Online/offline status |
| `notifications` | In-app notifications |
| `fcm_tokens` | Firebase Cloud Messaging push tokens |

**Enums:** `role` (user, admin, developer, client, seller, buyer), `order_status` (pending → completed), `product_status`, `payment_status`, etc.

**Wallet:** Stored in `users.profile_data.wallet_balance` (JSONB) — credited via SePay IPN on wallet top-up.

**Client-side cart:** `useCart` hook persists to `localStorage` key `shopping-cart` (not `cart_items` table).

---

## 4. API Structure

Route registration in `server/routes.ts`. 22 route modules under `server/routes/`.

### 4.1. Route Map

| Prefix | Module | Description |
|---|---|---|
| `/api/user` | Inline | Current user from Supabase JWT |
| `/api/register` | Inline | Email-only registration + verification link |
| `/api/logout` | Inline | Stub (client uses Supabase `signOut`) |
| `/api/forgot-password` | Inline | Password reset email flow |
| `/api/reset-password` | Inline | Token-based password reset |
| `/api/auth/*` | `auth.routes.ts` | Profile, downloads, reviews, token validation |
| `/api/reviews/*` | `review.routes.ts` | Software/product/portfolio reviews CRUD |
| `/api/seller/*` | `seller.routes.ts` | Seller dashboard, product CRUD, analytics |
| `/api/buyer/*` | `buyer.routes.ts` | Buyer stats, purchases |
| `/api/notifications/*` | `notification.routes.ts` | Push subscribe, broadcast, FCM tokens |
| `/api/chat/*` | `chat.routes.ts` | Chat rooms, messages |
| `/api/orders/*` | `order.routes.ts` | Order CRUD, status updates |
| `/api/admin/*` | `admin.routes.ts` | Users, software, projects, queues, tests |
| `/api/products/*` | `product.routes.ts` | Marketplace products CRUD, `POST /:id/purchase` |
| `/api/softwares/*` | `software.routes.ts` | Software catalog CRUD, download |
| `/api/courses/*` | `courses.routes.ts` | Course listings, topics, detail by slug |
| `/api/leads/*` | `leads.routes.ts` | Lead capture (public POST), admin management |
| `/api/blog/*` | `blog.routes.ts` | Public blog list/detail, admin CRUD |
| `/api/storage/*` | `upload.routes.ts` | Supabase Storage upload URLs, download |
| `/api/marketplace/*` | `marketplace.routes.ts` | Marketplace product aliases |
| `/api/users/*` | `user.routes.ts` | Profile, external requests, projects |
| `/api/payment/*` | `payment.routes.ts` | **SePay** wallet + checkout + IPN |
| `/api/payments/*` | `payment.routes.ts` | Payment records management |
| `/api/portfolios/*` | `portfolio.routes.ts` | Portfolio CRUD (developer), gallery, reviews |
| `/api/portfolio-reviews/*` | `portfolio.routes.ts` | Portfolio review sub-router |
| `/api/support/tickets/*` | `support.routes.ts` | Support tickets (buyer create, seller/admin update) |
| `/api/service-requests/*` | `service.routes.ts` | IT service request lifecycle |
| `/api/service-quotations/*` | `service.routes.ts` | Admin quotations, client accept/reject |
| `/api/service-projects/*` | `service.routes.ts` | Service project progress (admin) |
| `/sitemap.xml` | `sitemap.routes.ts` | Auto-generated sitemap |
| `/robots.txt` | `sitemap.routes.ts` | Robots file |
| `/health` | Inline | Service health check |

### 4.2. Payment API (SePay)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/payment/initiate` | ✅ | Wallet top-up (min 1.000₫) → SePay checkout form |
| `POST` | `/api/payment/checkout` | ✅ buyer/admin | Marketplace checkout → creates pending order + SePay form |
| `POST` | `/api/payment/ipn` | Public (SePay) | Webhook: `ORDER_PAID` → credit wallet or fulfill order |
| `GET` | `/api/payments` | ✅ | Role-filtered payment list |
| `POST` | `/api/payments` | ✅ | Manual project/order payment record |
| `PUT` | `/api/payments/:id/status` | admin | Update payment status |

**SePay payment methods** (frontend id → SePay):
- `bank-qr` → `BANK_TRANSFER` (VietQR)
- `napas-qr` → `NAPAS_BANK_TRANSFER`

**Invoice formats:** `DEP-{userId}-{timestamp}` (wallet), `ORD-{orderId}-{timestamp}` (marketplace).

**Pending state:** PostgreSQL table `pending_checkouts` (migration `004_pending_checkouts.sql`) — survives server restarts. IPN is source of truth for fulfillment.

**Marketplace checkout flow:**
1. Client posts cart items + buyer info + payment method
2. Server validates products (approved, in stock, same seller), creates `pending` order
3. Returns SePay checkout URL + signed form fields
4. User pays on SePay → IPN marks order `completed`, creates payment record, decrements stock
5. Success redirect → `/marketplace/order-success/:orderId`

### 4.3. Auth Design

**Primary: Supabase JWT**
1. Client (`client/src/lib/supabase.ts`) authenticates via Supabase Auth
2. API calls send `Authorization: Bearer <access_token>` (`getAuthHeaders()`)
3. Server (`server/lib/auth-user.ts`) verifies token via Supabase service key
4. Maps to local `users` row by `supabase_id` or `email`; auto-creates with `role: 'user'` if missing
5. `isAuthenticated` / `hasRole` middleware attach `req.user`

**Roles:** `user`, `admin`, `developer`, `client`, `seller`, `buyer`

**Legacy email flow:** `/api/register` + `/auth/set-password` for non-Supabase registration (verification token in DB).

**Dev bypass:** `DISABLE_AUTH=true` + `MOCK_USER_ROLE` skips auth middleware.

**Rate limiting:** `authRateLimiter` on `/api/register` + `/api/auth/register`; `paymentRateLimiter` on `/api/payment/initiate` and `/api/payment/checkout`; `leadRateLimiter` on `/api/leads`.

---

## 5. Frontend (React SPA)

### 5.1. Route Structure

| Path | Page | Access |
|---|---|---|
| `/` | HomePage | Public |
| `/auth` | AuthPageNew | Public |
| `/auth/set-password` | SetPasswordPage | Public (token) |
| `/request-project` | ProjectRequestPage | Public |
| `/request-project/success` | ProjectRequestSuccessPage | Public |
| `/software` | SoftwareListPage | Public |
| `/software/:idOrSlug` | SoftwareDetailPage | Public |
| `/courses` | CoursesListPage | Public |
| `/courses/:idOrSlug` | CourseDetailPage | Public |
| `/blog` | BlogListPage | Public |
| `/blog/:slug` | BlogDetailPage | Public |
| `/ebook/fullstack-roadmap` | EbookPage | Public |
| `/booking` | BookingPage | Public |
| `/marketplace` | MarketplacePage | Public |
| `/marketplace/category/:category` | MarketplaceCategoryPage | Public |
| `/marketplace/product/:id` | ProductDetailPage | Public (canonical product URL) |
| `/marketplace/:id` | Redirect → `/marketplace/product/:id` | Public (legacy URL preserved) |
| `/marketplace/checkout` | CheckoutPageNew | Protected (login required) |
| `/marketplace/order-success/:orderId` | OrderSuccessPage | Public |
| `/marketplace/orders` | MarketplaceOrdersPage | buyer, admin |
| `/add-funds` | AddFundsPage | Protected |
| `/portfolios/gallery` | PortfolioGallery | Public |
| `/portfolios/new` | PortfolioNewPage | developer, admin |
| `/portfolios/edit/:id` | PortfolioEditPage | developer, admin |
| `/portfolios/:id` | PortfolioDetailPage | Public |
| `/it-services` | ITServicesPage | Public |
| `/services` | ServiceRequestsPage | buyer, user, client, admin |
| `/services/new` | ServiceRequestNewPage | buyer, user, client, admin |
| `/services/:id` | ServiceRequestDetailPage | buyer, user, client, admin |
| `/admin/service-requests` | AdminServiceRequestsPage | admin |
| `/support` | SupportTicketsPage | buyer, user, client, admin |
| `/seller/support` | SellerSupportPage | seller, admin |
| `/profile` | UserProfilePage | Protected |
| `/dashboard` | DashboardPage | Protected |
| `/buyer` | BuyerDashboardPage | buyer, user |
| `/seller/*` | Seller pages | seller, admin |
| `/admin/*` | Admin pages | admin |
| `/test-login` | TestLoginPage | Public |

### 5.2. Design System (`client/src/components/design-system/`)

| Component | Purpose |
|---|---|
| `tokens.ts` | Brand colors: primary `#004080`, accent `#ffcc00`, surface `#f9f9f9` |
| `page-hero.tsx` | Page hero — `default` or `centered` layout, badge, yellow accent phrase |
| `section-panel.tsx` | Card panel with titled header + optional action slot |
| `main-tabs.tsx` | Branded tab layout wrapping Radix Tabs |

**CSS utilities** (`client/src/index.css`): `uupm-card`, `uupm-interactive`, `uupm-focus`

### 5.3. Dashboard Components (`client/src/components/dashboard/`)

Refactored dashboard architecture:
- `dashboard-shell.tsx`, `metric-card.tsx`, `section-panel` integration
- `products-tab.tsx`, `projects-tab.tsx` — tab content
- `use-dashboard-data.ts` — shared data hook
- `format.ts` — `formatVnd()`, `formatDateVi()`, helpers

### 5.4. Shared Components

- `Header` + `Footer` — site-wide layout
- `GlobalCartSidebar` + `CartTrigger` (`cart-sidebar.tsx`) — unified slide-over cart via `useCart` (localStorage)
- `PaymentForm` — auto-submit SePay checkout form
- `LeadCaptureForm` — GTM lead capture (navy/yellow brand)
- `GtmBehaviorTracker` + `ConsultationPopup` — behavior-based consultation popup
- `FloatingChatButton` — real-time chat widget
- `Pagination`, `StarRating`, `Breadcrumb`, `Stepper`
- `SearchWithAutocomplete` — global search
- 50+ shadcn/ui components

### 5.5. Custom Hooks

| Hook | Purpose |
|---|---|
| `use-auth` | Supabase auth context + user queries |
| `use-cart` | Shopping cart (localStorage) |
| `use-dashboard-data` | Dashboard metrics and lists |
| `use-chat` | Real-time chat via Socket.IO |
| `use-profile` | User profile management |
| `use-toast` | Toast notifications |
| `use-mobile` | Responsive detection |

---

## 6. Microservices

### 6.1. Services (PM2 — `ecosystem.config.cjs`)

| Service | Port | Purpose | Dependencies |
|---|---|---|---|
| **software-hub-server** | 5000 | Monolith API + SPA | Supabase PostgreSQL |
| **email-service** | 3001 | SendGrid/Resend dispatch | Redis |
| **chat-service** | 3002 | Real-time chat | MongoDB, Redis |
| **notification-service** | 3003 | FCM push notifications | PostgreSQL, Firebase |

**Legacy/unused in prod:** `payment-service` (PHP/NL_Checkout), `gateweaver` (Go API gateway), `worker-service`.

### 6.2. Message Queue

- **Redis** for async email/notification dispatching
- Fallback: in-process queue when Redis unavailable
- Workers: emailWorker, notificationWorker

### 6.3. Real-Time Communication

- **Socket.IO** (monolith) — admin-user chat, presence
- **Socket.IO** (chat-service) — scalable chat microservice
- **Firebase Cloud Messaging** — push notifications

---

## 7. Storage & Integrations

### 7.1. File Storage

| Provider | Purpose | Status |
|---|---|---|
| **Supabase Storage** | Primary uploads (`/api/storage/upload-url`) | ✅ Active |
| Cloudflare R2 | Secondary (env vars present) | Optional |
| AWS S3 SDK | Legacy code in deps | Optional |

### 7.2. Third-Party Services

| Service | Purpose | Status |
|---|---|---|
| **Supabase** | PostgreSQL + Auth + Storage | ✅ Primary |
| **SePay** | Wallet top-up + marketplace checkout | ✅ Primary |
| SendGrid / Resend | Transactional email | ✅ Active |
| Firebase FCM | Push notifications | ✅ Active |
| Google Analytics 4 | Traffic tracking (`VITE_GA_MEASUREMENT_ID`) | ✅ Active |
| Stripe | Card payments | ⛔ Legacy (env vars only, not wired) |
| Google Generative AI | Chat AI responses | ✅ Active |
| Redis | Message queue | ✅ VPS Docker |
| MongoDB | Chat message store | ✅ VPS Docker |

### 7.3. Supabase Integration (Completed)

| Feature | Implementation |
|---|---|
| Database | Supabase managed PostgreSQL via `DATABASE_URL` / connection pooler |
| Auth | Supabase Auth JWT — client SDK + server `verifySupabaseToken` |
| Storage | Supabase Storage bucket (`SUPABASE_STORAGE_BUCKET`) |
| Local users sync | `users.supabase_id` links Supabase user → local role/permissions |
| Schema | Drizzle ORM + `drizzle-kit push` |
| Admin UI | Supabase Studio dashboard |

---

## 8. Environment Variables

Source of truth: `.env.example` (local), `.env.vps.example` (VPS-specific).

### 8.1. Required

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_ANON_KEY` | Client-side auth |
| `SUPABASE_SERVICE_KEY` | Server-side JWT verification |
| `SUPABASE_DB_PASSWORD` or `DATABASE_URL` | Drizzle ORM connection |
| `SEPAY_MERCHANT_ID` | SePay merchant ID |
| `SEPAY_SECRET_KEY` | SePay signing key |
| `SEPAY_ENV` | `sandbox` or `production` |

### 8.2. App Config

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development` / `production` |
| `PORT` | Server port (default 5000) |
| `SITE_URL` / `APP_URL` / `PUBLIC_URL` | Base URL for SePay callbacks |
| `SUPABASE_STORAGE_BUCKET` | Upload bucket name |
| `VITE_SUPABASE_URL` | Build-time Supabase URL (client) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Build-time auth key (client) |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics |

### 8.3. Optional / Microservices

| Variable | Purpose |
|---|---|
| `REDIS_URL` | Message queue |
| `MONGODB_URL` | Chat service |
| `EMAIL_SERVICE_URL` | Email microservice |
| `CHAT_SERVICE_URL` | Chat microservice |
| `NOTIFICATION_SERVICE_URL` | Notification microservice |
| `SENDGRID_API_KEY` | Email delivery |
| `FIREBASE_*` | Push notifications |
| `CLOUDFLARE_R2_*` | R2 storage backup |
| `STRIPE_*` | Legacy (unused) |
| `DISABLE_AUTH` | Dev auth bypass |
| `MOCK_USER_ROLE` | Dev mock user role |

### 8.4. SePay IPN Setup

Configure on [my.sepay.vn](https://my.sepay.vn):
```
IPN URL: https://your-domain.com/api/payment/ipn
```

---

## 9. Security Considerations

### ⚠️ Known Issues

1. **Passwords stored as plaintext** in `users.password` — Supabase Auth handles real passwords; local field is legacy/random hex
2. **`DISABLE_AUTH=true`** in dev — bypasses all auth
3. **Multi-seller cart** — checkout rejects mixed-seller carts; no split-order UX yet
4. **Limited rate limiting** — only auth, payment, and leads endpoints; most API routes unprotected
5. **`.env` files must not be committed** — contain secrets (SePay, Supabase service key)
6. **Firebase private keys** in env — must be secured in production

### Mitigations In Place

- Drizzle ORM prevents SQL injection
- Supabase JWT verification on protected routes
- React XSS protection
- CORS configurable per environment
- Role-based access control (`hasRole` middleware)
- SePay signed checkout fields (server-side secret)

---

## 10. DevOps & Deployment

### 10.1. VPS Production (Current)

**Server:** Contabo VPS — `https://swhubco.com`

**Deploy flow** (GitHub Actions → VPS):
1. Push to `main` triggers `.github/workflows/deploy.yml`
2. `npm ci` → `npm run build` (with Vite Supabase secrets)
3. Tarball → SCP to VPS `/var/www/software-hub`
4. `scripts/deploy-vps-docker.sh`:
   - `docker compose -f docker-compose.vps.yml up -d` (Redis + Mongo)
   - `npm ci --omit=dev`
   - `pm2 reload ecosystem.config.cjs --env production`
5. Health check: `curl :5000/health`

**GitHub Secrets required:** `SSH_HOST`, `SSH_USERNAME`, `SSH_KEY`, `SSH_PORT`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_ANON_KEY`, `VITE_GA_MEASUREMENT_ID`, `SITE_URL`

### 10.2. Docker Compose Files

| File | Purpose |
|---|---|
| `docker-compose.vps.yml` | **Production VPS** — Redis + MongoDB only |
| `docker-compose.dev.yml` | Local dev with Postgres + Redis (legacy) |
| `docker-compose.prod.yml` | Minimal production (legacy) |
| `docker-compose.production.yml` | Full microservices (legacy) |
| `docker-compose.yml` | Full dev stack (legacy) |

**Note:** Database is Supabase cloud — no Postgres container needed on VPS.

### 10.3. Local Development

```bash
npm install
cp .env.example .env   # configure Supabase + SePay
npm run dev            # Vite :5173 + Express :5000 (or PORT from .env)
```

### 10.4. Build

```bash
npm run build          # Vite → dist/ + tsc → dist/server/
npm start              # node dist/server/index.js
```

---

## 11. Data & Seeding

### 11.1. Seed Data Sources

| Source | Script |
|---|---|
| Awesome Linux/Windows software lists | `scripts/parse-awesome-*.ts` |
| Voz forum reviews | `scripts/scrape-voz-software.ts` |
| Free apps catalogue | `scripts/parse-free-apps.ts` |
| IT courses (YouTube) | `scripts/seed-it-courses.ts` |
| API listings | `scripts/parse-apis.ts` |

### 11.2. Database Dumps

- Location: `database/dumps/` and `shared/data-dumps/`
- Format: Full SQL dumps + schema-only + data-only

---

## 12. Testing

| Test Type | Command | Status |
|---|---|---|
| Unit | `npm run test` (Vitest) | Configured |
| E2E | `npm run test:e2e` (Playwright) | Configured (`tests/e2e/smoke.spec.ts`) |
| Integration | `tests/integration/` | Partial, manual |
| Admin E2E | `/admin/end-to-end-tests` page | Manual via UI |

---

## 13. Phase Roadmap

| Phase | Status | Description |
|---|---|---|
| Phase 1 | ✅ Done | Software catalog, categories, reviews, Supabase auth |
| Phase 2 | ✅ Done | Project management, quotes, portfolios (+ edit), messaging |
| Phase 3 | ✅ Done | Marketplace (products, orders, unified cart, SePay, support tickets) |
| Phase 4 | ✅ Done | IT Services UI + API + service payments (SePay) + email notifications |
| Phase 5 | ✅ Done | GTM core + admin course SEO CMS (`/admin/courses`) |
| Phase 6 | 🔄 Evolving | Design system rollout (`SPEC_UI_IMPROVEMENT_v1.md`), dashboard refactor |

---

## 14. Go-to-Market Strategy

### 14.1. Mô hình kinh doanh

**Software Hub Studio** — 3 lớp:

```
Lớp 1: Traffic (SEO)
  Khóa học free + phần mềm free → kéo sinh viên IT & SME
        ↓
Lớp 2: Engagement & Trust
  Landing page chi tiết, review, hướng dẫn tiếng Việt → xây uy tín
        ↓
Lớp 3: Monetization
  IT Studio (anh + team code sản phẩm cho khách hàng)
  Marketplace (bán sản phẩm số qua SePay)
  → Khách SME, startup cần làm web/app/CRM
```

### 14.2. Phân tích thị trường

| Mảng | Vai trò | Revenue | Cạnh tranh |
|---|---|---|---|
| Khóa học free | SEO bait, kéo traffic | $0 (free) | Blog IT Việt Nam, YouTube |
| Phần mềm free | Social proof, uy tín | $0 (free) | SourceForge, GitHub, AlternativeTo |
| Marketplace | Bán sản phẩm số | Commission 5% | Envato, ThemeForest |
| IT Studio | Tiền thật | 15-200tr/project | Agency, freelancer lẻ |

### 14.3. Target Customer

| Nhóm | Nhu cầu | Budget | Kênh tiếp cận |
|---|---|---|---|
| SME Việt Nam (5-50 nv) | Web bán hàng, CRM, landing page | 10-50tr | SEO + Facebook groups SME |
| Startup gọi vốn | MVP, prototype | 30-200tr | SEO + referral |
| Chủ shop online | Web bán hàng + quản lý đơn | 5-20tr | Google Maps outreach |
| Developer/Seller | Bán template, tool, license | 500k-5tr/sản phẩm | Marketplace |

### 14.4. Chiến thuật SEO

#### A. SEO cho khóa học (ưu tiên #1)

URL pattern: `/courses/:idOrSlug`

- Schema Course markup → rich snippet Google
- Nội dung 500-800 chữ tiếng Việt
- Internal links sang course liên quan, blog lộ trình

Blog posts: `/blog/:slug` (module đã implement)

#### B. SEO cho phần mềm

URL pattern: `/software/:idOrSlug`

- Schema SoftwareApplication
- Long-tail: "cài đặt docker trên mac m1", "cấu hình vscode cho python"

#### C. Sitemap

Auto-generated: `GET /sitemap.xml`, `GET /robots.txt`

### 14.5. Conversion Funnel

```
User search "học react free"
    ↓
Vào landing page course → đọc, xem video YouTube
    ↓
Lead capture (đã implement):
  - LeadCaptureForm trên trang chủ
  - /api/leads POST endpoint
  - Admin leads dashboard (/admin/leads)
  - Ebook gate: /ebook/fullstack-roadmap
  - Booking: /booking
    ↓
Tư vấn → quote → đơn hàng (IT Studio hoặc Marketplace)
```

### 14.6. GTM Implementation Status

| Feature | Status | Notes |
|---|---|---|
| Blog module (`/blog`, `/admin/blog`) | ✅ Done | |
| Lead capture (`/api/leads`, `/admin/leads`) | ✅ Done | |
| LeadCaptureForm component | ✅ Done | Navy/yellow brand |
| Sitemap + robots.txt | ✅ Done | |
| Ebook download gate | ✅ Done | `/ebook/fullstack-roadmap` |
| Booking page | ✅ Done | `/booking` |
| GA4 tracking | ✅ Done | `VITE_GA_MEASUREMENT_ID` |
| Course landing SEO meta | ✅ Done | `PageMeta` + auto `buildSeoContent()` + admin editor `/admin/courses` |
| Software SEO content | ✅ Done | `software-utils.ts` + `SoftwareSchema` on detail page |
| Schema.org markup | ✅ Done | `CourseSchema`, `SoftwareSchema`, `BreadcrumbSchema`, `ArticleSchema` |
| Chat trigger theo behavior | ✅ Done | `GtmBehaviorTracker` → `ConsultationPopup` |
| Dashboard lead tracking | ✅ Done | `/admin/leads` |

### 14.7. KPI dự kiến (month 1-3)

- SEO keywords top 10: ~70 long-tail từ course pages
- Traffic: 500-2000 visitors/tháng
- Lead capture rate: 3-5%
- Conversion lead → đơn: 5-10%
- Giá trị đơn TB: 15-50tr (IT Studio) / 500k-5tr (Marketplace)

---

## 15. Implementation Backlog

> Tổng hợp tính năng **chưa implement** hoặc **còn thiếu**, đối chiếu codebase tháng 6/2026.
> Các mục đã xong (pending DB, portfolio API, cart unify, support tickets, schema.org, …) đã gỡ khỏi backlog.

### 15.1. High Priority — Ảnh hưởng doanh thu / UX

| # | Feature | Mô tả | Files / gợi ý |
|---|---|---|---|
| H5 | **SePay production verify** | Ops: `SEPAY_ENV=production`, IPN URL trên `swhubco.com`, `APP_URL` đúng | `.env` VPS, my.sepay.vn |

### 15.2. Medium Priority — SEO / GTM / Phase 4 polish

> Không còn mục medium priority mở — xem §15.5.

### 15.3. Low Priority — DevOps / chất lượng / tương lai

| # | Feature | Mô tả |
|---|---|---|
| L1 | **E2E test coverage** | Chỉ `tests/e2e/smoke.spec.ts`; mở rộng checkout, auth, service flow |
| L2 | **OpenAPI / Swagger** | Không có API docs tự động |
| L3 | **Zalo OA API** | Kênh SME Việt Nam — chưa có integration |
| L4 | **Remove Stripe / PHP payment legacy** | Env vars + deps còn sót, không wired |
| L5 | **Deduplicate docker-compose** | 5+ compose files; gom profiles |
| L6 | **Drop `cart_items` table** | Legacy DB cart; client dùng localStorage — có thể deprecate schema |
| L7 | **`/api/cart` REST API** | Storage methods tồn tại trong `server/storage.ts` nhưng **không register route** — chỉ implement nếu cần sync cart đa thiết bị |

### 15.4. UI Package (`SPEC_UI_IMPROVEMENT_v1.md`)

| # | Feature | Status | Ghi chú |
|---|---|---|---|
| U1 | Inter font system | ✅ Done | `index.css`, `tailwind.config.ts` |
| U2 | Button gradient/soft variants | ✅ Done | `button.tsx` |
| U3 | Skeleton shimmer, card-glass CSS | ✅ Done | `index.css`, `software-grid.tsx` |
| U4 | PageHero wave divider | ✅ Done | `page-hero.tsx` |
| U5 | Footer gradient + amber hover | ✅ Done | `footer.tsx` |
| U6 | Page transition `animate-fade-in` | ✅ Done | `App.tsx` Router wrapper |
| U7 | **Header glassmorphism** | ❌ Not done | Vẫn `gradient-slate`; product decision giữ dark header |
| U8 | **HeroSection home sync** | 🟡 Partial | `HeroSection.tsx` chưa đồng bộ hết wave/CTA spec |
| U9 | **CSS cleanup** | 🟡 Partial | Animation/utilities cũ trong `index.css` chưa dọn |

### 15.5. Completed Recently (reference)

Các mục sau **đã implement** — không còn trong backlog:

**High priority (H1–H4)**
- Service payments deposit/final (`POST /api/service-payments/*`, SePay IPN, UI trên `service-request-detail-page.tsx`)
- Multi-seller cart checkout (tabs theo seller, `removeItemsByProductIds` sau thanh toán)
- Support ticket auto-assign `seller_id` từ `order_id`
- Nav links Support trong header + buyer/seller dashboard

**Medium priority (M1–M6)**
- Admin course SEO CMS (`/admin/courses`, `PUT/GET /api/courses/admin/*`)
- Service email notifications (request, quotation, accept/reject via Resend)
- Marketplace legacy redirect `/marketplace/:id` → `/marketplace/product/:id` (đã xóa `marketplace-detail-page.tsx`)
- Xóa `order-details-page.tsx`; `/order-details/:id` redirect về product
- Admin support tickets (`/admin/support-tickets`)
- Rate limiting mở rộng (upload, product CRUD, support POST, service POST)

- Unified cart (`useCart` + `GlobalCartSidebar`; xóa `shopping-cart-sidebar`, `checkout-page`, `product-detail-ecommerce`)
- Portfolio API + edit page (`/api/portfolios`, `/portfolios/edit/:id`)
- Support tickets API + buyer/seller UI (`/api/support/tickets`, `/support`, `/seller/support`)
- Pending checkouts persisted to DB (`pending_checkouts`)
- Payment + auth rate limiting
- Order items joined in `getOrderById`
- Phase 4 IT Services core UI (request → quotation → project)
- Phase 5 GTM core (blog, leads, sitemap, ebook, booking, GA4, behavior popup)
- Schema.org on course/software detail pages
- Software SEO utils (`software-utils.ts`)

---

## 16. Project Stats

| Metric | Value |
|---|---|
| Frontend pages | ~55 |
| API route modules | 22 |
| Database tables | 29 (+ `pending_checkouts`) |
| Active microservices | 3 (email, chat, notification) |
| Payment gateway | SePay (primary) |
| Cart source | `localStorage` (`shopping-cart`) — not `cart_items` |
| Production domain | swhubco.com |
| Documentation files | ~40 |

---

*Last updated from source code review — June 2026*
