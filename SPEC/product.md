# Software Hub - Product Specification Document

> Generated from source code review | Last updated: June 2026

---

## 1. Executive Summary

**Software Hub** is a full-stack multi-tenant platform combining software catalog distribution, digital marketplace, IT service management (freelance/project outsourcing), educational course listings, and blog/lead capture for go-to-market.

**Architecture:** Monolith-first — single Express app serves API + built React SPA. Optional microservices (email, chat, notification) run under PM2. Primary database, auth, and file storage run on **Supabase** (managed PostgreSQL). Redis + MongoDB run locally on VPS via Docker for queue/chat.

**Status:** Production-deployed (`swhubco.com`). Core marketplace + IT Services + GTM + admin CMS shipped. **Cổng thanh toán: [payOS](https://payos.vn/docs/)** — wallet, marketplace checkout, IT service payments (§4.2). **GTM vận hành:** [`gtm-operations.md`](./gtm-operations.md).

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
- GA4 client (`analytics.tsx`) — Measurement ID từ `/admin/settings` → `app_settings`, env (`VITE_GA_MEASUREMENT_ID`), hoặc runtime `GET /api/config`

**Backend**
- Node.js 20 + Express (TypeScript via `tsx` dev, compiled to `dist/server/`)
- Drizzle ORM (PostgreSQL via Supabase)
- **Supabase Auth** — JWT verification server-side (`verifySupabaseToken`)
- Redis (message queue — background jobs, optional fallback)
- Socket.IO (real-time chat in monolith)
- SendGrid / Resend (email via `email-service`)
- Firebase Admin SDK (push notifications via `notification-service`)
- **payOS** ([API docs](https://payos.vn/docs/)) — payment gateway (`server/lib/payos.ts`, webhook `/api/payment/webhook`)
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
| `app_settings` | Admin-managed config (key-value) | key, value, updated_at — DeepSeek API key, GA4 Measurement ID |
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
| `pending_checkouts` | Pending wallet/marketplace checkouts (payOS `orderCode` / payment link) | invoice_number, type, payload (JSONB), expires_at |
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

**Wallet:** Stored in `users.profile_data.wallet_balance` (JSONB) — credited via payOS webhook on wallet top-up.

**Client-side cart:** `useCart` hook persists to `localStorage` key `shopping-cart`. Legacy `cart_items` table removed from schema (migration `005_drop_cart_items.sql`).

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
| `/api/payment/*` | `payment.routes.ts` | Wallet + checkout + payOS webhook |
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

### 4.2. Payment API (payOS — target)

> **Tài liệu gốc:** [payOS API](https://payos.vn/docs/api/) · Production base: `https://api-merchant.payos.vn`  
> **Trạng thái code:** Routes bên dưới **đã có**; implementation bên trong vẫn gọi SePay — xem migration **§15.1 H5**.

#### 4.2.1. payOS primitives (merchant API)

| payOS API | Method | Mô tả |
|---|---|---|
| `/v2/payment-requests` | `POST` | Tạo link thanh toán → trả `checkoutUrl`, `qrCode`, `paymentLinkId` |
| `/v2/payment-requests/{id}` | `GET` | Lấy trạng thái link (`PENDING` / `PAID` / `CANCELLED`) |
| `/v2/payment-requests/{id}/cancel` | `POST` | Hủy link thanh toán |
| Webhook (payOS → app) | `POST` | Gửi `orderCode`, `amount`, `paymentLinkId` + `signature` |
| `/confirm-webhook` | `POST` | Đăng ký / xác thực `webhookUrl` trên kênh thanh toán |

**Auth headers:** `x-client-id`, `x-api-key` (từ [my.payos.vn](https://my.payos.vn) → Kênh thanh toán).

**Tạo link — body chính:** `orderCode` (integer, unique), `amount` (VND integer), `description`, `returnUrl`, `cancelUrl`, `signature` (HMAC_SHA256 với **checksum key**, data sort alphabet: `amount`, `cancelUrl`, `description`, `orderCode`, `returnUrl`).

**Webhook:** Verify `signature` trên payload; phản hồi HTTP 2xx để xác nhận nhận thành công. Chi tiết: [Kiểm tra dữ liệu webhook](https://payos.vn/docs/tich-hop-webhook/kiem-tra-du-lieu-voi-signature/).

#### 4.2.2. Software Hub routes (giữ path, đổi backend)

| Method | Path | Auth | Target behavior (payOS) |
|---|---|---|---|
| `POST` | `/api/payment/initiate` | ✅ | Wallet top-up (min 1.000₫) → `POST /v2/payment-requests` → redirect `checkoutUrl` |
| `POST` | `/api/payment/checkout` | ✅ buyer/admin | Tạo `pending` order → payment link → `checkoutUrl` |
| `POST` | `/api/payment/webhook` | Public (payOS) | Nhận webhook; verify signature; fulfill order / credit wallet |
| `POST` | `/api/payment/ipn` | Public | **Alias legacy** → redirect handler tới webhook (trong lúc migration) |
| `GET` | `/api/payments` | ✅ | Role-filtered payment list |
| `POST` | `/api/payments` | ✅ | Manual project/order payment record |
| `PUT` | `/api/payments/:id/status` | admin | Update payment status |
| `POST` | `/api/service-payments/deposit` | ✅ | IT service deposit → payment link |
| `POST` | `/api/service-payments/final` | ✅ | IT service final payment → payment link |

**`orderCode` mapping (đề xuất):**

| Flow | `orderCode` | Ghi chú |
|---|---|---|
| Wallet top-up | `900000000 + userId` hoặc timestamp-based unique int | Lưu trong `pending_checkouts` |
| Marketplace order | `order.id` hoặc `1000000000 + order.id` | Tránh trùng với service codes |
| IT service payment | `2000000000 + payment.id` | `service_payments` row |

**Return / cancel URLs:**

| Flow | `returnUrl` | `cancelUrl` |
|---|---|---|
| Wallet | `{APP_URL}/add-funds?status=success` | `{APP_URL}/add-funds?status=cancelled` |
| Marketplace | `{APP_URL}/marketplace/order-success/{orderId}` | `{APP_URL}/marketplace/checkout?cancelled=1` |
| IT service | `{APP_URL}/services/{requestId}?payment=success` | `{APP_URL}/services/{requestId}?payment=cancelled` |

**Pending state:** Bảng `pending_checkouts` — lưu `orderCode`, `paymentLinkId`, payload; webhook là source of truth.

**Marketplace checkout flow (target):**
1. Client posts cart + buyer info
2. Server validates products, tạo `pending` order
3. Server gọi payOS `POST /v2/payment-requests` → trả `checkoutUrl` (+ optional `qrCode`)
4. Client redirect user tới `checkoutUrl` (hoặc hiển thị QR)
5. payOS webhook `success` → mark order `completed`, payment record, decrement stock
6. User quay về `returnUrl` → `/marketplace/order-success/:orderId`

#### 4.2.3. SePay (removed)

Đã gỡ `sepay-pg-node`, `server/lib/sepay.ts`, `SEPAY_*` env. `/api/payment/ipn` giữ làm alias webhook payOS.

### 4.3. Auth Design

**Primary: Supabase JWT**
1. Client (`client/src/lib/supabase.ts`) authenticates via Supabase Auth
2. API calls send `Authorization: Bearer <access_token>` (`getAuthHeaders()` in `client/src/lib/auth-token.ts`)
3. Server (`server/lib/auth-user.ts`) verifies token via Supabase service key (`verifySupabaseToken`)
4. Maps to local `users` row by `supabase_id` or `email`; auto-creates with `role: 'user'` if missing
5. `isAuthenticated` / `hasRole` middleware attach `req.user`

**Roles:** `user`, `admin`, `developer`, `client`, `seller`, `buyer`

**Auth UI (`/auth` → `AuthPageNew`)**

| Flow | Implementation |
|---|---|
| Email sign-in | `use-auth` → `supabase.auth.signInWithPassword` → `GET /api/user` sync |
| Email sign-up | `supabase.auth.signUp` + email confirmation |
| Google OAuth | `supabase.auth.signInWithOAuth({ provider: 'google' })` → redirect `/dashboard` |
| GitHub OAuth | `supabase.auth.signInWithOAuth({ provider: 'github' })` → redirect `/dashboard` |
| Forgot password | `supabase.auth.resetPasswordForEmail` → redirect `/auth#type=recovery` → form calls `supabase.auth.updateUser({ password })` |
| Quick Login (demo) | `AuthQuickLoginDev` — **dev only** (`import.meta.env.DEV`); production build excludes component |

Production requires `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (or `VITE_SUPABASE_PUBLISHABLE_KEY`) at build time. UI shows config warning if missing.

**Legacy email flow (non-Supabase fallback):** `POST /api/register` (email only) + `/auth/set-password?token=…` page calling `GET /api/auth/verify-email` and `POST /api/auth/set-password`. Used when Supabase client is not configured (local dev without env).

**Dev-only routes**
- `/test-login` → `TestLoginPage` — registered only when `import.meta.env.DEV`
- Quick Login buttons on `/auth` — same dev gate

**Dev bypass:** `DISABLE_AUTH=true` + `MOCK_USER_ROLE` skips auth middleware (**ignored when `NODE_ENV=production`**).

**Rate limiting:** `authRateLimiter` on `/api/register` + `/api/auth/register`; `paymentRateLimiter` on `/api/payment/initiate` and `/api/payment/checkout`; `leadRateLimiter` on `/api/leads`.

**Key files**

| File | Role |
|---|---|
| `client/src/hooks/use-auth.tsx` | Auth context, login/register/logout/Google mutations |
| `client/src/lib/supabase.ts` | Supabase browser client |
| `client/src/lib/auth-token.ts` | `getAuthHeaders()`, `authFetch()` |
| `client/src/pages/auth-page-new.tsx` | Login / register / recovery UI |
| `client/src/pages/set-password-page.tsx` | Legacy email verification + set password |
| `client/src/components/auth-quick-login-dev.tsx` | Dev quick login panel |
| `server/lib/auth-user.ts` | JWT → local user resolution |
| `server/middleware/auth.middleware.ts` | `isAuthenticated`, `hasRole`, `optionalAuth` |
| `server/routes/auth.routes.ts` | Profile, legacy register/verify/set-password, token validation |

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
| `/marketplace/orders` | MarketplaceOrdersPage | buyer, user |
| `/admin/orders` | AdminOrdersPage | admin |
| `/seller/analytics` | SellerAnalyticsPage | seller, admin |
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
| `/admin/*` | Admin dashboard (19 routes + redirects) | admin — chi tiết §5.5 |
| `/test-login` | TestLoginPage | Dev only (`import.meta.env.DEV`) |

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
- `PaymentForm` — redirect tới payOS `checkoutUrl`
- `LeadCaptureForm` — GTM lead capture (navy/yellow brand)
- `GtmBehaviorTracker` + `ConsultationPopup` + `ConsultationSlideIn` + `GtmScrollCtaBar` — behavior-based GTM triggers
- `SoftwareDownloadGate` — lead form trước khi mở link tải phần mềm
- `FloatingChatButton` — real-time chat widget
- `Pagination`, `StarRating`, `Breadcrumb`, `Stepper`
- `SearchWithAutocomplete` — global search

### 5.5. Admin Dashboard (`/admin/*`)

**Shell:** `ProtectedRoute` (`roles: admin`) + `AdminLayout` (`AppSidebar` shadcn) cho **tất cả** trang admin.

**Sidebar (`AppSidebar.tsx`):** Nhóm tiếng Việt — Tổng quan · Người dùng · Marketplace · Nội dung & GTM · Vận hành · Dev Tools · Tài khoản.

#### Page inventory (cập nhật 6/2026 — sau consolidation)

| Route | Page | Sidebar | Mô tả |
|---|---|---|---|
| `/admin` | AdminDashboardPage | Tổng quan | Quick links + queue tóm tắt (metrics → `/admin/analytics`) |
| `/admin/analytics` | AdminAnalyticsPage | Tổng quan | Platform metrics, orders/leads timeline charts, GTM counts, GA4 link-out |
| `/admin/users` | AdminUsersPage | Người dùng | Tab Danh sách + Chat (`UsersChatPanel`) |
| `/admin/users/chat` | redirect | — | → `/admin/users?tab=chat` |
| `/admin/seller-approvals` | SellerApprovalPage | Người dùng | Duyệt seller |
| `/admin/software` | AdminSoftwareManagementPage | Marketplace | Catalog `softwares` (miễn phí) |
| `/admin/products` | AdminProductsPage | Marketplace | Duyệt `products` marketplace (`PATCH status`) |
| `/admin/orders` | AdminOrdersPage | Marketplace | Đơn hàng marketplace — enriched API, filter status |
| `/admin/blog` | BlogManagementPage | Nội dung & GTM | Blog CRUD + AI rewrite (DeepSeek) |
| `/admin/settings` | SettingsPage | Dev Tools | DeepSeek API key + GA4 Measurement ID (`app_settings`) |
| `/admin/courses` | CoursesManagementPage | Nội dung & GTM | SEO editor khóa học |
| `/admin/leads` | LeadsManagementPage | Nội dung & GTM | GTM lead capture |
| `/admin/projects` | AdminProjectsPage | Vận hành | **Unified** `external_requests` — filter nguồn, priority, search; banner phân biệt IT Services |
| `/admin/projects/:id/edit` | ProjectEditPage | — | Form edit đầy đủ |
| `/admin/external-requests` | redirect | — | → `/admin/projects?source=public` |
| `/admin/service-requests` | AdminServiceRequestsPage | Vận hành | IT Services — filter, status VN, báo giá, tiến độ project (`service_requests`) |
| `/admin/support-tickets` | AdminSupportTicketsPage | Vận hành | Ticket marketplace |
| Dev Tools | email / e2e / push / queues | Dev Tools | Giữ nhóm riêng |

#### Ba luồng “dự án/dịch vụ” — KHÔNG gộp với nhau

| Luồng | Bảng | Admin | Khác biệt |
|---|---|---|---|
| **Yêu cầu dự án** | `external_requests` | `/admin/projects` | Form `/request-project` hoặc `/projects/new`; developer quotes |
| **Dịch vụ IT** | `service_requests` | `/admin/service-requests` | Login bắt buộc; báo giá admin; `service_payments` |
| **Leads GTM** | `leads` | `/admin/leads` | Capture nhẹ từ landing/ebook |

#### API endpoints chính (admin)

| Module | Endpoints | Auth |
|---|---|---|
| Dashboard stats | `GET /api/admin/stats` | admin |
| Users | `GET/PATCH/POST/DELETE /api/admin/users/*` | admin |
| Software catalog | `GET /api/admin/softwares`, `POST/PUT/DELETE /api/admin/software/*` | admin |
| Marketplace products | `GET /api/admin/products`, `PATCH /api/admin/products/:id/status` | admin |
| Marketplace orders | `GET /api/admin/orders` (enriched), `PUT /api/orders/:id/status` | admin |
| Projects (unified) | `GET/PATCH /api/admin/projects/*` (+ `source`, `priority`, `search`) | admin |
| External requests (legacy API) | `GET/PUT /api/admin/external-requests/:id` | admin — edit form `/admin/projects/:id/edit` |
| Seller approvals | `GET/PUT /api/admin/sellers/*` | admin |
| Queues | `GET /api/admin/queue/stats`, retry/clear | admin |
| Analytics timelines | `GET /api/admin/analytics/orders-timeline`, `leads-timeline` | admin |
| App settings | `GET/PUT /api/admin/settings/deepseek`, `POST .../test`; `GET/PUT /api/admin/settings/ga4` | admin |
| Public runtime config | `GET /api/config` → `{ gaMeasurementId }` | public |
| Orders (buyer/seller) | `GET /api/orders` → `{ orders, total }` enriched | role-based |
| IT service requests | `GET /api/service-requests` (+ `status`, `priority`, `search` for admin) | admin / client |
| Blog / Leads / Courses / Support | (unchanged) | admin |

#### Cross-cutting notes

- **Auth pattern:** Admin pages dùng `apiRequest` — plain `fetch` gây 401.
- **UI ngôn ngữ:** Sidebar tiếng Việt; Dev Tools giữ tên kỹ thuật.

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

**Legacy/archived:** PHP NganLuong checkout → `scripts/archive/payment-service-php-legacy/`; SePay removed. **Optional local Docker only:** `gateweaver`, `worker-service` in full `docker-compose.yml` — not on VPS prod. See `docker/COMPOSE.md`.

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
| **payOS** | Wallet top-up + marketplace + IT service payments | ✅ Active (§4.2) |
| SendGrid / Resend | Transactional email | ✅ Active |
| Firebase FCM | Push notifications | ✅ Active |
|| **Google Analytics 4** | Traffic tracking (`VITE_GA_MEASUREMENT_ID`) | ✅ Active |
|| **Google AdSense** | Ad display revenue (`client/index.html`) | ✅ Active |
|| Stripe | Card payments | ⛔ Legacy (env vars only, not wired) |
|| Google Generative AI | Chat AI responses | ✅ Active |
|| Redis | Message queue | ✅ VPS Docker |
|| MongoDB | Chat message store | ✅ VPS Docker |

### 7.3. Supabase Integration (Completed)

| Feature | Implementation |
|---|---|
| Database | Supabase managed PostgreSQL via `DATABASE_URL` / connection pooler |
| Auth | Supabase Auth JWT — client SDK + server `verifySupabaseToken` |
| Storage | Supabase Storage bucket (`SUPABASE_STORAGE_BUCKET`) |
| Local users sync | `users.supabase_id` links Supabase user → local role/permissions |
| Schema | Drizzle ORM + `drizzle-kit push` |
| Admin UI | Supabase Studio dashboard |

### 7.4. Google AdSense

| Item | Detail |
|------|--------|
| Client ID | `ca-pub-6124954442503878` |
| Script location | `client/index.html` — in `<head>` |
| Script | `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6124954442503878" crossorigin="anonymous"></script>` |
| Setup | Thủ công via `client/index.html` (không qua GTM). Cần verify site trong Google AdSense console. |
| Deployment | Khi build, script được bundle vào SPA `index.html` → deploy theo server. |

> **Lưu ý:** AdSense cần content quality + traffic đủ để được approval. Chạy song song với GTM/GA4.

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
| `PAYOS_CLIENT_ID` | payOS Client ID (header `x-client-id`) |
| `PAYOS_API_KEY` | payOS API Key (header `x-api-key`) |
| `PAYOS_CHECKSUM_KEY` | HMAC_SHA256 signing cho create-link + webhook verify |
| `PAYOS_WEBHOOK_URL` | URL đăng ký webhook (thường = `{APP_URL}/api/payment/webhook`) |

### 8.2. App Config

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development` / `production` |
| `PORT` | Server port (default 5000) |
| `SITE_URL` / `APP_URL` / `PUBLIC_URL` | Base URL for payOS `returnUrl` / `cancelUrl` |
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

### 8.4. payOS Webhook Setup

1. Lấy credentials tại [my.payos.vn](https://my.payos.vn) → **Kênh thanh toán** → Client ID, API Key, Checksum key
2. Set env: `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`, `APP_URL`
3. Đăng ký webhook:
   ```
   POST https://api-merchant.payos.vn/confirm-webhook
   { "webhookUrl": "https://your-domain.com/api/payment/webhook" }
   ```
   Hoặc cấu hình trên dashboard payOS
4. Verify `signature` trên mọi webhook trước khi fulfill — [docs](https://payos.vn/docs/tich-hop-webhook/kiem-tra-du-lieu-voi-signature/)
5. Test sandbox payOS trước production
6. **Migration:** Giữ `/api/payment/ipn` tạm alias handler payOS nếu URL cũ đã đăng ký SePay

---

## 9. Security Considerations

### ⚠️ Known Issues

1. **Passwords stored as plaintext** in `users.password` — Supabase Auth handles real passwords; local field is legacy/random hex
2. **`DISABLE_AUTH=true`** in dev — bypasses all auth
3. **Multi-seller cart** — checkout rejects mixed-seller carts; no split-order UX yet
4. **Limited rate limiting** — only auth, payment, and leads endpoints; most API routes unprotected
5. **`.env` files must not be committed** — contain secrets (payOS keys, Supabase service key)
6. **Firebase private keys** in env — must be secured in production

### Mitigations In Place

- Drizzle ORM prevents SQL injection
- Supabase JWT verification on protected routes
- React XSS protection
- CORS configurable per environment
- Role-based access control (`hasRole` middleware)
- payOS HMAC_SHA256 signature (create-link + webhook verify via checksum key)

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

**GitHub Secrets required:** `SSH_HOST`, `SSH_USERNAME`, `SSH_KEY`, `SSH_PORT`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_ANON_KEY`, `VITE_GA_MEASUREMENT_ID`, `VITE_GEMINI_API_KEY`, `SITE_URL`, `VPS_ENV_B64` (full runtime `.env` — sync via `bash scripts/sync-github-secrets.sh`)

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
cp .env.example .env   # configure Supabase + payOS
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

| Source | Script | Status |
|---|---|---|
| Awesome Linux/Windows software lists | `scripts/parse-awesome-*.ts` | ✅ Done (legacy) |
| Voz forum reviews | `scripts/scrape-voz-software.ts` | ✅ Done (legacy) |
| Free apps catalogue | `scripts/parse-free-apps.ts` | ✅ Done (legacy) |
| IT courses (YouTube) | `scripts/seed-it-courses.ts` | ⛔ Chuyển sang nguồn mới |
| API listings | `scripts/parse-apis.ts` | ✅ Done (legacy) |
| **download.com.vn** (hot trend) | `scripts/parse-downloadcomvn.ts` | ✅ Done — 639 entries production crawl |
| **Axorax/awesome-free-apps** (600+ entries, 5.5k⭐) | `scripts/parse-awesome-free-apps.ts` | ✅ Done |
| **awesome-selfhosted** (2000+ entries, 225k⭐) | `scripts/parse-awesome-selfhosted.ts` | ✅ Done |
| **EbookFoundation/free-programming-books** (340k⭐) | `scripts/parse-ebookfoundation-courses.ts` | ✅ Done |
| **YouTube channels VN** (~50 courses) | `scripts/seed-it-courses-v2.ts` (thủ công) | ✅ Done |
| **Seed all free software** (hợp nhất) | `scripts/seed-all-free-software.ts` | ✅ Done — ~4,100+ software production |

### 11.2. Data Expansion Strategy (Phase 6)

Chi tiết: [`data-expansion.md`](./data-expansion.md)

#### Phần mềm Free Hot Trend

**Nguồn chính (xếp theo ưu tiên):**

| # | Nguồn | Format | Số lượng | ⭐ | Phương pháp |
|---|-------|--------|---------|---|------------|
| 1 | **download.com.vn** | Vietnamese software listing | ~500+ | — | Playwright JS-rendered |
| 2 | **Axorax/awesome-free-apps** | GitHub README markdown | ~600+ | 5.5k⭐ | Fetch markdown → parse |
| 3 | **awesome-selfhosted** | GitHub README markdown | ~2000+ | 225k⭐ | Fetch markdown → parse |

**Bỏ:** johnjago/awesome-free-software (cũ, 111 entries), awesome-windows, awesome-linux — thay bằng Axorax.

**Scripts:**

| Script | Mô tả |
|---|---|
| `scripts/parse-downloadcomvn.ts` | Playwright crawl download.com.vn → JSON |
| `scripts/parse-awesome-free-apps.ts` | Crawl Axorax/awesome-free-apps README → JSON |
| `scripts/parse-awesome-selfhosted.ts` | Crawl awesome-selfhosted README → JSON |
| `scripts/seed-all-free-software.ts` | Merge JSON từ tất cả nguồn → insert/update DB |

**Schema:** Table `softwares` (đã có) + `categories` (đã có) — không cần migration.

#### Tài liệu IT (Courses)

**Nguồn chính (xếp theo ưu tiên):**

| # | Nguồn | Format | Số lượng | ⭐ | Phương pháp |
|---|-------|--------|---------|---|------------|
| 1 | **EbookFoundation/free-programming-books** | GitHub HTML page | ~200+ | 340k⭐ | HTML parse |
| 2 | **YouTube channels VN** | Playlists | ~50+ | — | Thêm thủ công |

**Bỏ:** tmsanghoclaptrinh/tai-lieu-lap-trinh-tieng-viet-mien-phi (nguồn cũ, không maintain) — thay bằng EbookFoundation.

**Scripts:**

| Script | Mô tả |
|---|---|
| `scripts/parse-ebookfoundation-courses.ts` | Crawl HTML từ EbookFoundation → JSON |
| `scripts/seed-it-courses-v2.ts` | Seed tất cả courses từ EbookFoundation + YouTube channels |

**Schema:** Table `courses` (đã có) — không cần migration.

### 11.3. Database Dumps

- Location: `database/dumps/` and `shared/data-dumps/`
- Format: Full SQL dumps + Schema-only + Data-only

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
| Phase 3 | ✅ Done | Marketplace (products, orders, unified cart, payments, support tickets) |
| Phase 4 | ✅ Done | IT Services UI + API + service payments + email notifications |
| Phase 3b | ✅ Done | **payOS migration** — §15.9 |
| Phase 5 | ✅ Done | GTM core + admin course SEO CMS (`/admin/courses`) |
| Phase 6 | ✅ Done (data) / 🟡 UI polish | **Data expansion** shipped (~4,100 software, ~310 courses). Design system (`ui-improvement-v1.md`) mostly done. Catalog UI backlog: source badge, essential tab — `data-expansion.md` §Phase 3 |
| Phase 7 | 🆕 Planned | AI Hub preview — `go-to-market.md` §10, `gtm-operations.md` §7 |

---

## 14. Go-to-Market Strategy

> **Vận hành hàng ngày (KPI, lead SLA, content calendar, conversion backlog):** [`gtm-operations.md`](./gtm-operations.md)

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
  Marketplace (bán sản phẩm số qua payOS)
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
| Blog module (`/blog`, `/admin/blog`) | ✅ Done | Admin CMS: full-size modal editor, stats, CRUD |
| Admin analytics (`/admin/analytics`) | 🟡 Partial | Platform metrics + orders/leads timeline charts + GTM counts; GA4 traffic vẫn link-out |
| Lead capture (`/api/leads`, `/admin/leads`) | ✅ Done | |
| LeadCaptureForm component | ✅ Done | Navy/yellow brand |
| Sitemap + robots.txt + `llms.txt` | ✅ Done | AI crawler map; robots Disallow admin/api |
| Bot prerender (GPTBot, ClaudeBot, Googlebot) | ✅ Done | `server/middleware/seo-prerender.ts` |
| Organization + WebSite schema | ✅ Done | `organization-schema.tsx` sitewide |
| FAQ + Product schema (marketplace) | ✅ Done | `faq-schema.tsx`, `product-schema.tsx` |
| PageMeta landing pages | ✅ Done | `/`, `/software`, `/marketplace`, `/it-services`, product detail |
| SEO markdown internal links | ✅ Done | `render-seo-markdown.tsx` |
| Ebook download gate | ✅ Done | `/ebook/fullstack-roadmap` |
| Booking page | ✅ Done | `/booking` |
| GA4 tracking | ✅ Done | `analytics.tsx` + `gtm-analytics.ts`; ID: admin `/admin/settings` → `app_settings` hoặc env; runtime `GET /api/config` |
| GA4 admin config | ✅ Done | `/admin/settings` — Measurement ID `G-…` (DB ưu tiên env) |
| Software download gate (GTM-1) | ✅ Done | `SoftwareDownloadGate` trên `/software/:slug` |
| GA4 custom events (GTM-6) | ✅ Done | `lead_submit`, `download_click`, `booking_view`, `ebook_gate_submit` |
| Lead nurture email (GTM-4) | ✅ Done | `sendLeadNurtureEmail` sau `POST /api/leads` (Resend) |
| IT Services pricing (GTM-5) | ✅ Done | Bảng giá + case study SME trên `/it-services` |
| Course landing SEO meta | ✅ Done | `PageMeta` + auto `buildSeoContent()` + admin editor `/admin/courses` |
| Software SEO content | ✅ Done | `software-utils.ts` + `SoftwareSchema` on detail page |
| Schema.org markup | ✅ Done | `CourseSchema`, `SoftwareSchema`, `BreadcrumbSchema`, `ArticleSchema` |
| Chat trigger theo behavior | ✅ Done | `GtmBehaviorTracker` → popup 3+ pages, slide-in 30s, scroll CTA 70% |
| Dashboard lead tracking | ✅ Done | `/admin/leads` |
| Software SEO admin CMS | ✅ Done | `/admin/software-seo` + `PUT /api/admin/software/:id/seo` |
| Default OG image (1200×630 PNG) | ✅ Done | `client/public/og-default.png` · `npm run generate:og-image` |
| GA4 embed (C8) | 🟡 Partial | `GET /api/admin/analytics/ga4-traffic` — cần `GA4_PROPERTY_ID` + service account |
| E2E checkout (L1) | ✅ Done | `tests/e2e/checkout.spec.ts` — auth + webhook signature |

### 14.7. KPI dự kiến (month 1-3)

Chi tiết đo lường + cadence review: [`gtm-operations.md`](./gtm-operations.md) §3.

- SEO keywords top 10: ~70 long-tail từ course pages
- Traffic: 500-2000 visitors/tháng
- Lead capture rate: 3-5%
- Conversion lead → đơn: 5-10%
- Giá trị đơn TB: 15-50tr (IT Studio) / 500k-5tr (Marketplace)

### 14.8. Content targets (post-populate)

Volume DB đủ SEO; ưu tiên **chất lượng content** — checklist đầy đủ `gtm-operations.md` §6.

| Asset | Production (6/2026) | Target tháng 1–3 |
|-------|---------------------|------------------|
| Software catalog | ~4,100+ | ✅ Volume OK |
| Courses | ~310+ | Enrich top 20–50 pages (500–800 từ) |
| Blog posts | ~3 | **10–15** bài lộ trình |
| Install guides (VN) | 0 | **20–30** phần mềm phổ biến |
| IT Studio case studies | 3 (trên `/it-services`) | Enrich thêm blog/case chi tiết |

### 14.9. Conversion backlog (code)

| ID | Feature | Status |
|----|---------|--------|
| GTM-1 | Gate form khi click Tải ngay (software detail) | ✅ |
| GTM-2 | Slide-in consultation sau 30s | ✅ |
| GTM-3 | Bottom bar khi scroll 70% | ✅ |
| GTM-4 | Email nurture sau lead (Resend) | ✅ |
| GTM-5 | Pricing + case study trên `/it-services` | ✅ |
| GTM-6 | GA4 custom events (`lead_submit`, `download_click`, …) | ✅ |

Chi tiết: `gtm-operations.md` §7.

---

## 15. Implementation Backlog

> Tổng hợp tính năng **chưa implement** hoặc **còn thiếu**, đối chiếu codebase tháng 6/2026.
> Các mục đã xong (pending DB, portfolio API, cart unify, support tickets, schema.org, …) đã gỡ khỏi backlog.

### 15.1. High Priority — Ảnh hưởng doanh thu / UX

| # | Feature | Mô tả | Files / gợi ý |
|---|---|---|---|
| H5 | **payOS migration** — thay SePay toàn stack | ✅ Done — §15.9 | `server/lib/payos.ts`, webhook `/api/payment/webhook` |

### 15.2. Medium Priority — SEO / GTM / Phase 4 polish

> GTM conversion backlog (GTM-1…GTM-6) — ✅ Done tháng 6/2026. Chi tiết §14.9, `gtm-operations.md` §7.

### 15.3. Low Priority — DevOps / chất lượng / tương lai

> **Out of scope:** OpenAPI/Swagger và Zalo OA API — không triển khai (quyết định sản phẩm 6/2026).

| # | Feature | Mô tả |
|---|---|---|
| L1 | **E2E test coverage** | ✅ Done — `smoke.spec.ts` + `checkout.spec.ts` (payOS webhook + checkout UI); mở rộng auth/service payments là nice-to-have |
| L4 | **Remove Stripe / PHP payment legacy** | ✅ Done — gỡ `stripe` deps; archive PHP payment |
| L8 | **Remove SePay after H5** | ✅ Done — gỡ `sepay-pg-node`, `sepay.ts`, env templates → `PAYOS_*` |
| L5 | **Deduplicate docker-compose** | ✅ Done — `docker/COMPOSE.md`; deprecate `prod`/`production` compose |
| L6 | **Drop `cart_items` table** | ✅ Done — removed schema + storage; SQL `database/migrations/005_drop_cart_items.sql` |
| L7 | **`/api/cart` REST API** | ✅ N/A — dead storage removed; cart = `localStorage` only (no server route planned) |

### 15.6. Admin Dashboard — Polish & Gaps

> Review admin pages tháng 6/2026 — xem inventory đầy đủ §5.5.

| # | Feature | Mô tả | Priority |
|---|---|---|---|
| A1 | **Unify AdminLayout** | ✅ Done — tất cả trang admin dùng AdminLayout | Medium |
| A2 | **Sidebar completeness** | ✅ Done — 6 nhóm VN + Dev Tools; chat trong Users | Low |
| A3 | **Route `project-edit-page`** | ✅ Done — `/admin/projects/:id/edit` (+ redirect legacy external-requests) | Medium |
| A4 | **Consolidate project systems** | ✅ Done — gộp `/admin/projects`; banner phân biệt Dịch vụ IT | Medium |
| A5 | **Seller `/seller/analytics` route** | ✅ Done — `SellerAnalyticsPage` + route trong `App.tsx` | Medium |
| A6 | **Admin Analytics depth** | 🟡 Partial — orders + leads + GA4 embed (khi có service account) | Low |
| A7 | **Software admin create** | ✅ Done — "Thêm mới" wired (`POST /api/admin/software`); Import CSV không trong scope | Low |
| A8 | **Support ticket detail view** | ✅ Done — detail Dialog với status/priority | Low |
| A9 | **Dedupe `/admin` route** | ✅ Done — xóa duplicate trong `App.tsx` | Low |
| A10 | **User chat polish** | ✅ Done — tab Chat trong `/admin/users` | Low |

### 15.7. Admin Consolidation (6/2026)

> Rà soát sidebar — gộp trùng, bổ sung gap marketplace.

| # | Feature | Priority | Status |
|---|---|---|---|
| C1 | **Gộp Projects + External Requests** | P0 | ✅ Done — một trang `/admin/projects`, filter `source=public\|registered` |
| C2 | **Dashboard vs Analytics** | P1 | ✅ Done — Dashboard tóm tắt; metrics đầy đủ tại Analytics |
| C3 | **Sidebar nhóm + tiếng Việt** | P1 | ✅ Done — 6 nhóm trong `AppSidebar.tsx` |
| C4 | **Admin Marketplace Products** | P2 | ✅ Done — `/admin/products` duyệt pending |
| C5 | **Orders trong sidebar** | P2 | ✅ Done — `/admin/orders` + API enriched orders |
| C6 | **User Chat tab trong Users** | P3 | ✅ Done — bỏ mục sidebar riêng |
| C7 | **Dev Tools gọn** | P2 | ✅ Done — nhóm Dev Tools; Dashboard link → Queues |
| C8 | **GA4 embedded charts** | P3 | 🟡 Partial — `ga4-traffic` API + chart 30d; cần `GA4_PROPERTY_ID` + service account |

### 15.4. UI Package (`ui-improvement-v1.md`)

| # | Feature | Status | Ghi chú |
|---|---|---|---|
| U1 | Inter font system | ✅ Done | `index.css`, `tailwind.config.ts` |
| U2 | Button gradient/soft variants | ✅ Done | `button.tsx` |
| U3 | Skeleton shimmer, card-glass CSS | ✅ Done | `index.css`, `software-grid.tsx` |
| U4 | PageHero wave divider | ✅ Done | `page-hero.tsx` |
| U5 | Footer gradient + amber hover | ✅ Done | `footer.tsx` |
| U6 | Page transition `animate-fade-in` | ✅ Done | `App.tsx` Router wrapper |
| U7 | **Header glassmorphism** | ⏸ Skipped | Product decision — giữ dark `gradient-slate` header |
| U8 | **Home hero sync** | ✅ Done | `HomePage` dùng `PageHero` centered + wave + brand CTA |
| U9 | **CSS cleanup** | 🟡 Partial | Utilities cũ trong `index.css` — low priority |

### 15.5. Completed Recently (reference)

Các mục sau **đã implement** — không còn trong backlog:

**High priority (H1–H4)**
- Service payments deposit/final (`POST /api/service-payments/*`, payment webhook, UI trên `service-request-detail-page.tsx`) — *sẽ chuyển payOS ở H5*
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

**Admin dashboard (6/2026 consolidation)**
- Gộp Projects + External Requests → `/admin/projects` (filter `source`, priority, stats)
- Sidebar 6 nhóm tiếng Việt; `/admin/orders`, `/admin/products`; chat tab trong Users
- `GET /api/admin/orders` + `getEnrichedOrders()`; fix buyer `/marketplace/orders`
- IT Services admin polish (filter, status VN, báo giá, tiến độ)
- Analytics: orders + leads monthly charts; `GET /api/admin/analytics/*-timeline`
- Seed scripts: `npm run seed:service-requests`, `npm run seed:external-requests`

**Legacy cleanup (6/2026)**
- Removed Stripe npm packages + env template vars (payment gateway → payOS target)
- Archived PHP `payment-service` → `scripts/archive/payment-service-php-legacy/`
- Dropped `cart_items` from Drizzle schema + storage; migration `005_drop_cart_items.sql`
- `docker/COMPOSE.md` — canonical compose file guide

---

### 15.9. payOS Migration Plan (H5)

> **Tài liệu:** [payOS API](https://payos.vn/docs/api/) · Base: `https://api-merchant.payos.vn`

| Step | Task | Files / notes |
|---|---|---|
| H5.1 | Tạo `server/lib/payos.ts` — create link, cancel, get info, verify webhook signature | Thay `server/lib/sepay.ts` |
| H5.2 | `payment.routes.ts` — `initiate` / `checkout` gọi `POST /v2/payment-requests`; trả `checkoutUrl` | Map `orderCode` → `pending_checkouts` |
| H5.3 | Webhook handler `POST /api/payment/webhook` — verify signature, idempotent fulfill | Wallet credit + order complete + stock |
| H5.4 | `service.routes.ts` — deposit/final dùng cùng payOS client | IT service `orderCode` prefix `2xxx` |
| H5.5 | Frontend — redirect `window.location = checkoutUrl` thay SePay form submit | `checkout-page-new.tsx`, `add-funds-page.tsx`, `PaymentForm` |
| H5.6 | UI copy SePay → payOS | `cart-sidebar.tsx`, checkout, add-funds |
| H5.7 | Env VPS + `.env.example` — `PAYOS_*`; `confirm-webhook` trên production | [my.payos.vn](https://my.payos.vn) |
| H5.8 | Gỡ `sepay-pg-node`, `SEPAY_*`, alias `/api/payment/ipn` nếu không cần | → backlog L8 |

**Acceptance criteria:**
- Wallet top-up + marketplace checkout + IT deposit/final đều redirect payOS và fulfill qua webhook
- Webhook reject payload signature sai
- Không duplicate fulfill khi payOS retry webhook
- Sandbox test pass trước khi đổi production credentials

---

### 15.8. Dev seed scripts (local / staging)

| Command | Mô tả |
|---|---|
| `npm run seed:demo-users` | buyer@test.com, seller@test.com, admin@test.com |
| `npm run seed:service-requests` | 5 IT service requests `[DEMO]` (idempotent) |
| `npm run seed:external-requests` | 6 project requests `[DEMO]` public + registered |

---

## 16. Project Stats

| Metric | Value |
|---|---|
| Frontend pages | ~58 |
| Admin dashboard routes | 19 protected + legacy redirects |
| NPM seed scripts | 3 (`demo-users`, `service-requests`, `external-requests`) |
| API route modules | 22 |
| Database tables | 28 (+ `pending_checkouts`; `cart_items` dropped) |
| Active microservices | 3 (email, chat, notification) |
| Payment gateway (target) | payOS |
| Payment gateway (code) | payOS |
| Cart source | `localStorage` (`shopping-cart`) — `cart_items` table removed |
| Production domain | swhubco.com |
| Documentation files | ~40 |

---

*Last updated — payOS target gateway, June 2026*
