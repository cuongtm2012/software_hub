# SPEC: GTM Operations

> Vận hành Go-to-Market sau khi platform tech đã ship. Bổ sung cho [`product.md`](./product.md) §14 (strategy) và [`go-to-market.md`](./go-to-market.md) (chiến lược dài hạn).

**Production:** https://swhubco.com  
**Cập nhật:** 2026-06-19

---

## 1. Mục tiêu

Chuyển từ **“có sản phẩm”** sang **“có traffic → lead → đơn hàng”** bằng:

1. Đo lường (GA4, Search Console, admin analytics)
2. Content chất lượng (không chỉ số lượng DB)
3. Quy trình xử lý lead (SLA, sales playbook)
4. Phân phối organic song song SEO (Facebook groups, outreach)

**Non-goals:** Paid ads giai đoạn đầu, marketplace mở rộng seller tự do, AI Hub full build (→ Phase 7).

---

## 2. Trạng thái hiện tại (production)

### 2.1. Platform GTM (code) — ~95% xong

| Hạng mục | Status | Ghi chú |
|----------|--------|---------|
| Course/software detail + schema | ✅ | `/courses/:slug`, `/software/:slug` |
| Blog CMS + AI rewrite | ✅ | `/blog`, `/admin/blog` + DeepSeek |
| Blog crawler cron | ✅ | 08:00 daily VPS — [`content-crawler-SPEC.md`](./content-crawler-SPEC.md) |
| Leads API + admin | ✅ | `/api/leads`, `/admin/leads` |
| LeadCapture detail pages | ✅ | software + course detail |
| Ebook gate | ✅ | `/ebook/fullstack-roadmap` |
| Booking | ✅ | `/booking` |
| Behavior popup (3+ pages) | ✅ | `GtmBehaviorTracker` → `ConsultationPopup` |
| Slide-in 30s + scroll CTA 70% | ✅ | `ConsultationSlideIn`, `GtmScrollCtaBar` |
| Software download gate | ✅ | `SoftwareDownloadGate` |
| Lead nurture email | ✅ | `sendLeadNurtureEmail` (Resend) |
| IT Services pricing + case study | ✅ | `/it-services` §pricing |
| Sitemap, robots, llms.txt, prerender | ✅ | |
| GA4 client + custom events | ✅ | `gtm-analytics.ts`; events §4.1 |
| GA4 Measurement ID (admin) | ✅ | `/admin/settings` → `app_settings`; runtime `GET /api/config` |
| GA4 admin embed (reporting API) | 🟡 | Cần `GA4_PROPERTY_ID` + service account trên VPS |

Chi tiết: [`product.md`](./product.md) §14.6.

### 2.2. Content inventory (2026-06-19)

| Asset | Production | GTM target (tháng 1–3) |
|-------|------------|-------------------------|
| Software catalog | ~4,100+ | ✅ Đủ volume SEO |
| Courses | ~310+ | ✅ Đủ volume; cần enrich top pages |
| Blog posts (published) | ~5 | **10–15** bài lộ trình |
| Blog drafts (crawler) | ~68+ | Review → AI rewrite → publish |
| Case study IT Studio | 3 (section `/it-services`) | Enrich thêm blog/case chi tiết |
| Ebook PDF file | Gate form có; file PDF cần xác nhận | 1 PDF + email auto |

Nguồn data populate: [`content-populate.md`](./content-populate.md), [`data-expansion.md`](./data-expansion.md).

---

## 3. KPI & đo lường

### 3.1. Target tháng 1–3

| Metric | Target | Nguồn đo |
|--------|--------|----------|
| Organic traffic | 500–2,000/tháng | GA4 |
| SEO keywords top 10 | ~70 long-tail | Search Console |
| Lead capture rate | 3–5% | leads / sessions (GA4 event) |
| Leads/tháng | 15–100 | `/admin/leads` |
| Lead → đơn | 5–10% | CRM manual |
| Đơn mới/tháng | 1–3 | IT Studio + Marketplace |
| Giá trị đơn TB | 15–50tr (IT) / 500k–5tr (MP) | Admin orders |
| Ad spend | **$0** | — |

### 3.2. Cadence review

| Tần suất | Việc | Owner |
|----------|------|-------|
| Hàng tuần | Traffic, leads mới, top queries GSC | Admin |
| Hàng tháng | KPI bảng §3.1, content calendar | Admin |
| Hàng quý | Điều chỉnh keyword focus, gói giá | Founder |

---

## 4. Analytics setup checklist

### 4.1. GA4 (client — đã có)

- [x] Measurement ID — admin `/admin/settings` (DB) hoặc env `VITE_GA_MEASUREMENT_ID` / `GA_MEASUREMENT_ID`
- [x] Runtime client load qua `GET /api/config` (không cần rebuild khi đổi ID trong admin)
- [x] Custom events (`client/src/lib/gtm-analytics.ts`):
  - `lead_submit` — form `/api/leads` success
  - `download_click` — nút Tải ngay software detail (sau download gate)
  - `booking_view` — `/booking` page view
  - `ebook_gate_submit` — ebook form success
  - `page_view` — SPA route change (`analytics.tsx`)

**Lưu ý:** `ca-pub-…` (AdSense) ≠ `G-…` (GA4). AdSense script trong `client/index.html`; GA4 cấu hình riêng.

### 4.2. GA4 Reporting API (admin embed — partial)

Env trên VPS (`.env` / `VPS_ENV_B64`):

```bash
GA4_PROPERTY_ID=123456789
GA4_CLIENT_EMAIL=...@....iam.gserviceaccount.com
GA4_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

- [ ] Service account có quyền **Viewer** trên GA4 property
- [ ] Verify `GET /api/admin/analytics/ga4-traffic` trả data tại `/admin/analytics`
- [ ] Document trong `scripts/build-vps-env.sh` / sync secrets

### 4.3. Google Search Console

> Hướng dẫn đầy đủ: [`google-search-console.md`](./google-search-console.md)

- [ ] Tạo property `https://swhubco.com` trên [Search Console](https://search.google.com/search-console)
- [ ] Lấy HTML tag token → lưu tại `/admin/settings` (card Search Console) hoặc env `GOOGLE_SITE_VERIFICATION`
- [ ] Bấm **Verify** trên GSC (meta tag inject runtime vào homepage)
- [ ] Submit sitemap: `sitemap.xml` (URL đầy đủ hiển thị trong admin settings)
- [ ] Monitor: crawl errors, Core Web Vitals, top queries
- [ ] Re-submit sitemap sau bulk seed / publish blog lớn

### 4.4. UTM convention (outreach / share)

```
?utm_source=facebook&utm_medium=group&utm_campaign=lo-trinh-frontend-2026
?utm_source=zalo&utm_medium=direct&utm_campaign=case-study-sme
```

Ghi `source` vào lead nếu có (`leads.source` field).

---

## 5. Lead operations

### 5.1. SLA

| Sự kiện | SLA | Hành động |
|---------|-----|-----------|
| Lead mới (form/popup/ebook) | **≤ 4 giờ** (giờ hành chính) | Gọi warm — không bán ngay |
| Lead qualified | ≤ 24h | Gửi brief email + hẹn discovery |
| Quote gửi | ≤ 3 ngày sau discovery | Dùng Quote module sẵn có |

### 5.2. Lead status workflow (`/admin/leads`)

| Status | Ý nghĩa | Bước tiếp |
|--------|---------|-----------|
| `pending` | Mới vào | Gọi trong 4h |
| `contacted` | Đã liên hệ | Discovery call |
| `qualified` | Có nhu cầu + budget | Gửi quote |
| `won` | Chốt đơn | Chuyển project/order |
| `lost` | Không phù hợp | Ghi notes, nurture email (optional) |

### 5.3. Discovery call script (tóm tắt)

1. Cảm ơn + xác nhận nguồn (course/software/blog nào)
2. Họ cần **học** hay **làm project**?
3. Nếu học → tư vấn lộ trình, add nurture list
4. Nếu làm → scope, timeline, budget range, người quyết định
5. Hẹn gửi brief email trong 24h

### 5.4. Gói dịch vụ tham chiếu (IT Studio)

| Gói | Phù hợp | Giá tham khảo |
|-----|---------|---------------|
| Web Starter | Shop, landing | 8–15tr |
| Business Pro | SME web + CRM/booking | 20–50tr |
| MVP Launch | Startup | 50–150tr |
| Custom Solution | Trường / DN lớn | 100–300tr |

Hiển thị public: section **Bảng giá tham khảo** + **Case study SME** trên `/it-services` (✅ Done).

---

## 6. Content operations

### 6.1. Ưu tiên content (tháng 1)

| # | Loại | Số lượng | Công cụ / path |
|---|------|----------|----------------|
| 1 | Blog lộ trình học | 5–10 bài publish | `/admin/blog` — filter draft crawler → AI rewrite |
| 2 | Enrich top courses SEO | 20–50 trang | `/admin/courses` — 500–800 từ, internal links |
| 3 | Software install guides VN | 20–30 trang | `/admin/software-seo` — EVKey, Docker, VS Code… |
| 4 | Case study IT Studio | 2–3 | Blog hoặc `/it-services` |
| 5 | Ebook PDF | 1 file | Upload + email Resend sau gate |

### 6.2. Template blog lộ trình

- Title: `Lộ trình học [X] trong [N] tháng — miễn phí 100%`
- Internal links: 5–10 course URLs liên quan
- CTA cuối bài: `LeadCaptureForm` hoặc link `/booking`
- Share: 2–3 Facebook groups IT / lập trình VN

### 6.3. Course/software SEO quality bar

Mỗi trang priority phải có:

- [ ] Title + meta description unique
- [ ] ≥ 500 từ tiếng Việt (không chỉ auto `buildSeoContent`)
- [ ] ≥ 3 internal links
- [ ] CTA lead capture cuối trang
- [ ] Schema valid (Course / SoftwareApplication)

---

## 7. Conversion funnel — code vs backlog

| Trigger | SPEC / GTM doc | Code | Backlog ID |
|---------|----------------|------|------------|
| Xem 3+ trang course/software/blog | go-to-market.md §5 | ✅ `usePageTracking` | — |
| LeadCapture cuối detail | SPEC §14.5 | ✅ | — |
| Ebook gate + booking | SPEC §14.5 | ✅ | — |
| Popup consultation | SPEC §14.6 | ✅ | — |
| Gate form khi click Tải ngay | go-to-market.md §5 | ✅ `SoftwareDownloadGate` | — |
| Slide-in sau 30s | go-to-market.md §5 | ✅ `ConsultationSlideIn` | — |
| Bottom bar scroll 70% | go-to-market.md §5 | ✅ `GtmScrollCtaBar` | — |
| Email nurture sau lead | go-to-market.md §5 | ✅ `sendLeadNurtureEmail` (Resend) | — |
| GA4 custom events | §4.1 | ✅ `gtm-analytics.ts` | — |
| Pricing/case study trên `/it-services` | go-to-market.md §6 | ✅ | — |

---

## 8. Distribution (organic outreach)

Song song SEO (rủi ro: SEO 3–6 tháng mới có kết quả — `go-to-market.md` §8).

### 8.1. Kênh

| Kênh | Hành động | Tần suất |
|------|-----------|----------|
| Facebook groups IT VN | Share blog lộ trình + link course | 2–4 bài/tháng |
| Zalo / warm network | Case study, referral | Ad-hoc |
| Google Maps outreach | Chủ shop cần web | Ad-hoc |

### 8.2. Không làm (giai đoạn 1)

- Paid Facebook/Google Ads
- Marketplace mở seller không kiểm duyệt
- Spam group / copy-paste link hàng loạt

---

## 9. Liên kết tài liệu

| File | Vai trò |
|------|---------|
| [`product.md`](./product.md) §14 | GTM strategy + implementation status (tech) |
| [`go-to-market.md`](./go-to-market.md) | Chiến lược dài hạn, persona, AI Hub vision |
| [`content-populate.md`](./content-populate.md) | Crawl/seed data pipeline |
| [`data-expansion.md`](./data-expansion.md) | Nguồn data + UI backlog catalog |
| [`ui-improvement-v1.md`](./ui-improvement-v1.md) | Design system |

---

## 10. Implementation checklist (ops — không cần deploy)

Tuần 1:

- [ ] Search Console verify + submit sitemap
- [ ] GA4_PROPERTY_ID trên VPS + test admin chart
- [ ] Viết 2 blog lộ trình + share 1 group
- [ ] Enrich 10 course priority trong admin CMS

Tuần 2–4:

- [ ] 8 blog posts tổng
- [ ] 2 case study draft
- [ ] Lead playbook training (SLA 4h)
- [ ] Audit top 30 software pages SEO

---

## 11. Phase 7 preview (AI Hub — chưa implement)

Chiến lược: [`go-to-market.md`](./go-to-market.md) §1 (Software Hub + AI Hub).

| Hạng mục | Priority | Ghi chú |
|----------|----------|---------|
| AI Prompt Generator (free tool) | P2 | SEO "công cụ tạo prompt" |
| 5 khóa AI free | P2 | Content + course pages |
| AI Integration consulting gói | P3 | Monetization |

**Không** gộp vào Phase 6 data expansion — track riêng khi ops GTM ổn định.
