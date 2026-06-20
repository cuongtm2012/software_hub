# Google Search Console (GSC) — Setup Guide

> **Production:** https://swhubco.com  
> **Cập nhật:** 2026-06-19

---

## 1. Google Search Console là gì?

**Google Search Console** (GSC) là công cụ **miễn phí** của Google dành cho chủ website. Khác với **GA4** (đo traffic trên site), GSC trả lời:

| Câu hỏi | GSC trả lời |
|---------|-------------|
| Google đã index trang nào chưa? | Báo cáo **Pages** / **Indexing** |
| Trang nào bị lỗi crawl? | **Page indexing** issues |
| Khách search gì mà thấy site? | **Performance** → queries, impressions, clicks |
| Sitemap có hợp lệ không? | **Sitemaps** status |

**Không có GSC** → site vẫn có thể lên Google (bot tự crawl), nhưng **chậm hơn** và **không biết** trang nào được index, lỗi gì, keyword nào có impression.

---

## 2. Hai việc trong checklist SPEC

| Việc | Ai làm | Code đã hỗ trợ? |
|------|--------|-----------------|
| **Verify** (xác minh sở hữu domain) | Admin + Google account | ✅ Meta tag inject qua `/admin/settings` |
| **Submit sitemap** (báo Google danh sách URL) | Admin trên GSC dashboard | ✅ `sitemap.xml` đã live; submit thủ công 1 lần |

> Submit sitemap **không thể** tự động hoàn toàn trong code (cần đăng nhập Google + OAuth Search Console API). Quy trình chuẩn: verify xong → paste URL sitemap trong GSC UI (~2 phút).

---

## 3. Code hiện có (đã ship)

| Asset | URL | File |
|-------|-----|------|
| Sitemap động | `GET /sitemap.xml` | `server/routes/sitemap.routes.ts` |
| Robots | `GET /robots.txt` | Cùng file — có dòng `Sitemap: …/sitemap.xml` |
| LLM discovery | `GET /llms.txt` | Cùng file |
| E2E test | — | `tests/e2e/smoke.spec.ts` |
| Verification meta | Inject vào `index.html` khi serve | `server/lib/inject-html-meta.ts` + `gsc-settings.ts` |
| Admin config | `/admin/settings` → card **Google Search Console** | `client/src/pages/admin/settings-page.tsx` |
| API admin | `GET/PUT /api/admin/settings/gsc` | `server/routes/admin.routes.ts` |

### Sitemap bao gồm

- Trang tĩnh: `/`, `/courses`, `/software`, `/blog`, `/marketplace`, `/it-services`, ebook, booking
- Dynamic (tối đa 500 mỗi loại): courses, blog published, software approved, marketplace products approved

**Giới hạn:** Google khuyến nghị ≤50.000 URL/sitemap. Catalog ~4.100 software — phần lớn **chưa** có trong sitemap (cap 500). Mở rộng sitemap index là backlog SEO (§7).

---

## 4. Quy trình setup (lần đầu)

### Bước 1 — Tạo property trên GSC

1. Vào [Google Search Console](https://search.google.com/search-console)
2. **Add property** → chọn **URL prefix**: `https://swhubco.com`
3. Chọn phương thức **HTML tag** (meta tag)
4. Google hiển thị dạng:
   ```html
   <meta name="google-site-verification" content="XXXXXXXXXXXX" />
   ```
5. **Chỉ copy phần `content`** (chuỗi `XXXXXXXXXXXX`) — không copy cả thẻ meta

### Bước 2 — Lưu token vào Software Hub

**Cách A (khuyến nghị):** Admin UI

1. Đăng nhập admin → `/admin/settings`
2. Card **Google Search Console** → dán verification token → **Lưu**
3. Server tự inject meta vào mọi response `index.html` (không cần rebuild)

**Cách B:** Env trên VPS

```bash
GOOGLE_SITE_VERIFICATION=XXXXXXXXXXXX
```

Trong `.env` hoặc `VPS_ENV_B64`. DB admin ưu tiên hơn env nếu cả hai đều có.

### Bước 3 — Verify trên Google

1. Quay lại GSC → bấm **Verify**
2. Google fetch `https://swhubco.com/` và tìm meta tag
3. Thành công → property active

**Kiểm tra nhanh:**

```bash
curl -s https://swhubco.com/ | grep google-site-verification
```

### Bước 4 — Submit sitemap (thủ công)

1. GSC → menu **Sitemaps** (bên trái)
2. **Add a new sitemap** → nhập: `sitemap.xml`
3. Submit → status **Success** (có thể mất vài giờ–vài ngày để Google crawl hết)

URL đầy đủ: `https://swhubco.com/sitemap.xml`

### Bước 5 — Search Console + GA4 (optional link)

Trong GA4 admin property có thể link Search Console để xem query trong GA4. Không bắt buộc.

---

## 5. Phương thức verify khác (không cần code)

| Phương thức | Khi nào dùng |
|-------------|--------------|
| **DNS TXT record** | Có quyền DNS domain (Cloudflare, registrar) — không cần deploy code |
| **HTML file** | Upload file lên root — cần route static `/googleXXXX.html` |
| **Google Analytics** | Đã verify GA4 cùng account — one-click nếu GA4 đã linked |

Meta tag (§4) là cách **đã implement** — phù hợp monolith SPA.

---

## 6. Vận hành sau khi setup

| Tần suất | Việc |
|----------|------|
| Hàng tuần | Xem **Performance** — top queries, CTR |
| Hàng tuần | **Indexing** — trang bị excluded / error |
| Sau bulk content | Re-submit sitemap (GSC → Sitemaps → resubmit) |
| Sau publish blog mới | Sitemap tự cập nhật (dynamic); Google crawl lại theo `changefreq` |

Cadence chi tiết: [`gtm-operations.md`](./gtm-operations.md) §3.

---

## 7. Backlog code (optional)

| # | Feature | Priority |
|---|---------|----------|
| GSC-1 | Sitemap index — chia software/courses >500 URL | Medium |
| GSC-2 | Search Console API embed trong `/admin/analytics` | Low |
| GSC-3 | Ping Google sau publish blog (`google.com/ping?sitemap=…`) | Low |

---

## 8. So sánh GA4 vs GSC vs AdSense

| | GA4 | Search Console | AdSense |
|---|-----|----------------|---------|
| Mục đích | Traffic **trên site** | Hiện diện **trên Google Search** | Quảng cáo |
| ID | `G-…` | Verification token | `ca-pub-…` |
| Cấu hình | `/admin/settings` GA4 card | `/admin/settings` GSC card | `client/index.html` |

---

## 9. Troubleshooting

| Lỗi | Cách xử lý |
|-----|------------|
| Verify failed — tag not found | Kiểm tra `curl` homepage có meta; clear CDN cache |
| Sitemap "Couldn't fetch" | `curl -I https://swhubco.com/sitemap.xml` → 200 + `application/xml` |
| Indexed 0 pages | Bình thường tuần đầu; đảm bảo `robots.txt` Allow `/` |
| Chỉ ~500 software trong sitemap | Cap hiện tại — xem §7 GSC-1 |

---

*Liên quan: [`product.md`](./product.md) §14.4, [`gtm-operations.md`](./gtm-operations.md) §4.3*
