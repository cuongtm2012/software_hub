# SPEC — Software Hub Documentation

Tài liệu đặc tả sản phẩm, GTM và data pipeline. Đặt tên theo **kebab-case** trong folder `SPEC/`.

## Index

| File | Mô tả | Đọc khi |
|------|--------|---------|
| [`product.md`](./product.md) | Product spec chính — architecture, API, admin, roadmap, backlog | Onboard dev, review tính năng |
| [`go-to-market.md`](./go-to-market.md) | Chiến lược GTM dài hạn — persona, funnel, timeline | Planning kinh doanh |
| [`gtm-operations.md`](./gtm-operations.md) | Vận hành GTM — KPI, lead SLA, analytics, content calendar | Ops hàng tuần/tháng |
| [`content-populate.md`](./content-populate.md) | Crawl/seed pipeline — download.com.vn, awesome lists | Chạy data populate |
| [`data-expansion.md`](./data-expansion.md) | Nguồn data, schema, UI catalog backlog | Mở rộng catalog |
| [`content-crawler-SPEC.md`](./content-crawler-SPEC.md) | Blog content crawler + AI rewrite pipeline | Crawl blog drafts |
| — | Google AdSense: `ca-pub-6124954442503878` trong `client/index.html` (khác GA4 `G-…`) | Monetization |
| [`ui-improvement-v1.md`](./ui-improvement-v1.md) | Design system v1 — tokens, components | UI/UX polish |

## Quan hệ giữa các file

```
product.md (tech + §14 GTM status)
    ├── gtm-operations.md (ops playbook)
    ├── go-to-market.md (strategy)
    ├── content-populate.md ──► data-expansion.md
    └── ui-improvement-v1.md
```

## Đổi tên (migration 2026-06)

| Cũ (root) | Mới (`SPEC/`) |
|-----------|---------------|
| `SPEC.md` | `product.md` |
| `GO_TO_MARKET.md` | `go-to-market.md` |
| `SPEC-GTM-OPERATIONS.md` | `gtm-operations.md` |
| `SPEC-content-populate.md` | `content-populate.md` |
| `SPEC_DATA_EXPANSION.md` | `data-expansion.md` |
| `SPEC_UI_IMPROVEMENT_v1.md` | `ui-improvement-v1.md` |
