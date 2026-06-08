import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/design-system/page-hero";
import { SectionPanel } from "@/components/design-system/section-panel";
import { PageMeta } from "@/components/seo/page-meta";
import { CourseSchema } from "@/components/seo/course-schema";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { getCourseUrl, buildSeoDescription, buildSeoContent } from "@/lib/course-utils";
import { getPlaceholderGradient } from "@/components/design-system/tokens";
import {
  BookOpen,
  ArrowLeft,
  User,
  Tag,
  BarChart,
  Globe,
  Clock,
  Loader2,
} from "lucide-react";
import { CourseThumbnail } from "@/components/course-thumbnail";
import { cn } from "@/lib/utils";

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

const LEVEL_BADGE: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-800",
  intermediate: "bg-amber-100 text-amber-800",
  advanced: "bg-red-100 text-red-800",
};

function renderMarkdownContent(content: string) {
  return content.split("\n").map((line, i) => {
    if (line.startsWith("## ")) {
      return (
        <h3 key={i} className="text-base font-semibold text-foreground mt-5 mb-2">
          {line.replace("## ", "")}
        </h3>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <li key={i} className="text-muted-foreground ml-4 list-disc text-sm leading-relaxed">
          {line.replace("- ", "")}
        </li>
      );
    }
    if (line.trim() === "") return <br key={i} />;
    return (
      <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-2">
        {line}
      </p>
    );
  });
}

export default function CourseDetailPage() {
  const [, params] = useRoute("/courses/:idOrSlug");
  const [, navigate] = useLocation();
  const idOrSlug = params?.idOrSlug;

  const { data: course, isLoading, error } = useQuery({
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
      const response = await fetch(`/api/courses?topic=${encodeURIComponent(course.topic)}&limit=4`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.courses?.filter((c: { id: number }) => c.id !== course.id) || [];
    },
    enabled: !!course?.topic,
  });

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<{ id: number; user: string; content: string; createdAt: string }[]>([]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setComments([
      { id: Date.now(), user: "User", content: comment, createdAt: new Date().toISOString() },
      ...comments,
    ]);
    setComment("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#004080]" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4">
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
  const seoTitle = `Học ${course.title} miễn phí — Lộ trình chi tiết cho người mới`;

  const playlistId =
    course.playlist_id || course.youtube_url?.match(/list=([^&]+)/)?.[1] || "";
  const embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col">
      <PageMeta
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={canonicalUrl}
        ogImage={course.thumbnail_url}
        ogType="article"
      />
      <CourseSchema
        title={course.title}
        description={seoDescription}
        instructor={course.instructor}
        url={canonicalUrl}
        thumbnailUrl={course.thumbnail_url}
        level={course.level}
        language={course.language}
      />
      <BreadcrumbSchema
        items={[
          { name: "Trang chủ", url: window.location.origin },
          { name: "Khóa học", url: `${window.location.origin}/courses` },
          { name: course.title, url: canonicalUrl },
        ]}
      />

      <Header />

      <main className="flex-grow">
        <PageHero
          badge={course.topic || "Khóa học"}
          title={course.title}
          subtitle={course.instructor ? `Giảng viên: ${course.instructor}` : "Học miễn phí trên YouTube"}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/courses")}
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Danh sách khóa học
            </Button>
          }
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-5">
              <SectionPanel title="Video khóa học" subtitle="Playlist YouTube — học trực tiếp trên trang">
                <div className="aspect-video rounded-lg overflow-hidden bg-black border border-[#004080]/10">
                  <iframe
                    src={embedUrl}
                    title={course.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </SectionPanel>

              <SectionPanel title="Giới thiệu khóa học">
                <div className="flex flex-wrap gap-3 mb-5">
                  {course.instructor && (
                    <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <User className="h-4 w-4 text-[#004080]" />
                      {course.instructor}
                    </div>
                  )}
                  {course.topic && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#004080]/8 text-[#004080] rounded-full text-xs font-medium">
                      <Tag className="h-3 w-3" />
                      {course.topic}
                    </span>
                  )}
                  {course.level && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
                        LEVEL_BADGE[course.level] || "bg-slate-100 text-slate-700",
                      )}
                    >
                      <BarChart className="h-3 w-3" />
                      {LEVEL_LABEL[course.level] || course.level}
                    </span>
                  )}
                  {course.language && (
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      {course.language}
                    </span>
                  )}
                </div>
                <div>{renderMarkdownContent(seoContent)}</div>
              </SectionPanel>

              <SectionPanel title={`Bình luận (${comments.length})`} subtitle="Chia sẻ câu hỏi hoặc ghi chú học tập">
                <form onSubmit={handleSubmitComment} className="mb-6">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Viết bình luận của bạn…"
                    className="w-full px-4 py-3 text-sm border border-[#004080]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080]/30 resize-none uupm-focus"
                    rows={4}
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
                      <div key={c.id} className="border-b border-[#004080]/10 pb-4 last:border-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 bg-[#004080]/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-[#004080]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{c.user}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground pl-12">{c.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </SectionPanel>
            </div>

            <div className="space-y-5">
              <LeadCaptureForm
                source="course_page"
                sourceId={course.slug || course.id}
                compact={false}
              />

              {relatedCourses && relatedCourses.length > 0 && (
                <SectionPanel title="Khóa học liên quan" subtitle={`Cùng chủ đề ${course.topic}`}>
                  <div className="space-y-3">
                    {relatedCourses.map((related: {
                      id: number;
                      title: string;
                      instructor?: string;
                      youtube_url?: string;
                      thumbnail_url?: string;
                    }) => (
                      <button
                        key={related.id}
                        type="button"
                        onClick={() => navigate(getCourseUrl(related))}
                        className="w-full text-left group flex gap-3 p-2 rounded-lg hover:bg-[#004080]/5 transition-colors uupm-focus"
                      >
                        <div className="w-24 shrink-0 aspect-video rounded-md overflow-hidden relative border border-[#004080]/10">
                          <CourseThumbnail
                            videoUrl={related.youtube_url || related.thumbnail_url || ""}
                            title={related.title}
                            fallbackGradient={getPlaceholderGradient(related.title)}
                          />
                        </div>
                        <div className="min-w-0 py-0.5">
                          <h3 className="text-sm font-medium line-clamp-2 group-hover:text-[#004080] transition-colors">
                            {related.title}
                          </h3>
                          {related.instructor && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">{related.instructor}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </SectionPanel>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
