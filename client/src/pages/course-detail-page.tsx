import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/components/seo/page-meta";
import { CourseSchema } from "@/components/seo/course-schema";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { getCourseUrl, buildSeoDescription, buildSeoContent } from "@/lib/course-utils";
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

function renderMarkdownContent(content: string) {
  return content.split("\n").map((line, i) => {
    if (line.startsWith("## ")) {
      return (
        <h3 key={i} className="text-lg font-bold text-gray-900 mt-6 mb-2">
          {line.replace("## ", "")}
        </h3>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <li key={i} className="text-gray-700 ml-4 list-disc">
          {line.replace("- ", "")}
        </li>
      );
    }
    if (line.trim() === "") return <br key={i} />;
    return (
      <p key={i} className="text-gray-700 leading-relaxed mb-2">
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
      return data.courses?.filter((c: any) => c.id !== course.id) || [];
    },
    enabled: !!course?.topic,
  });

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy khóa học</h2>
            <Button onClick={() => navigate("/courses")}>
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
    course.playlist_id || course.youtube_url.match(/list=([^&]+)/)?.[1] || "";
  const embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;

  const levelColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
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
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="text-sm text-gray-500 mb-2">
              <a href="/" className="hover:text-indigo-600">Trang chủ</a>
              <span className="mx-2">/</span>
              <a href="/courses" className="hover:text-indigo-600">Khóa học</a>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{course.title}</span>
            </nav>
            <Button
              variant="ghost"
              onClick={() => navigate("/courses")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách khóa học
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="aspect-video bg-black">
                  <iframe
                    src={embedUrl}
                    title={course.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>

                <div className="flex flex-wrap gap-4 mb-6">
                  {course.instructor && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <User className="h-5 w-5" />
                      <span>{course.instructor}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-700">
                    <Tag className="h-5 w-5" />
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                      {course.topic}
                    </span>
                  </div>
                  {course.level && (
                    <div className="flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-gray-700" />
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                          levelColors[course.level as keyof typeof levelColors] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {course.level}
                      </span>
                    </div>
                  )}
                  {course.language && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Globe className="h-5 w-5" />
                      <span>{course.language}</span>
                    </div>
                  )}
                </div>

                <div className="prose prose-gray max-w-none">
                  {renderMarkdownContent(seoContent)}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Bình luận ({comments.length})
                </h2>
                <form onSubmit={handleSubmitComment} className="mb-8">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Viết bình luận của bạn..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
                    rows={4}
                  />
                  <div className="mt-3 flex justify-end">
                    <Button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      disabled={!comment.trim()}
                    >
                      Gửi bình luận
                    </Button>
                  </div>
                </form>
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Chưa có bình luận nào. Hãy là người đầu tiên!
                    </p>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="border-b border-gray-200 pb-4 last:border-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{c.user}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700 ml-13">{c.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            <div className="space-y-6">
              <LeadCaptureForm
                source="course_page"
                sourceId={course.slug || course.id}
                compact={false}
              />

              {relatedCourses && relatedCourses.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Khóa học liên quan</h2>
                  <div className="space-y-4">
                    {relatedCourses.map((relatedCourse: any) => (
                      <div
                        key={relatedCourse.id}
                        onClick={() => navigate(getCourseUrl(relatedCourse))}
                        className="group cursor-pointer border border-gray-200 rounded-lg p-3 hover:border-indigo-600 hover:shadow-md transition-all"
                      >
                        <div className="aspect-video rounded-lg mb-3 overflow-hidden relative">
                          <CourseThumbnail
                            videoUrl={relatedCourse.youtube_url || relatedCourse.thumbnail_url || ""}
                            title={relatedCourse.title}
                            fallbackGradient="from-indigo-400 to-purple-600"
                          />
                        </div>
                        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm group-hover:text-indigo-600 transition-colors">
                          {relatedCourse.title}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">{relatedCourse.instructor}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
