# SPEC: Content Populate & Download.com.vn Integration

## Objectives
- [x] Populate DB với free software data (awesome-free-software ~500+ entries)
- [x] Populate DB với IT courses (EbookFoundation + YouTube channels)
- [ ] Parse download.com.vn → thêm phần mềm Việt Nam vào `softwares` table
- [x] Tất cả content hiển thị trên UI (home page, `/software`, `/courses`) sau khi seed
- [x] Lead capture form trên software detail + course detail pages để build GTM funnel

## Non-Goals
- Không làm thay đổi schema DB (không thêm/bớt table/column) ngoài phạm vi seed/content
- Không xử lý các nguồn crawl mới ngoài `download.com.vn` (VD: app store, crack sites)
- Không cố tối ưu SEO/performance sâu (chỉ đảm bảo UI/UX & API hoạt động đúng sau khi seed)

## Data Sources

### 1. Free Software (existing)
- Source: awesome-free-software (GitHub README)
- Script: `scripts/parse-free-software.ts` → `scripts/free-software-data.json`
- Seed: `scripts/seed-free-software.ts`
- ~500 entries
- Categories hiển thị trên UI được **remap theo user-need taxonomy** (không còn “bucket theo nguồn/platform”)
  - Taxonomy file: `shared/software-category-taxonomy.ts`
  - API categories cho UI: `GET /api/softwares/categories` (trả `slug`, `name`, `count`)

### 2. IT Courses (existing)
- Source: EbookFoundation + manual YouTube channels
- Script: `scripts/parse-it-courses.ts`
- Seed: `scripts/seed-it-courses-v2.ts` (recommended, handles slugs + dedup)
- Topics: JavaScript, Python, React, Flutter, PHP, NodeJS, Android, C, etc.

### 3. Download.com.vn (new — to be built)
- Source: https://download.com.vn/
- Vietnamese software portal — categories: Windows, Android, iOS, Web, Games
- Script mới: `scripts/parse-downloadcomvn.ts` → `scripts/downloadcomvn-data.json`
- Seed: reuse `seed-free-software.ts` logic or write dedicated seed
- Expected: 50-100+ Vietnamese software entries (freeware, open source, tools)

## Current Product Behavior (matching source code)

### Software list UI (`/software`)
- Filters (query params):
  - `page` (1-based), `limit`
  - `category` (category slug từ `GET /api/softwares/categories`)
  - `platform`: `windows|mac|linux|android|ios|web`
  - `search`: text search theo `name`
  - `sort`: `name|popular|recent|rating`
- Back navigation:
  - Software detail link luôn kèm `returnTo` để quay lại đúng trang/filter trước đó.
  - Fix production: query params được đọc từ `window.location.search` (vì wouter `location` không có query string).
  - Helper: `client/src/lib/url-search.ts`

### Courses list UI (`/courses`)
- Filters (query params):
  - `page`, `limit`
  - `topic`, `level`, `search`
  - `sort`: `recent|newest|title|title_desc`
- Sort mapping (API):
  - `recent`: mới cập nhật (order by `updated_at` desc)
  - `newest`: mới thêm (order by `created_at` desc)
  - `title`: A→Z
  - `title_desc`: Z→A
- Back navigation:
  - Course detail link luôn kèm `returnTo` để quay lại đúng list state.

### External links trên Software detail
- UI tránh mở “Tài liệu chính thức” trùng với “Tải về” khi `documentation_link === download_link` (đặc biệt với self-hosted entries).
- URL normalization + harden double click nằm trong `client/src/lib/software-utils.ts`.

## Technical Approach

### Parse download.com.vn
- Playwright-based crawler (like existing parse scripts)
- Categories to scrape:
  - Windows: Ung dung van phong, Do hoa, Bao mat, Mang internet, etc.
  - Android: Ung dung, Game
  - iOS: Ung dung, Game
- Fields to extract: name, description, category, platform, download link, image, license info
- Output: `scripts/downloadcomvn-data.json`

### Seed Strategy
| Step | Script | Est. Entries |
|------|--------|-------------|
| 1. Seed free software | `seed-free-software.ts` | ~500 |
| 2. Seed IT courses | `seed-it-courses-v2.ts` | ~200-400 |
| 3. Parse download.com.vn | `parse-downloadcomvn.ts` (new) | 50-100+ |
| 4. Seed download.com.vn | `seed-downloadcomvn.ts` (new) | 50-100+ |

### Lead Capture (Conversion Funnel)
- Add `LeadCapture` component to software detail page + course detail page
- Trigger: user scrolls to bottom / clicks download / after 30s on page
- Form: name, email, phone (minimal)
- Submit to `/api/leads` — already has `leads` table in schema
- Purpose: collect leads for IT Services team (SME/startup who download software → may need custom dev)

## Implementation Plan
1. [ ] Parse download.com.vn → JSON data file
2. [ ] Write seed script for download.com.vn data
3. [ ] Run seed free software on production (SSH + Docker exec)
4. [ ] Run seed IT courses on production
5. [ ] Seed download.com.vn data
6. [ ] Add LeadCapture component to software detail + course detail pages
7. [ ] Verify: home page shows content, /software shows 500+ items, /courses shows 200+ items

## Boundaries
- **Always do:** dry-run first, check for duplicates before insert
- **Ask first:** schema changes, adding dependencies
- **Never do:** delete existing data, run untested parse scripts on production

## Open Questions
- [ ] download.com.vn có chống crawler không? Cần Playwright headless hay chỉ HTTP GET là đủ?
