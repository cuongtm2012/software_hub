# SPEC: Content Populate & Download.com.vn Integration

> Data pipeline cho catalog SEO. GTM vận hành (content quality, leads, KPI): [`gtm-operations.md`](./gtm-operations.md).

## Objectives
- [x] Populate DB với free software data (awesome-free-apps + awesome-selfhosted)
- [x] Populate DB với IT courses (EbookFoundation + YouTube channels)
- [x] Parse download.com.vn → JSON (`scripts/data/downloadcomvn.json`)
- [x] Seed download.com.vn vào production (`npm run seed:free-software`) — 639 entries crawl, ~4,100+ software total
- [x] Tất cả content hiển thị trên UI (home page, `/software`, `/courses`) sau khi seed
- [x] Lead capture form trên software detail + course detail pages

## Non-Goals
- Không thay đổi schema DB
- Không crawl nguồn mới ngoài `download.com.vn`
- Không rehost file — chỉ lưu link gốc

## Data Sources

### 1. Free Software (GitHub awesome lists)
- **awesome-free-apps:** `scripts/parse-awesome-free-apps.ts` → `scripts/data/awesome-free-apps.json`
- **awesome-selfhosted:** `scripts/parse-awesome-selfhosted.ts` → `scripts/data/awesome-selfhosted.json`
- **Seed:** `scripts/seed-all-free-software.ts` (merge 3 nguồn, gồm download.com.vn)
- Categories trên UI dùng **user-need taxonomy** (`shared/software-category-taxonomy.ts`)
- API: `GET /api/softwares/categories` (slug + name + count)

### 2. IT Courses
- **EbookFoundation:** `scripts/parse-ebookfoundation-courses.ts`
- **YouTube VN:** `scripts/parse-youtube-channels.ts`
- **Seed:** `scripts/seed-it-courses-v2.ts`

### 3. Download.com.vn
- Source: https://download.com.vn/
- **Parse:** `scripts/parse-downloadcomvn.ts` → `scripts/data/downloadcomvn.json`
- **Seed:** qua `scripts/seed-all-free-software.ts` (không có script seed riêng)
- Chi tiết crawl: xem [`data-expansion.md`](./data-expansion.md) § Download.com.vn

## Parse download.com.vn — Process

### Pipeline
```
Playwright crawl → downloadcomvn.json → seed-all-free-software.ts → DB
```

### Commands
```bash
# Parse riêng (chậm, ~3-4h full crawl)
npm run parse:downloadcomvn

# Parse tất cả nguồn (GitHub + courses + download.com.vn)
npm run data:parse:full

# Seed (dry-run trước)
npm run seed:free-software -- --dry-run
npm run seed:free-software
```

### Env vars
| Var | Default | Mô tả |
|-----|---------|-------|
| `PARSE_LIMIT` | `50` | Max items mỗi category |
| `PARSE_MAX_PAGES` | `5` | Max trang list (`?p=2`, `?p=3`…) |
| `PARSE_CATEGORIES` | all 14 keys | Danh sách category keys, comma-separated |

### Category keys (`PARSE_CATEGORIES`)
| Key | Path | Taxonomy subcategory |
|-----|------|---------------------|
| `windows` | `/windows` | utility → tien-ich |
| `games` | `/download-game-tro-choi` | games |
| `office` | `/download-phan-mem-van-phong` | office → van-phong |
| `education` | `/download-phan-mem-giao-duc` | education → giao-duc |
| `video` | `/download-phan-mem-video` | video → am-thanh-video |
| `devtools` | `/download-cong-cu-lap-trinh` | development → lap-trinh |
| `business` | `/download-phan-mem-doanh-nghiep` | office |
| `network` | `/download-phan-mem-mang` | internet |
| `audio` | `/download-phan-mem-nhac-audio` | audio |
| `driver` | `/download-driver-firmware` | utility → tien-ich |
| `graphics` | `/download-do-hoa` | graphics → do-hoa |
| `social` | `/download-mang-xa-hoi` | communication |
| `android` | `/android` | utility → tien-ich |
| `ios` | `/ios` | utility → tien-ich |

`subcategory` dùng **English alias** để `resolveUseCategorySlug()` map đúng taxonomy khi seed.

### Fields extracted
| Field | Nguồn |
|-------|-------|
| `name`, `description` | List page + detail page |
| `url` | Detail page URL |
| `download_link` | `#DownloadButtonTop[data-downloadurl]` |
| `version` | Info box "Version:" hoặc regex từ h1 |
| `vendor` | Info box "Phát hành:" |
| `license` | Info box "Sử dụng:" |
| `image_url` | `meta[property="og:image"]` |
| `platform` | Từ category config |
| `category`, `subcategory` | Từ category config (không hardcode "download.com.vn") |

### Download link policy
- Mirror/redirect domains (`fa.getpedia.net`, `bit.ly`…) → fallback về page URL
- Không rehost file

### Seed Strategy
| Step | Script | Est. Entries |
|------|--------|-------------|
| 1. Parse GitHub sources | `parse-awesome-free-apps` + `parse-awesome-selfhosted` | ~2600 |
| 2. Parse download.com.vn | `parse-downloadcomvn` | 50–500+ |
| 3. Parse courses | `parse-ebookfoundation` + `parse-youtube-channels` | ~200+ |
| 4. Seed software | `seed-all-free-software.ts` | merge 3 JSON |
| 5. Seed courses | `seed-it-courses-v2.ts` | ~200+ |

Dedup: theo `name` (case-insensitive). Entry trùng tên → update, không insert duplicate.

## Implementation Plan
1. [x] Parse download.com.vn → JSON (`parse-downloadcomvn.ts`)
2. [x] Seed script merge download.com.vn (`seed-all-free-software.ts`)
3. [x] Category mapping → user-need taxonomy
4. [x] Chạy full crawl production (`PARSE_LIMIT=50 PARSE_MAX_PAGES=5`) — 639 unique entries
5. [x] Seed production (`npm run seed:free-software`) — 594 inserted, 1931 updated
6. [x] LeadCapture trên software/course detail
7. [x] Verify UI: home, `/software`, `/courses`

## GTM readiness (sau populate)

Volume DB đủ cho SEO; tiếp theo là **chất lượng content** — xem [`gtm-operations.md`](./gtm-operations.md) §6:

- [ ] Enrich top 20–50 course pages (500–800 từ)
- [ ] Publish 10+ blog lộ trình (crawler cron đã tạo draft — review tại `/admin/blog`)
- [ ] 20–30 software install guides tiếng Việt
- [ ] 2–3 case study IT Studio chi tiết

**Blog crawler:** [`content-crawler-SPEC.md`](./content-crawler-SPEC.md) — cron 08:00 VPS, không thuộc pipeline seed catalog.

## Boundaries
- **Always do:** dry-run seed trước, dedup theo name
- **Ask first:** schema changes, thêm dependencies
- **Never do:** delete existing data, chạy untested parse trên production

## Resolved Questions
- [x] download.com.vn cần Playwright (JS-rendered) — HTTP GET không đủ
- [x] Seed không cần script riêng — merge qua `seed-all-free-software.ts`
