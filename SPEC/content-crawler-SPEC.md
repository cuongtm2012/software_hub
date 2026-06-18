# SPEC: Software Hub Blog Content Crawler

> Đặc tả **crawler cho module blog hiện tại**, sử dụng table `blog_posts` và admin CMS `/admin/blog` (không tạo schema mới).

## 1. Mục tiêu

Cronjob chạy định kỳ, crawl bài viết mới từ vài nguồn blog IT, lưu vào Software Hub dạng **blog post draft** trong bảng `blog_posts`. Admin dùng `/admin/blog` để review → chỉnh sửa nếu cần → publish hoặc archive.

---

## 2. Nguồn crawl (ví dụ)

> Danh sách nguồn có thể thay đổi trong code/config; SPEC chỉ fix **loại nguồn & policy**.

| # | Nguồn | Phương thức | Ghi chú |
|---|-------|-------------|--------|
| 1 | **dev.to** | API public JSON `GET /api/articles?per_page=5&tag=webdev` | Lấy bài mới liên quan web dev / JS. |
| 2 | **freeCodeCamp** | RSS XML `GET /news/rss/` | Tin tức, hướng dẫn lập trình. |
| 3 | **Hashnode** | RSS `GET townhall.hashnode.com/rss` | Ưu tiên RSS; nếu thay đổi, sẽ update crawler. |
| 4 | **Juejin (掘金)** | API JSON | Chỉ lấy tag kỹ thuật phổ biến; content chỉ excerpt. |
| 5 | **SegmentFault** | HTTP GET + HTML parse | Lấy title + excerpt + link. |

---

## 3. Database Schema (khớp code hiện tại)

Blog đang dùng table `blog_posts` trong `shared/schema.ts`:

```sql
CREATE TYPE blog_post_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE blog_posts (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  seo_description TEXT,
  cover_image TEXT,
  author_id INT REFERENCES users(id),
  author_name TEXT DEFAULT 'Software Hub',
  tags TEXT[],
  status blog_post_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Crawler không tạo table mới.** Thay vào đó:

- Map dữ liệu từ nguồn vào các field có sẵn:
  - `title`, `slug`, `excerpt`, `content`, `cover_image`, `tags`
  - `status = 'draft'`, `author_name = 'Curation Bot'` hoặc tương tự
- Dùng **tags** để lưu metadata về nguồn:
  - `source:devto`, `source:freecodecamp`, …
  - (optional) `lang:en`, `lang:zh`, …
- Dedup theo **`slug`** và/hoặc pattern trong `content` (ví dụ chứa `Original: https://...`).

Nếu sau này cần dedup chuẩn bằng URL gốc, có thể **mở rộng schema**:

- Thêm cột:
  - `source_name TEXT` — devto, freecodecamp, …
  - `source_url TEXT UNIQUE` — dùng dedup
  - `source_published_at TIMESTAMPTZ`
  - `imported_at TIMESTAMPTZ`

Nhưng giai đoạn đầu có thể triển khai chỉ với schema hiện tại.

---

## 4. Cấu trúc project (khớp monolith hiện tại)

Crawler được implement bằng **TypeScript/Node** trong repo hiện tại, chạy qua `npm` script, không tách repo Python riêng.

Đề xuất layout:

```
scripts/
  blog-crawler/
    sources/
      devto.ts
      freecodecamp.ts
      hashnode.ts
      juejin.ts
      segmentfault.ts
    client.ts           # HTTP client (fetch / node-fetch)
    mapper.ts           # Map raw → BlogPostInput
    storage.ts          # Gọi API backend hoặc direct Supabase
    index.ts            # Entry: orchestrate all sources
  run-blog-crawler.ts   # CLI entry, parse args, logging
```

Kiểu dữ liệu trung gian:

```ts
type CrawledPost = {
  source: "devto" | "freecodecamp" | "hashnode" | "juejin" | "segmentfault";
  sourceUrl: string;
  title: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  tags: string[];
  publishedAt?: string; // ISO string
};

type BlogPostInput = {
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  seoDescription?: string;
  coverImage?: string;
  tags?: string[];
  status: "draft" | "published" | "archived";
  authorName?: string;
};
```

---

## 5. Luồng xử lý chi tiết (khớp blog module)

```
1. Cron (hoặc manual) gọi `npm run scripts:blog-crawler`
       │
2. `run-blog-crawler.ts`:
   - Đọc config (env hoặc JSON đơn giản)
   - Quyết định nguồn nào đang enabled
       │
3. Cho từng source (có delay 1-2s giữa calls):
   ├── Gọi API/RSS/HTML tương ứng
   ├── Parse dữ liệu → `CrawledPost[]`
   └── Trả về tối đa N bài (vd: 5/source/lần chạy)
       │
4. Dedup:
   - Tạo slug từ title (vd `toSlug(title)`)
   - (Optional) nếu có `sourceUrl` → check xem blog post nào đã chứa URL này
       │
5. Với mỗi bài mới (chưa có trong blog):
   ├── Sanitize: strip HTML tags không cần thiết, giới hạn độ dài excerpt
   ├── Map sang `BlogPostInput`
   ├── Set:
   │     - status = 'draft'
   │     - author_name = 'Curation Bot'
   │     - tags += [`source:${source}`, `lang:en`/`lang:zh`…]
   └── Insert vào `blog_posts` (qua API `/api/blog/admin/import` hoặc script DB)
       │
6. Log kết quả:
   "Source X: Y bài (Z mới, W trùng)"
       │
7. (Optional) Gửi báo cáo tổng kết (email/Telegram)
       │
8. Admin → `/admin/blog`:
   - Filter status = draft, search theo `source:*`
   - Review nội dung, chỉnh tiêu đề/seo
   - Publish (status = 'published') hoặc Archive
```

---

## 6. Policy content & attribution

| Nguồn | Policy lưu content trong `blog_posts.content` |
|-------|-----------------------------------------------|
| **dev.to** | Lưu nội dung tóm tắt hoặc phần body markdown rút gọn (nếu license cho phép) + link gốc. |
| **freeCodeCamp** | Lưu tóm tắt từ RSS, không full-copy toàn bộ bài; luôn có link gốc rõ ràng. |
| **Hashnode** | Lưu brief (tóm tắt) + link gốc, không mirror toàn content. |
| **Juejin** | Chỉ lưu excerpt tiếng Anh/Việt (nếu dịch) + link gốc. Ghi chú “Bài tham khảo từ Juejin (Trung Quốc)”. |
| **SegmentFault** | Chỉ lưu excerpt + link gốc, mô tả ngắn nội dung. |

Nguyên tắc chung:

- Không rehost nguyên văn dài nếu license không rõ ràng.
- Cuối mỗi bài curated, thêm block:

> Original: [Tiêu đề gốc](SOURCE_URL) — Nguồn: SOURCE_NAME

---

## 7. Config đơn giản (JS/TS)

Không dùng `config.yaml`; dùng object/config TS để dễ dùng trong repo hiện tại:

```ts
export const BLOG_CRAWLER_CONFIG = {
  maxPostsPerSource: 5,
  sources: {
    devto: { enabled: true, tag: "webdev" },
    freecodecamp: { enabled: true },
    hashnode: { enabled: true },
    juejin: { enabled: false }, // có thể bật sau
    segmentfault: { enabled: false },
  },
};
```

Env cần:

- `SUPABASE_SERVICE_ROLE_KEY` (nếu insert trực tiếp DB)
- Hoặc dùng API key admin riêng để gọi `/api/blog/admin/import`.

---

## 8. Cron job (khớp deployment hiện tại)

Chạy trên VPS (PM2 script hoặc crontab) bên cạnh app monolith:

```bash
# Ví dụ crontab (1 lần/ngày lúc 08:00)
0 8 * * * cd /opt/software_hub && pnpm scripts:blog-crawler >> logs/blog-crawler.log 2>&1
```

Hoặc dùng job scheduler (vd Hermes cron) nếu đã cấu hình cho project.

---

## 8.1. AI rewrite trong blog editor (tính năng mới)

### Mục tiêu

Cho phép admin **chỉnh sửa nội dung bằng AI** dựa trên raw content đã crawl/soạn:

- User nhập **prompt** (ví dụ: “Viết lại tiếng Việt, giọng thân thiện, thêm headings, tối ưu SEO, giữ nguyên ý, không bịa.”)
- Click **“Sửa bằng AI”** → hệ thống trả về bản draft mới (content/seo/excerpt) để user review trước khi publish

### Non-goals

- Không auto-publish bằng AI.
- Không rewrite silently: luôn để user review.

### UI/UX (Admin `/admin/blog` editor modal)

Thêm khu vực “AI editor” (sidebar hoặc toolbar):

- Input:
  - `System preset` (select): “SEO tiếng Việt”, “Tóm tắt”, “Chuẩn hóa markdown”, “Chuyển ngôn ngữ EN→VI”
  - `Prompt` (textarea): user nhập tự do
  - Checkbox:
    - “Giữ lại attribution block ở cuối”
    - “Không thay đổi link gốc”
- Button:
  - **Sửa bằng AI**
  - (Optional) “Hoàn tác” (revert về bản raw trước rewrite)
- Output:
  - Preview diff đơn giản (optional v2)
  - Sau khi apply: update ngay `form.content`, `form.excerpt`, `form.seo_description`

### API (backend)

Thêm endpoint admin:

- `POST /api/blog/admin/ai-rewrite`

Request body:

```json
{
  "title": "string",
  "content": "string",
  "excerpt": "string|null",
  "seo_description": "string|null",
  "tags": ["string"],
  "prompt": "string",
  "preset": "seo_vi|summarize|normalize_markdown|translate_en_vi",
  "keepAttribution": true
}
```

Response:

```json
{
  "content": "string",
  "excerpt": "string|null",
  "seo_description": "string|null",
  "notes": "string|null"
}
```

Auth:

- `hasRole(["admin"])`
- Rate limit riêng (vd: 10 req / 10 phút / admin)

### AI provider & env

AI provider: **DeepSeek** (OpenAI-compatible REST API).

Env:

- `DEEPSEEK_API_KEY`
- (Optional) `DEEPSEEK_BASE_URL` (default: `https://api.deepseek.com`)
- (Optional) `DEEPSEEK_MODEL` (default: `deepseek-chat`)

Request format (tham khảo để implement endpoint):

- `POST ${DEEPSEEK_BASE_URL}/chat/completions`
- Headers: `Authorization: Bearer ${DEEPSEEK_API_KEY}`
- Body: `{ model, messages, temperature, max_tokens }`

### Prompt policy (an toàn + chống bịa)

System instruction (tóm tắt):

- Không bịa facts, không thêm số liệu/claim không có trong raw content.
- Nếu raw quá ngắn, chỉ được “mở rộng” bằng cách **giải thích khái niệm chung**, không được gắn vào tác giả/nguồn.
- Giữ nguyên link gốc, luôn giữ attribution block.

### Audit / lưu vết (khuyến nghị)

Giai đoạn 1 (không migration):

- Append vào `content` một block ẩn (hoặc lưu trong `admin_notes` nếu có) với:
  - prompt đã dùng
  - timestamp

Giai đoạn 2 (chuẩn hơn, cần migration):

- Table `ai_rewrite_logs`:
  - `id`, `blog_post_id`, `prompt`, `preset`, `input_hash`, `output_hash`, `created_at`, `created_by`

---

## 9. Tech stack (khớp repo)

| Thành phần | Công nghệ |
|-----------|-----------|
| Ngôn ngữ | TypeScript (Node 18+) |
| HTTP client | fetch / node-fetch / axios |
| RSS | `rss-parser` hoặc lib tương đương trong TS |
| HTML parse | `cheerio` nếu cần |
| DB | Supabase Postgres (`blog_posts`), dùng `@supabase/supabase-js` hoặc HTTP API backend hiện có |
| Schedule | cron trên VPS / PM2 cron |

---

## 10. Risk & Mitigation

| Risk | Mitigation |
|------|-----------|
| Nguồn đổi API/RSS | Wrap từng nguồn trong module riêng, log lỗi nhưng không fail toàn job. |
| Rate limit | Delay 1–2s giữa requests; giới hạn `maxPostsPerSource`. |
| Trùng bài khi chạy lại | Dedup theo slug và/hoặc URL trong content; optional: thêm `source_url` nếu mở rộng schema. |
| Nội dung không phù hợp | Lọc theo tags/từ khóa; chỉ crawl chủ đề webdev/JS/AI phù hợp. |
| Content quá dài | Giới hạn excerpt ~300 ký tự, content ~3000 ký tự, phần còn lại link về bài gốc. |

---

## 11. Output mong đợi

- Mỗi lần chạy crawler:
  - Tối đa N bài mới/source được insert vào `blog_posts` với `status = 'draft'`.
  - Không làm thay đổi bài đã `published` hiện có.
- Admin ở `/admin/blog` có thể:
  - Lọc bài theo `status = draft` và tag `source:*`.
  - Review nội dung, chỉnh sửa, publish hoặc archive.
- Tất cả bài curated đều có attribution rõ ràng tới nguồn gốc.
