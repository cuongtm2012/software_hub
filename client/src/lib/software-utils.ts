export function getSoftwareUrl(software: { slug?: string | null; id: number }): string {
  return software.slug ? `/software/${software.slug}` : `/software/${software.id}`;
}

export function buildSoftwareListPath(params: {
  category?: string;
  platform?: string;
  sort?: string;
  search?: string;
  page?: number;
}): string {
  const qs = new URLSearchParams();
  if (params.category && params.category !== "all") qs.set("category", params.category);
  if (params.platform && params.platform !== "all") qs.set("platform", params.platform);
  if (params.sort && params.sort !== "name") qs.set("sort", params.sort);
  if (params.search) qs.set("search", params.search);
  if (params.page && params.page > 1) qs.set("page", String(params.page));
  const query = qs.toString();
  return query ? `/software?${query}` : "/software";
}

export function buildSoftwareDetailUrl(
  software: { slug?: string | null; id: number },
  returnTo?: string,
): string {
  const base = getSoftwareUrl(software);
  if (!returnTo || (returnTo !== "/software" && !returnTo.startsWith("/software?"))) return base;
  return `${base}?returnTo=${encodeURIComponent(returnTo)}`;
}

export function buildSoftwareSeoDescription(software: {
  name: string;
  description?: string | null;
  seo_description?: string | null;
  platform?: string[] | null;
  vendor?: string | null;
}): string {
  if (software.seo_description) return software.seo_description;
  const platform = software.platform?.length ? software.platform.join(", ") : "đa nền tảng";
  return `Tải ${software.name} miễn phí cho ${platform}. Hướng dẫn cài đặt chi tiết bằng tiếng Việt${software.vendor ? ` — ${software.vendor}` : ""}.`;
}

export function buildSoftwareSeoContent(software: {
  name: string;
  description?: string | null;
  seo_content?: string | null;
  platform?: string[] | null;
  vendor?: string | null;
  license?: string | null;
  type?: string | null;
}): string {
  if (software.seo_content) return software.seo_content;

  const platform = software.platform?.length ? software.platform.join(", ") : "Windows, Mac, Linux";
  const typeLabel = software.type === "api" ? "API / công cụ lập trình" : "phần mềm";

  return [
    software.description ||
      `${software.name} là ${typeLabel} được nhiều developer và doanh nghiệp tin dùng.`,
    "",
    "## Tính năng nổi bật",
    `- Hỗ trợ nền tảng: ${platform}`,
    `- Giấy phép: ${software.license || "Miễn phí"}`,
    software.vendor ? `- Nhà phát triển: ${software.vendor}` : "",
    "",
    "## Hướng dẫn cài đặt",
    `Truy cập trang chi tiết, nhấn nút tải xuống và làm theo hướng dẫn cài đặt trên hệ điều hành của bạn. Software Hub cung cấp liên kết tải chính thức và mô tả bằng tiếng Việt.`,
    "",
    "## Ai nên dùng?",
    `- Developer cần công cụ ${software.name} trong workflow hàng ngày`,
    `- Doanh nghiệp SME tìm giải pháp ${typeLabel} miễn phí hoặc mã nguồn mở`,
    `- Sinh viên IT muốn khám phá và thực hành`,
    "",
    "## Tư vấn triển khai",
    `Cần tích hợp ${software.name} vào hệ thống doanh nghiệp? Liên hệ Software Hub IT Studio để được tư vấn triển khai và tùy chỉnh.`,
  ]
    .filter(Boolean)
    .join("\n");
}
