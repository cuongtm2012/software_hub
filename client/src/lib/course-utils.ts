export function getCourseUrl(course: { slug?: string | null; id: number }): string {
  return course.slug ? `/courses/${course.slug}` : `/courses/${course.id}`;
}

export function buildCoursesListPath(params: {
  topic?: string;
  level?: string;
  search?: string;
  sort?: string;
  page?: number;
}): string {
  const qs = new URLSearchParams();
  if (params.topic && params.topic !== "all") qs.set("topic", params.topic);
  if (params.level && params.level !== "all") qs.set("level", params.level);
  if (params.search) qs.set("search", params.search);
  if (params.sort && params.sort !== "recent") qs.set("sort", params.sort);
  if (params.page && params.page > 1) qs.set("page", String(params.page));
  const query = qs.toString();
  return query ? `/courses?${query}` : "/courses";
}

export function buildCourseDetailUrl(
  course: { slug?: string | null; id: number },
  returnTo?: string,
): string {
  const base = getCourseUrl(course);
  if (!returnTo || !returnTo.startsWith("/courses")) return base;
  return `${base}?returnTo=${encodeURIComponent(returnTo)}`;
}

import { LEVEL_SEO_LABEL } from "./seo-config";

export function buildSeoTitle(course: {
  title: string;
  level?: string | null;
}): string {
  const level = LEVEL_SEO_LABEL[course.level || "beginner"] || "mọi cấp độ";
  return `Học ${course.title} miễn phí — Lộ trình chi tiết cho ${level}`;
}

export function buildSeoDescription(course: {
  title: string;
  topic: string;
  level?: string | null;
  instructor?: string | null;
  seo_description?: string | null;
  description?: string | null;
}): string {
  if (course.seo_description) return course.seo_description;
  const level = course.level === "beginner" ? "người mới" : course.level === "advanced" ? "nâng cao" : "trung cấp";
  return `Học ${course.title} miễn phí — Lộ trình chi tiết cho ${level}. Khóa học ${course.topic} tiếng Việt${course.instructor ? ` bởi ${course.instructor}` : ""}.`;
}

export function buildSeoContent(course: {
  title: string;
  topic: string;
  level?: string | null;
  instructor?: string | null;
  seo_content?: string | null;
  description?: string | null;
}): string {
  if (course.seo_content) return course.seo_content;

  const levelLabel =
    course.level === "beginner" ? "cơ bản" : course.level === "advanced" ? "nâng cao" : "trung cấp";

  return [
    course.description || `Khóa học ${course.title} là một trong những khóa học ${course.topic} ${levelLabel} được yêu thích nhất bằng tiếng Việt.`,
    "",
    `## Bạn sẽ học được gì?`,
    `- Nắm vững kiến thức ${course.topic} từ cơ bản đến thực hành`,
    `- Xây dựng nền tảng vững chắc để phát triển sự nghiệp IT`,
    `- Học theo lộ trình có hệ thống, phù hợp ${levelLabel}`,
    "",
    `## Lộ trình học`,
    `Khóa học được thiết kế theo playlist YouTube chất lượng cao${course.instructor ? ` từ ${course.instructor}` : ""}, giúp bạn học theo tốc độ riêng và ôn tập bất cứ lúc nào.`,
    "",
    `## Ai nên học khóa này?`,
    `- Sinh viên IT muốn bổ sung kiến thức ${course.topic}`,
    `- Người chuyển ngành sang lập trình`,
    `- Developer muốn củng cố nền tảng ${levelLabel}`,
    "",
    `## Học miễn phí 100%`,
    `Toàn bộ nội dung khóa học hoàn toàn miễn phí. Software Hub tổng hợp và sắp xếp lộ trình học tối ưu để bạn tiết kiệm thời gian tìm kiếm.`,
    "",
    `## Khám phá thêm trên Software Hub`,
    `- [Tất cả khóa học ${course.topic}](/courses?search=${encodeURIComponent(course.topic)})`,
    `- [Phần mềm miễn phí & công cụ IT](/software)`,
    `- [Marketplace — mua license phần mềm](/marketplace)`,
    `- [Dịch vụ IT thuê ngoài](/services/new)`,
    `- [Blog IT — tin tức & hướng dẫn](/blog)`,
  ].join("\n");
}
