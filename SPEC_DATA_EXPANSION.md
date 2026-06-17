# SPEC: Data Expansion for Software Hub v2

## Overview
Đẩy thêm data phần mềm Free (hot trend) và tài liệu IT lên Software Hub production.

---

## Phần 1: Phần mềm Free Hot Trend

### Nguồn data (xếp theo ưu tiên)

| # | Nguồn | URL | Format | Số lượng | ⭐ Stars | Cách crawl |
|---|-------|-----|--------|---------|---------|------------|
| 1 | **download.com.vn** | https://download.com.vn/ | Vietnamese software listing (JS-rendered) | ~500+ mục | — | Playwright |
| 2 | **Axorax/awesome-free-apps** | https://github.com/Axorax/awesome-free-apps | GitHub README markdown, 600+ entries, filter theo OS | ~600+ | 5.5k⭐ | Fetch markdown → parse |
| 3 | **awesome-selfhosted** | https://github.com/awesome-selfhosted/awesome-selfhosted | GitHub README markdown, 2000+ entries, software tự host | ~2000+ | 225k⭐ | Fetch markdown → parse |

### Lý do chọn

| Nguồn | Lý do |
|-------|-------|
| **download.com.vn** | Trang download lớn nhất VN, data thực tế người Việt dùng, SEO target đúng |
| **Axorax/awesome-free-apps** | Được maintain thường xuyên, 600+ entries, phân loại sẵn theo OS, recommend badge |
| **awesome-selfhosted** | Repo #1 awesome list (225k⭐), 2000+ entries, trend "tự host" đang rất hot |

**Không dùng:** johnjago/awesome-free-software (cũ, 111 entries) — thay bằng Axorax.

### Schema

Table `softwares` trong `shared/schema.ts` (đã có — không cần migration):
- name, slug, description, seo_description, seo_content
- type: 'software' | 'api'
- category_id (FK → categories)
- platform: text[] ('windows', 'mac', 'linux', 'android', 'ios', 'web')
- download_link, image_url, version, vendor, license
- installation_instructions, documentation_link

### Download.com.vn Crawl

**Script:** `scripts/parse-downloadcomvn.ts` → `scripts/data/downloadcomvn.json`

**Đặc điểm:** Trang JS-rendered; list page dùng `ul.listitem-view li.clearfix`; detail page có `#DownloadButtonTop[data-downloadurl]`.

**Cách crawl (Playwright):**

1. **14 category paths** (config trong script, env `PARSE_CATEGORIES`):
   - Windows sub-categories: games, office, education, video, devtools, business, network, audio, driver, graphics, social
   - Platform hubs: `/windows`, `/android`, `/ios`

2. **Pagination:** list pages dùng `?p=2`, `?p=3` (link "Xem thêm"); env `PARSE_MAX_PAGES` (default 5)

3. **Mỗi item:**
   - List page → name + mô tả ngắn
   - Detail page → download_link, version, vendor, license, image_url (og:image)
   - Random delay 600–3000ms giữa requests

4. **Category mapping:** mỗi crawl path gán `category` (VN label) + `subcategory` (English alias cho taxonomy). Seed dùng `resolveUseCategorySlug(subcategory)` → UI filter đúng bucket (van-phong, lap-trinh, game…).

5. **Download link policy:** block mirror domains (`fa.getpedia.net`, `bit.ly`…); fallback về page URL.

6. **Output JSON format:**
```json
{
  "source": "download.com.vn",
  "entries": [
    {
      "name": "EVKey",
      "description": "Bộ gõ tiếng Việt miễn phí",
      "category": "Văn phòng & Năng suất",
      "subcategory": "office",
      "url": "https://download.com.vn/evkey-125877",
      "platform": ["windows"],
      "version": "6.0.4",
      "license": "Miễn phí",
      "vendor": "Lâm Quang Minh",
      "download_link": "https://github.com/lamquangminh/EVKey/releases/download/Release/EVKey.zip",
      "image_url": "https://st.download.com.vn/data/image/2023/12/08/evkey-700.jpg",
      "source": "download.com.vn"
    }
  ]
}
```

**Commands:**
```bash
npm run parse:downloadcomvn                              # parse (chạy riêng, chậm)
PARSE_LIMIT=50 PARSE_MAX_PAGES=5 npm run parse:downloadcomvn  # full crawl
npm run seed:free-software -- --dry-run                  # seed preview
npm run data:parse:full                                  # parse tất cả nguồn
```

### GitHub Awesome-Free-Apps Crawl (Axorax)

**Cách crawl:** Fetch raw README.md từ GitHub → parse sections.

**Source:** `https://raw.githubusercontent.com/Axorax/awesome-free-apps/main/README.md`

**Categories có sẵn:**
- Audio (players, recording, DJ, music production)
- Browsers (Tor, Brave, Firefox, Arc, Zen...)
- Communication (Discord, Telegram, Signal...)
- Customization (themes, cursors, icons...)
- Developer Tools (IDE, git clients, API tools...)
- Downloaders (youtube-dl, JDownloader...)
- File Management (7-Zip, FreeFileSync...)
- Gaming (Steam, emulators...)
- Graphics (GIMP, Inkscape, Blender, Krita...)
- Internet (browsers, VPN, network tools...)
- Office (LibreOffice, OnlyOffice...)
- Productivity (Notion, Obsidian, Trello...)
- Security (Bitwarden, VeraCrypt...)
- Video (VLC, OBS, DaVinci Resolve...)
- Utilities (Everything, CPU-Z...)
- AI Tools (chat clients, LLM frontends...)

**Filter sẵn:** Windows-only, macOS-only, Linux-only, Open-source-only, Recommended.

### Awesome-Selfhosted Crawl

**Source:** `https://raw.githubusercontent.com/awesome-selfhosted/awesome-selfhosted/master/README.md`

**Categories nổi bật (trích):**
- Analytics, Automation, Blogging, Bookmarks
- Calendars, Communication, Community, Content Management
- CRM, Database, DNS, Document Management
- E-commerce, Email, File Sharing, File Sync
- Games, Gateways, Human Resources, Knowledge Management
- Media Streaming, Monitoring, Music, Note-taking
- Office Suites, Password Managers, Pastebins
- Photo Galleries, Project Management, Search
- Software Development, Status Systems, Ticketing
- Time Tracking, VPN, Video Streaming, Web Servers

**Entry format:**
```json
{
  "name": "NocoDB",
  "description": "No-code platform that turns any database into a smart spreadsheet",
  "category": "Database",
  "url": "https://github.com/nocodb/nocodb",
  "demo_url": "https://nocodb.com",
  "license": "AGPL-3.0",
  "platform": ["web"],
  "language": "TypeScript",
  "source": "awesome-selfhosted"
}
```

### Các scripts cần tạo

| Script | Mô tả |
|--------|-------|
| `scripts/parse-downloadcomvn.ts` | Playwright crawl download.com.vn → JSON |
| `scripts/parse-awesome-free-apps.ts` | Crawl Axorax/awesome-free-apps README → JSON |
| `scripts/parse-awesome-selfhosted.ts` | Crawl awesome-selfhosted README → JSON |
| `scripts/seed-all-free-software.ts` | Merge JSON từ tất cả nguồn → insert/update DB |

---

## Phần 2: Tài liệu IT (Courses)

### Nguồn data (xếp theo ưu tiên)

| # | Nguồn | Format | Số lượng | ⭐ | Ghi chú |
|---|-------|--------|---------|----|---------|
| 1 | **EbookFoundation/free-programming-books** | GitHub markdown, 340k⭐, 200+ courses tiếng Việt, phân loại theo chủ đề | ~200+ | 340k⭐ | Nguồn chính mới — thay thế repo cũ |
| 2 | **YouTube channels VN** (F8, Hỏi Dân IT, TEDU, Gà Lại Lập Trình, TrungQuanDev...) | Playlists | ~50+ | — | Thêm thủ công các playlist hot nhất |
| 3 | **tmsanghoclaptrinh/tai-lieu-lap-trinh-tieng-viet-mien-phi** (nguồn cũ) | GitHub markdown | ~50-80 | — | Parse bổ sung, không làm nguồn chính |

### Lý do chọn EbookFoundation/free-programming-books

- **340,000⭐** — repo lớn nhất thế giới về danh sách tài liệu lập trình free
- **200+ courses tiếng Việt** — đã phân loại sẵn: JavaScript, Python, Java, C++, React, NodeJS...
- **Được maintain thường xuyên** — cập nhật liên tục
- **Format có sẵn** — markdown table dễ parse
- **Tích hợp cả YouTube + ebook + courses**

### Các channel YouTube VN (thêm thủ công)

| Channel | Chủ đề mạnh | Link |
|---------|------------|------|
| **F8 Official** | HTML, CSS, JS, React, NodeJS | youtube.com/@f8official |
| **Hỏi Dân IT** | Fullstack, DevOps, NextJS, NestJS | youtube.com/@hoidanit |
| **TrungQuanDev** | MERN Stack, Trello clone | youtube.com/@trungquandev |
| **Gà Lại Lập Trình** | C++, Java cơ bản | youtube.com/@galailaptrinh |
| **28tech** | C, Python | youtube.com/@28tech |
| **Tùng Sugar** | Dart, Flutter | youtube.com/@tungsugar |
| **ZendVN** | PHP, Laravel | youtube.com/@zendvn |
| **200Lab** | Flutter | youtube.com/@200lab |
| **Được Dev** | NextJS | youtube.com/@duocdev |

### Schema

Table `courses` trong `shared/schema.ts` (đã có — không cần migration):
- title, slug, description, seo_description, seo_content
- topic: string (JavaScript, Python, React, ...)
- instructor: string
- youtube_url, playlist_id, thumbnail_url
- level: string (beginner, intermediate, advanced)
- language: string (default 'vi')
- status: approved

### EbookFoundation Crawl

**Source:** `https://ebookfoundation.github.io/free-programming-books/courses/free-courses-vi.html`

Format HTML table sẵn → parse:
```html
<h2>JavaScript</h2>
<table>
  <tr>
    <td>
      <a href="https://youtube.com/playlist?list=...">Khóa học JavaScript</a>
      - F8 Official
    </td>
  </tr>
</table>
```

**Output JSON format:**
```json
{
  "topic": "JavaScript",
  "courses": [
    {
      "title": "Khóa học JavaScript cơ bản",
      "instructor": "F8 Official",
      "youtubeUrl": "https://youtube.com/playlist?list=PL...",
      "playlistId": "PL...",
      "thumbnailUrl": "https://i.ytimg.com/vi/.../hqdefault.jpg",
      "level": "beginner"
    }
  ]
}
```

### YouTube channels (thủ công)

Thêm vào JSON thủ công các playlist không có trong EbookFoundation:
```json
{
  "topic": "React",
  "source": "manual",
  "courses": [...]
}
```

### Scripts cần tạo / sửa

| Script | Mô tả |
|--------|-------|
| `scripts/parse-ebookfoundation-courses.ts` | Crawl HTML từ EbookFoundation → JSON |
| `scripts/parse-youtube-channels.ts` | (Optional) Thêm thủ công YouTube channels |
| `scripts/seed-it-courses-v2.ts` | Seed tất cả courses từ các nguồn vào DB |

---

## Phần 3: Implementation Plan

### Nguồn bổ sung: "Essential Apps" cho máy tính mới cài

Danh mục **"Phần mềm thiết yếu"** dành cho người dùng vừa cài máy tính mới (new PC checklist).

**Cách lấy:**
1. Từ **Axorax/awesome-free-apps** — các app có badge `⭐` (recommended) trong list
2. Bổ sung thêm các app còn thiếu từ list TechSpot + Reddit
3. Gắn tag `essential=true` riêng để phân biệt

**Seed:** Thêm field `tags` hoặc boolean `essential` trong JSON → khi seed sẽ set `admin_notes` hoặc tạo category riêng.

### Phase 1: Crawl & Parse (thứ tự)

```
1. Axorax/awesome-free-apps    (dễ nhất, fetch markdown)
2. EbookFoundation courses     (HTML parse, cũng dễ)
3. awesome-selfhosted          (vừa, markdown parse)
4. download.com.vn             (khó nhất, Playwright — chạy riêng: npm run parse:downloadcomvn)
```

`npm run data:parse` — GitHub + courses (nhanh).
`npm run data:parse:full` — thêm download.com.vn (chậm, ~3-4h full crawl).

### Phase 2: Seed vào DB

```
1. Chạy seed-it-courses-v2.ts (courses từ EbookFoundation + YouTube)
2. Chạy seed-all-free-software.ts (softwares từ 3 nguồn + essential flag)
```

### Phase 3: UI

Hiện tại:
- `/software` — danh sách software ✅
- `/courses` — danh sách khóa học ✅

Thêm:
- Filter theo platform (Windows/Mac/Linux/Web)
- Filter theo category
- Source badge: "Từ download.com.vn" / "GitHub"
- Tab "Thiết yếu" — essential apps cho máy tính mới
- Sort: mới nhất, phổ biến nhất

---

## Đánh giá rủi ro

| Rủi ro | Giải pháp |
|--------|-----------|
| download.com.vn chống crawl | Playwright + random delay + User-Agent |
| Data lỗi thời (GitHub repos) | Cron refresh hàng tuần (optional) |
| Copyright / license | Chỉ lấy link (không rehost file), ghi rõ license + source |

---

## Deliverables

1. **Scripts crawl:**
   - `scripts/parse-awesome-free-apps.ts`
   - `scripts/parse-ebookfoundation-courses.ts`
   - `scripts/parse-awesome-selfhosted.ts`
   - `scripts/parse-downloadcomvn.ts`

2. **Seed scripts:**
   - `scripts/seed-it-courses-v2.ts` (merge EbookFoundation + YouTube)
   - `scripts/seed-all-free-software.ts` (merge 3 nguồn phần mềm)

3. **Kết quả ước tính:**
   - ~600 phần mềm từ awesome-free-apps
   - ~2000+ phần mềm từ awesome-selfhosted
   - ~500+ phần mềm từ download.com.vn
   - ~200+ courses từ EbookFoundation
   - ~50 courses từ YouTube channels

4. **UI improvements (nếu cần):**
   - Platform filter
   - Source badge
   - Category filter

---

## Estimates

- Parse awesome-free-apps: ~1-2h
- Parse ebookfoundation courses: ~1-2h
- Parse awesome-selfhosted: ~2-3h
- Parse download.com.vn: ~3-4h
- Seed scripts: ~2-3h
- UI improvements: ~2-4h

**Tổng:** ~2-3 ngày
