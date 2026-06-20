# SPEC: Software Hub Blog Content Crawler

> Đặc tả **crawler cho module blog hiện tại**, sử dụng table `blog_posts` và admin CMS `/admin/blog` (không tạo schema mới).

**Status (2026-06):** ✅ Implemented + cron production VPS.

## 1. Mục tiêu

Cronjob chạy định kỳ, crawl bài viết mới từ vài nguồn blog IT, lưu vào Software Hub dạng **blog post draft** trong bảng `blog_posts`. Admin dùng `/admin/blog` để review → AI rewrite (DeepSeek) → publish hoặc archive.

---

## 2. Nguồn crawl

| # | Nguồn | Phương thức | Status |
|---|-------|-------------|--------|
| 1 | **dev.to** | API public JSON — multi-tag (`webdev`, `javascript`, `react`, `devops`, `programming`) | ✅ Implemented |
| 2 | **freeCodeCamp** | RSS `https://www.freecodecamp.org/news/rss/` | ✅ Implemented |
| 3 | **Hashnode** | RSS `https://townhall.hashnode.com/rss` | 🟡 Code có; **tắt trên cron prod** (429 rate limit) |
| 4 | **Juejin (掘金)** | API JSON | ⬜ Chưa implement |
| 5 | **SegmentFault** | HTTP GET + HTML parse | ⬜ Chưa implement |

**Cron production default:** `BLOG_CRAWLER_SOURCES=devto,freecodecamp` (xem `scripts/run-blog-crawl-cron.sh`).

---

## 3. Database Schema (khớp code hiện tại)

Blog dùng table `blog_posts` trong `shared/schema.ts` — crawler **không tạo table mới**.

- Map: `title`, `slug`, `excerpt`, `content`, `cover_image`, `tags`
- `status = 'draft'`, `author_name = 'Curation Bot'`
- Tags metadata: `source:devto`, `source:freecodecamp`, …
- Dedup theo **`slug`** (từ title)
- Cuối content: block attribution `Original: [title](url) — Nguồn: SOURCE`

**Future (optional migration):** cột `source_url UNIQUE` cho dedup chuẩn hơn — chưa làm.

---

## 4. Cấu trúc project (as-built)

```
scripts/
  blog-crawler/
    config.ts           # BLOG_CRAWLER_CONFIG (sources, tags, RSS URLs)
    types.ts            # CrawledPost, BlogCrawlerSource
    utils.ts            # toBlogSlug, buildAttribution, sanitize
    sources/
      devto.ts          # crawlDevtoTags()
      rss.ts            # crawlRss() — freecodecamp + hashnode
  run-blog-crawler.ts   # CLI entry — direct Drizzle insert
  run-blog-crawl-cron.sh      # VPS wrapper + log
  install-blog-crawler-cron.sh # Idempotent crontab install
```

**Build:** `tsconfig.server.json` includes crawler → `dist/scripts/run-blog-crawler.js` (post-build ESM fix via `scripts/fix-esm-imports.mjs`).

**NPM scripts:**

| Command | Mô tả |
|---------|--------|
| `npm run blog:crawl` | Dev — `tsx scripts/run-blog-crawler.ts` |
| `npm run blog:crawl:prod` | Prod — `node dist/scripts/run-blog-crawler.js` |

**CLI flags:** `--dry-run`, `--sources=devto,freecodecamp`, `--limit=N`

---

## 5. Luồng xử lý

```
1. Cron 08:00 Asia/Ho_Chi_Minh (hoặc manual npm run blog:crawl)
       │
2. run-blog-crawler.ts:
   - Parse args; default sources: devto, freecodecamp, hashnode (CLI)
   - Cron prod: devto, freecodecamp only
       │
3. Per source (delay giữa requests):
   ├── Fetch API/RSS
   ├── Parse → CrawledPost[]
   └── max N bài/source (default 15)
       │
4. Dedup by slug → skip existing
       │
5. Insert draft vào blog_posts (Drizzle direct — không qua REST API)
       │
6. Log summary + append /var/log/software-hub-blog-crawler.log (cron)
       │
7. Admin /admin/blog:
   - Filter draft + tag source:*
   - AI rewrite (DeepSeek) → publish
```

**Production run đầu tiên (6/2026):** 68 draft inserted (devto 64 + freecodecamp 4 new).

---

## 6. Policy content & attribution

| Nguồn | Policy |
|-------|--------|
| **dev.to** | Body markdown rút gọn + link gốc |
| **freeCodeCamp** | Tóm tắt từ RSS + link gốc — không full-copy |
| **Hashnode** | Brief + link gốc |

Block cuối mỗi bài:

> Original: [Tiêu đề gốc](SOURCE_URL) — Nguồn: SOURCE_NAME

---

## 7. Config

File: `scripts/blog-crawler/config.ts`

```ts
export const BLOG_CRAWLER_CONFIG = {
  maxPostsPerSource: 15,
  sources: {
    devto: { enabled: true },
    freecodecamp: { enabled: true },
    hashnode: { enabled: true },
    juejin: { enabled: false },
    segmentfault: { enabled: false },
  },
  devto: { tags: ["webdev", "javascript", "react", "devops", "programming"] },
  rss: {
    freecodecampUrl: "https://www.freecodecamp.org/news/rss/",
    hashnodeUrl: "https://townhall.hashnode.com/rss",
  },
};
```

**Env:** `DATABASE_URL` (via `dotenv` + `server/db.ts`) — same as main app.

---

## 8. Cron job (production — implemented)

| Item | Value |
|------|-------|
| Schedule | `0 8 * * * TZ=Asia/Ho_Chi_Minh` |
| Script | `/var/www/software-hub/run-blog-crawl-cron.sh` |
| Binary | `node dist/scripts/run-blog-crawler.js` |
| Log | `/var/log/software-hub-blog-crawler.log` |
| Install | Auto on deploy via `deploy-vps-docker.sh` → `install-blog-crawler-cron.sh` |

**Manual trên VPS:**

```bash
cd /var/www/software-hub
./run-blog-crawl-cron.sh
# hoặc dry-run:
NODE_ENV=production node dist/scripts/run-blog-crawler.js --dry-run --sources=devto --limit=3
```

**Verify cron:** `crontab -l | grep software-hub-blog-crawler`

---

## 8.1. AI rewrite trong blog editor — ✅ Implemented

### API

- `POST /api/blog/admin/ai-rewrite` — `hasRole(["admin"])`, rate limit `aiRewriteRateLimiter`
- Provider: **DeepSeek** (`server/lib/deepseek.ts`)
- Config: `/admin/settings` → `app_settings` key `deepseek_api_key` hoặc env `DEEPSEEK_API_KEY`

### Presets

`seo_vi` | `summarize` | `normalize_markdown` | `translate_en_vi`

### UI

`/admin/blog` — modal editor có panel "Sửa bằng AI" (`blog-management-page.tsx`).

### Chưa làm (Phase 2)

- Table `ai_rewrite_logs` (audit prompt/output)
- Undo/revert bản raw trước rewrite

---

## 9. Tech stack

| Thành phần | Công nghệ |
|-----------|-----------|
| Ngôn ngữ | TypeScript (Node 20) |
| HTTP | native `fetch` |
| RSS | parsed in `rss.ts` |
| DB | Drizzle ORM → Supabase Postgres |
| Schedule | VPS crontab (not PM2 cron) |
| AI rewrite | DeepSeek OpenAI-compatible API |

---

## 10. Risk & Mitigation

| Risk | Mitigation |
|------|-----------|
| Nguồn đổi API/RSS | Module riêng per source; log lỗi, không fail whole job |
| Rate limit (Hashnode 429) | Exclude khỏi cron prod; retry manual |
| Trùng bài | Dedup slug |
| Content không phù hợp | Filter tags; admin review trước publish |
| Auto-publish | **Không** — luôn draft |

---

## 11. Output mong đợi

- Mỗi lần chạy: tối đa N bài mới/source → `status = draft`
- Không sửa bài `published` hiện có
- Admin publish sau review + optional AI rewrite tiếng Việt

---

## 12. Backlog

| # | Feature | Priority |
|---|---------|----------|
| B1 | Bật Hashnode khi 429 ổn định hoặc có API key | Low |
| B2 | juejin + segmentfault sources | Low |
| B3 | `source_url` column + dedup | Medium |
| B4 | `ai_rewrite_logs` audit table | Low |
| B5 | Email/Telegram báo cáo sau crawl | Low |
| B6 | Cron auto-publish (không khuyến nghị) | — Out of scope |
