import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/components/seo/page-meta";
import { CourseSchema } from "@/components/seo/course-schema";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import {
  getCourseUrl,
  buildSeoTitle,
  buildSeoDescription,
  buildSeoContent,
} from "@/lib/course-utils";
import { renderSeoMarkdown } from "@/lib/render-seo-markdown";
import {
  getPlaceholderGradient,
  pageContainerClass,
  pageMainClass,
  pageShellClass,
} from "@/components/design-system/tokens";
import {
  GraduationCap,
  ArrowLeft,
  User,
  Tag,
  BarChart3,
  Globe,
  Clock,
  Loader2,
  ChevronRight,
  PlayCircle,
  ClipboardList,
  MessageSquare,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { CourseThumbnail } from "@/components/course-thumbnail";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

const LEVEL_BADGE: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  intermediate: "bg-amber-500/10 text-amber-700 border-amber-200",
  advanced: "bg-red-500/10 text-red-700 border-red-200",
};

type Course = {
  id: number;
  slug?: string | null;
  title: string;
  description?: string | null;
  topic: string;
  instructor?: string | null;
  youtube_url: string;
  playlist_id?: string | null;
  thumbnail_url?: string | null;
  level?: string | null;
  language?: string | null;
};

type ContentSection = { id: string; label: string; visible: boolean };

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-slate-900 text-right">{value}</span>
    </div>
  );
}

function SectionCard({
  id,
  title,
  icon: Icon,
  children,
  className,
}: {
  id: string;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 min-w-0 bg-white rounded-xl border border-[#004080]/10 p-6 sm:p-8 uupm-card",
        className,
      )}
    >
      <h2 className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-slate-900 mb-5">
        {Icon ? <Icon className="h-5 w-5 text-[#004080] shrink-0" /> : null}
        {title}
      </h2>
      <div className="min-w-0 overflow-x-hidden">{children}</div>
    </section>
  );
}

function resolveYoutubeEmbed(url: string, playlistId?: string | null) {
  const listId = playlistId || url.match(/list=([^&]+)/)?.[1];
  if (listId) {
    return { embedUrl: `https://www.youtube.com/embed/videoseries?list=${listId}`, isPlaylist: true };
  }
  const videoId = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/)?.[1];
  if (videoId) {
    return { embedUrl: `https://www.youtube.com/embed/${videoId}`, isPlaylist: false };
  }
  return null;
}

export default function CourseDetailPage() {
  const [, params] = useRoute("/courses/:idOrSlug");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const idOrSlug = params?.idOrSlug;

  const { data: course, isLoading, error } = useQuery<Course>({
    queryKey: ["/api/courses", idOrSlug],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${idOrSlug}`);
      if (!response.ok) throw new Error("Failed to fetch course");
      return response.json();
    },
    enabled: !!idOrSlug,
  });

  const { data: relatedCourses } = useQuery({
    queryKey: ["/api/courses/related", course?.topic, course?.id],
    queryFn: async () => {
      if (!course?.topic) return [];
      const response = await fetch(
        `/api/courses?topic=${encodeURIComponent(course.topic)}&limit=4`,
      );
      if (!response.ok) return [];
      const data = await response.json();
      return (data.courses as Course[])?.filter((c) => c.id !== course.id) || [];
    },
    enabled: !!course?.topic,
  });

  const { data: relatedBlog } = useQuery<{
    posts: Array<{ id: number; title: string; slug: string; excerpt?: string }>;
  }>({
    queryKey: ["/api/blog", "related", course?.topic],
    queryFn: async () => {
      if (!course?.topic) return { posts: [] };
      const response = await fetch(
        `/api/blog?tag=${encodeURIComponent(course.topic)}&limit=3`,
      );
      if (!response.ok) return { posts: [] };
      return response.json();
    },
    enabled: !!course?.topic,
  });

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<
    { id: number; user: string; content: string; createdAt: string }[]
  >([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [idOrSlug]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setComments([
      {
        id: Date.now(),
        user: user?.name || "Khách",
        content: comment.trim(),
        createdAt: new Date().toISOString(),
      },
      ...comments,
    ]);
    setComment("");
  };

  if (isLoading) {
    return (
      <div className={pageShellClass}>
        <Header />
        <main className={cn(pageMainClass, "flex items-center justify-center py-24")}>
          <Loader2 className="h-10 w-10 animate-spin text-[#004080]" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className={pageShellClass}>
        <Header />
        <main className={cn(pageMainClass, "flex items-center justify-center py-24 px-4")}>
          <div className="text-center max-w-sm">
            <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Không tìm thấy khóa học</h2>
            <Button onClick={() => navigate("/courses")} className="bg-[#004080] hover:bg-[#003366]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const canonicalUrl = `${window.location.origin}${getCourseUrl(course)}`;
  const seoDescription = buildSeoDescription(course);
  const seoContent = buildSeoContent(course);
  const seoTitle = buildSeoTitle(course);
  const youtubeEmbed = resolveYoutubeEmbed(course.youtube_url, course.playlist_id);

  const metaRows = [
    course.instructor ? { label: "Giảng viên", value: course.instructor } : null,
    course.topic ? { label: "Chủ đề", value: course.topic } : null,
    course.level
      ? { label: "Trình độ", value: LEVEL_LABEL[course.level] || course.level }
      : null,
    course.language ? { label: "Ngôn ngữ", value: course.language } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const contentSections: ContentSection[] = [
    { id: "video", label: "Video khóa học", visible: Boolean(youtubeEmbed) },
    { id: "gioi-thieu", label: "Giới thiệu", visible: Boolean(seoContent?.trim()) },
    { id: "binh-luan", label: "Bình luận", visible: true },
  ].filter((s) => s.visible);

  return (
    <div className={pageShellClass}>
      <PageMeta
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={canonicalUrl}
        ogImage={course.thumbnail_url ?? undefined}
        ogType="article"
      />
      <CourseSchema
        title={course.title}
        description={seoDescription}
        instructor={course.instructor ?? undefined}
        url={canonicalUrl}
        thumbnailUrl={course.thumbnail_url ?? undefined}
        level={course.level ?? undefined}
        language={course.language ?? undefined}
      />
      <BreadcrumbSchema
        items={[
          { name: "Trang chủ", url: window.location.origin },
          { name: "Khóa học", url: `${window.location.origin}/courses` },
          { name: course.title, url: canonicalUrl },
        ]}
      />

      <Header />

      <main className={pageMainClass}>
        <div className="bg-white border-b border-[#004080]/10">
          <div className={cn(pageContainerClass, "py-3")}>
            <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <button
                type="button"
                onClick={() => navigate("/courses")}
                className="hover:text-[#004080] transition-colors"
              >
                Khóa học
              </button>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              <span className="text-slate-900 font-medium truncate">{course.title}</span>
            </nav>
          </div>
        </div>

        <div className={cn(pageContainerClass, "py-6 sm:py-8")}>
          <header className="mb-6 sm:mb-8 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {course.topic && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#004080]/10 text-[#004080]">
                  <Tag className="h-3 w-3 mr-1" />
                  {course.topic}
                </span>
              )}
              {course.level && (
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border",
                    LEVEL_BADGE[course.level] || "bg-slate-100 text-slate-700 border-slate-200",
                  )}
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  {LEVEL_LABEL[course.level] || course.level}
                </span>
              )}
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-200">
                Miễn phí
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mb-3 break-words">
              {course.title}
            </h1>

            {course.instructor && (
              <p className="text-base text-muted-foreground mb-2 flex items-center gap-2">
                <User className="h-4 w-4 text-[#004080] shrink-0" />
                {course.instructor}
              </p>
            )}

            {course.description && (
              <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
                {course.description}
              </p>
            )}
          </header>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 min-w-0">
            <aside className="w-full lg:w-72 xl:w-80 shrink-0 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24 space-y-4">
                <div className="bg-white rounded-xl border border-[#004080]/10 overflow-hidden uupm-card">
                  <div className="relative aspect-video bg-slate-100">
                    <CourseThumbnail
                      videoUrl={course.youtube_url || course.thumbnail_url || ""}
                      title={course.title}
                      fallbackGradient={getPlaceholderGradient(course.title)}
                    />
                  </div>
                  <div className="p-5 space-y-3">
                    <a
                      href={course.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center px-5 py-3 text-base font-semibold rounded-lg text-white bg-[#004080] hover:bg-[#003366] transition-colors"
                    >
                      <PlayCircle className="h-5 w-5 mr-2" />
                      Học trên YouTube
                    </a>
                    <p className="text-xs text-center text-muted-foreground">
                      Playlist miễn phí — học theo tốc độ của bạn
                    </p>
                  </div>
                </div>

                {metaRows.length > 0 && (
                  <div className="bg-white rounded-xl border border-[#004080]/10 p-5 uupm-card space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900">Thông tin khóa học</h3>
                    {metaRows.map((row) => (
                      <MetaRow key={row.label} label={row.label} value={row.value} />
                    ))}
                    {course.language && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                        <Globe className="h-3.5 w-3.5" />
                        Nội dung {course.language === "vi" ? "tiếng Việt" : course.language}
                      </div>
                    )}
                  </div>
                )}

                {contentSections.length > 1 && (
                  <nav className="hidden lg:block bg-white rounded-xl border border-[#004080]/10 p-5 uupm-card">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Mục lục</h3>
                    <ul className="space-y-1">
                      {contentSections.map((section) => (
                        <li key={section.id}>
                          <a
                            href={`#${section.id}`}
                            className="block text-sm text-muted-foreground hover:text-[#004080] py-1.5 transition-colors"
                          >
                            {section.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}

                {relatedCourses && relatedCourses.length > 0 && (
                  <div className="bg-white rounded-xl border border-[#004080]/10 p-5 uupm-card">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-[#004080]" />
                      Khóa học liên quan
                    </h3>
                    <div className="space-y-2">
                      {relatedCourses.map((related) => (
                        <button
                          key={related.id}
                          type="button"
                          onClick={() => navigate(getCourseUrl(related))}
                          className="w-full text-left group flex gap-3 p-2 rounded-lg hover:bg-[#004080]/5 transition-colors"
                        >
                          <div className="relative w-20 shrink-0 aspect-video rounded-md overflow-hidden border border-[#004080]/10">
                            <CourseThumbnail
                              videoUrl={related.youtube_url || related.thumbnail_url || ""}
                              title={related.title}
                              fallbackGradient={getPlaceholderGradient(related.title)}
                            />
                          </div>
                          <div className="min-w-0 flex-1 py-0.5">
                            <p className="text-sm font-medium line-clamp-2 group-hover:text-[#004080] transition-colors">
                              {related.title}
                            </p>
                            {related.instructor && (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {related.instructor}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {relatedBlog?.posts && relatedBlog.posts.length > 0 && (
                  <div className="bg-white rounded-xl border border-[#004080]/10 p-5 uupm-card">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Bài viết liên quan</h3>
                    <div className="space-y-2">
                      {relatedBlog.posts.map((post) => (
                        <button
                          key={post.id}
                          type="button"
                          onClick={() => navigate(`/blog/${post.slug}`)}
                          className="w-full text-left p-2 rounded-lg hover:bg-[#004080]/5 transition-colors group"
                        >
                          <p className="text-sm font-medium group-hover:text-[#004080] line-clamp-2">
                            {post.title}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            <div className="flex-1 min-w-0 space-y-6 order-1 lg:order-2">
              {youtubeEmbed ? (
                <SectionCard id="video" title="Video khóa học" icon={PlayCircle}>
                  <div className="relative aspect-video w-full max-w-full rounded-lg overflow-hidden bg-black border border-[#004080]/10">
                    <iframe
                      src={youtubeEmbed.embedUrl}
                      title={course.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                      {youtubeEmbed.isPlaylist
                        ? "Playlist YouTube — phát tuần tự các bài trong khóa"
                        : "Video giới thiệu khóa học"}
                    </p>
                    <a
                      href={course.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-medium text-[#004080] hover:text-[#003366]"
                    >
                      Mở trên YouTube
                      <ExternalLink className="h-3.5 w-3.5 ml-1" />
                    </a>
                  </div>
                </SectionCard>
              ) : (
                <SectionCard id="video" title="Video khóa học" icon={PlayCircle}>
                  <div className="rounded-lg border border-dashed border-[#004080]/20 p-8 text-center">
                    <PlayCircle className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Không thể nhúng video. Xem trực tiếp trên YouTube.
                    </p>
                    <Button asChild className="bg-[#004080] hover:bg-[#003366]">
                      <a href={course.youtube_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Xem trên YouTube
                      </a>
                    </Button>
                  </div>
                </SectionCard>
              )}

              {seoContent?.trim() && (
                <SectionCard id="gioi-thieu" title="Giới thiệu & lộ trình học" icon={ClipboardList}>
                  <div className="space-y-1 break-words">{renderSeoMarkdown(seoContent)}</div>
                </SectionCard>
              )}

              <SectionCard
                id="binh-luan"
                title={`Bình luận (${comments.length})`}
                icon={MessageSquare}
              >
                <form onSubmit={handleSubmitComment} className="mb-6">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Chia sẻ câu hỏi hoặc ghi chú học tập…"
                    className="w-full px-4 py-3 text-sm border border-[#004080]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080]/30 resize-none uupm-focus bg-white"
                    rows={3}
                  />
                  <div className="mt-3 flex justify-end">
                    <Button
                      type="submit"
                      className="bg-[#004080] hover:bg-[#003366]"
                      disabled={!comment.trim()}
                      size="sm"
                    >
                      Gửi bình luận
                    </Button>
                  </div>
                </form>

                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      Chưa có bình luận. Hãy là người đầu tiên!
                    </p>
                  ) : (
                    comments.map((c) => (
                      <article
                        key={c.id}
                        className="border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 bg-[#004080]/10 rounded-full flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-[#004080]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{c.user}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 pl-12 break-words">{c.content}</p>
                      </article>
                    ))
                  )}
                </div>
              </SectionCard>
            </div>
          </div>

          <div className="mt-10">
            <LeadCaptureForm
              source="course_page"
              sourceId={course.slug || course.id}
              title="Cần lộ trình học IT cá nhân hoá?"
              description="Team Software Hub tư vấn lộ trình học và giải pháp IT phù hợp mục tiêu của bạn — miễn phí."
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
