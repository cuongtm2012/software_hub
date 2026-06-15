import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageHero } from "@/components/design-system/page-hero";
import { SectionPanel } from "@/components/design-system/section-panel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  BookOpen,
  Loader2,
  Search,
  SlidersHorizontal,
  AlertCircle,
  ListVideo,
  LayoutGrid,
  ChevronLeft,
  ArrowUpDown,
} from "lucide-react";
import { Pagination } from "@/components/pagination";
import { CourseThumbnail } from "@/components/course-thumbnail";
import { buildCourseDetailUrl, buildCoursesListPath } from "@/lib/course-utils";
import { getUrlSearchParams } from "@/lib/url-search";
import { PageMeta } from "@/components/seo/page-meta";
import { absoluteUrl } from "@/lib/seo-config";
import { cn } from "@/lib/utils";
import { getPlaceholderGradient } from "@/components/design-system/tokens";

const LEVELS = [
  { value: "all", label: "Tất cả trình độ" },
  { value: "beginner", label: "Cơ bản" },
  { value: "intermediate", label: "Trung cấp" },
  { value: "advanced", label: "Nâng cao" },
] as const;

const LEVEL_BADGE: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-800 border-emerald-200",
  intermediate: "bg-amber-100 text-amber-800 border-amber-200",
  advanced: "bg-red-100 text-red-800 border-red-200",
};

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

const SORT_OPTIONS = [
  { value: "recent", label: "Mới cập nhật" },
  { value: "newest", label: "Mới thêm" },
  { value: "title", label: "Tên (A-Z)" },
  { value: "title_desc", label: "Tên (Z-A)" },
] as const;

const selectClass =
  "w-full h-10 px-3 text-sm border border-[#004080]/15 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#004080]/30 uupm-focus";

function CourseFilters({
  topic,
  level,
  searchQuery,
  sort,
  topicsData,
  onTopicChange,
  onLevelChange,
  onSearchChange,
  onSortChange,
  onClear,
}: {
  topic: string;
  level: string;
  searchQuery: string;
  sort: string;
  topicsData?: { topic: string; count: number }[];
  onTopicChange: (v: string) => void;
  onLevelChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  onSortChange: (v: string) => void;
  onClear: () => void;
}) {
  const totalTopics = topicsData?.reduce((sum, t) => sum + t.count, 0) || 0;

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Tìm kiếm</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tên khóa học, giảng viên…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-sm border border-[#004080]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080]/30 uupm-focus"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Chủ đề</label>
        <select value={topic} onChange={(e) => onTopicChange(e.target.value)} className={selectClass}>
          <option value="all">Tất cả chủ đề ({totalTopics})</option>
          {topicsData?.map((t) => (
            <option key={t.topic} value={t.topic}>
              {t.topic} ({t.count})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Trình độ</label>
        <select value={level} onChange={(e) => onLevelChange(e.target.value)} className={selectClass}>
          {LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Sắp xếp</label>
        <select value={sort} onChange={(e) => onSortChange(e.target.value)} className={selectClass}>
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="w-full h-10 px-4 text-sm font-medium text-[#004080] bg-[#004080]/8 hover:bg-[#004080]/12 rounded-lg transition-colors"
      >
        Xóa bộ lọc
      </button>
    </div>
  );
}

export default function CoursesListPage() {
  const [location, navigate] = useLocation();
  const searchParams = getUrlSearchParams();

  const [topic, setTopic] = useState(searchParams.get("topic") || "all");
  const [level, setLevel] = useState(searchParams.get("level") || "all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "recent");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("courses-filters-collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("courses-filters-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Restore filters/page when URL changes (browser back, returnTo links)
  useEffect(() => {
    const params = getUrlSearchParams();
    setTopic(params.get("topic") || "all");
    setLevel(params.get("level") || "all");
    setSearchQuery(params.get("search") || "");
    setSort(params.get("sort") || "recent");
    setPage(parseInt(params.get("page") || "1", 10));
  }, [location]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (topic !== "all") params.set("topic", topic);
    if (level !== "all") params.set("level", level);
    if (searchQuery) params.set("search", searchQuery);
    if (sort !== "recent") params.set("sort", sort);
    if (page !== 1) params.set("page", page.toString());
    const newUrl = `/courses${params.toString() ? "?" + params.toString() : ""}`;
    window.history.replaceState({}, "", newUrl);
  }, [topic, level, searchQuery, sort, page]);

  const { data: topicsData } = useQuery({
    queryKey: ["/api/courses/topics"],
    queryFn: async () => {
      const response = await fetch("/api/courses/topics");
      if (!response.ok) throw new Error("Failed to fetch topics");
      return response.json();
    },
  });

  const { data: coursesData, isLoading, error } = useQuery({
    queryKey: ["/api/courses", topic, level, searchQuery, sort, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (topic !== "all") params.set("topic", topic);
      if (level !== "all") params.set("level", level);
      if (searchQuery) params.set("search", searchQuery);
      if (sort !== "recent") params.set("sort", sort);
      params.set("offset", ((page - 1) * 30).toString());
      params.set("limit", "30");
      const response = await fetch(`/api/courses?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch courses");
      return response.json();
    },
  });

  const clearFilters = () => {
    setTopic("all");
    setLevel("all");
    setSearchQuery("");
    setSort("recent");
    setPage(1);
  };

  const handleTopicChange = (value: string) => {
    setTopic(value);
    setPage(1);
  };

  const handleLevelChange = (value: string) => {
    setLevel(value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    setPage(1);
  };

  const totalPages = Math.ceil((coursesData?.total || 0) / 30);
  const listReturnPath = buildCoursesListPath({
    topic,
    level,
    search: searchQuery,
    sort,
    page,
  });
  const heroTitle = topic === "all" ? "Khóa học lập trình" : topic;
  const metaTitle =
    topic === "all"
      ? "Khóa học lập trình miễn phí tiếng Việt"
      : `Khóa học ${topic} miễn phí tiếng Việt`;
  const metaDescription =
    topic === "all"
      ? "Học lập trình miễn phí với 50+ khóa học IT tiếng Việt: React, Python, JavaScript, DevOps và nhiều hơn nữa."
      : `Học ${topic} miễn phí bằng tiếng Việt — lộ trình chi tiết, video YouTube chất lượng cho sinh viên và người mới.`;
  const canonicalPath =
    topic === "all" ? "/courses" : `/courses?topic=${encodeURIComponent(topic)}`;

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col overflow-x-hidden">
      <PageMeta
        title={metaTitle}
        description={metaDescription}
        canonicalUrl={absoluteUrl(canonicalPath)}
      />
      <Header />

      <main className="min-w-0 flex-grow overflow-x-hidden">
        <PageHero
          badge="Miễn phí 100%"
          title={heroTitle}
          subtitle={`Khám phá ${coursesData?.total?.toLocaleString("vi-VN") || "50+"}+ khóa học IT tiếng Việt từ cộng đồng và chuyên gia`}
        />

        <div className="w-full min-w-0 max-w-full px-[4%] py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Desktop sidebar */}
            <aside
              className={cn(
                "hidden lg:block shrink-0 transition-[width] duration-300 ease-in-out",
                sidebarCollapsed ? "w-full lg:w-14" : "w-full lg:w-64 xl:w-72",
              )}
            >
              <div
                className={cn(
                  "bg-white rounded-xl border border-[#004080]/10 sticky top-24 uupm-card transition-all duration-300",
                  sidebarCollapsed ? "p-2 lg:p-3" : "p-5",
                )}
              >
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed((c) => !c)}
                  className={cn(
                    "flex items-center text-[#004080] rounded-lg transition-colors uupm-focus",
                    sidebarCollapsed
                      ? "justify-center w-full p-2 hover:bg-[#004080]/8"
                      : "gap-2 w-full p-1 -m-1 mb-5 hover:bg-[#004080]/5",
                  )}
                  aria-expanded={!sidebarCollapsed}
                  aria-label={sidebarCollapsed ? "Mở bộ lọc" : "Thu gọn bộ lọc"}
                  title={sidebarCollapsed ? "Mở bộ lọc" : "Thu gọn bộ lọc"}
                >
                  <LayoutGrid className="h-5 w-5 shrink-0" />
                  {!sidebarCollapsed && (
                    <>
                      <h2 className="text-base font-semibold flex-1 text-left">Bộ lọc</h2>
                      <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </>
                  )}
                </button>
                {!sidebarCollapsed && (
                  <CourseFilters
                    topic={topic}
                    level={level}
                    searchQuery={searchQuery}
                    sort={sort}
                    topicsData={topicsData}
                    onTopicChange={handleTopicChange}
                    onLevelChange={handleLevelChange}
                    onSearchChange={handleSearchChange}
                    onSortChange={handleSortChange}
                    onClear={clearFilters}
                  />
                )}
              </div>
            </aside>

            {/* Mobile filter sheet */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetContent side="left" className="w-full sm:max-w-sm overflow-y-auto">
                <SheetHeader className="mb-6 text-left">
                  <SheetTitle>Bộ lọc khóa học</SheetTitle>
                </SheetHeader>
                <CourseFilters
                  topic={topic}
                  level={level}
                  searchQuery={searchQuery}
                  sort={sort}
                  topicsData={topicsData}
                  onTopicChange={handleTopicChange}
                  onLevelChange={handleLevelChange}
                  onSearchChange={handleSearchChange}
                  onSortChange={handleSortChange}
                  onClear={() => {
                    clearFilters();
                    setFiltersOpen(false);
                  }}
                />
              </SheetContent>
            </Sheet>

            <div className="flex-1 min-w-0 space-y-5">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(true)}
                    className="lg:hidden inline-flex items-center gap-2 h-10 px-4 border border-[#004080]/20 rounded-lg text-sm font-medium hover:bg-[#004080]/5 transition-colors uupm-focus"
                  >
                    <SlidersHorizontal className="h-4 w-4 text-[#004080]" />
                    Bộ lọc
                  </button>
                  <div className="inline-flex items-center gap-2 h-10 px-3 border border-[#004080]/20 rounded-lg bg-white text-sm">
                    <ArrowUpDown className="h-4 w-4 text-[#004080] shrink-0" />
                    <label htmlFor="courses-sort" className="sr-only">
                      Sắp xếp khóa học
                    </label>
                    <select
                      id="courses-sort"
                      value={sort}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="bg-transparent border-0 p-0 pr-6 text-sm font-medium text-slate-700 focus:outline-none focus:ring-0 cursor-pointer uupm-focus"
                    >
                      {SORT_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {!isLoading && !error && (
                  <p className="text-sm text-muted-foreground">
                    Hiển thị{" "}
                    <span className="font-semibold text-[#004080]">
                      {coursesData?.courses?.length || 0}
                    </span>{" "}
                    / {coursesData?.total?.toLocaleString("vi-VN") || 0} khóa học
                  </p>
                )}
              </div>

              {/* Topic chips */}
              {topicsData && topicsData.length > 0 && (
                <SectionPanel title="Chủ đề phổ biến" subtitle="Lọc nhanh theo hashtag">
                  <div className="flex flex-wrap gap-2">
                    {topicsData.slice(0, 15).map((topicItem: { topic: string; count: number }) => (
                      <button
                        key={topicItem.topic}
                        type="button"
                        onClick={() => handleTopicChange(topicItem.topic)}
                        className={cn(
                          "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                          topic === topicItem.topic
                            ? "bg-[#004080] text-white shadow-sm"
                            : "bg-[#004080]/8 text-[#004080] hover:bg-[#004080]/15",
                        )}
                      >
                        <span>#{topicItem.topic}</span>
                        <span className="opacity-70">({topicItem.count})</span>
                      </button>
                    ))}
                  </div>
                </SectionPanel>
              )}

              {/* Results */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-[#004080] mb-3" />
                  <p className="text-sm text-muted-foreground">Đang tải khóa học…</p>
                </div>
              ) : error ? (
                <div className="text-center py-16 bg-white rounded-xl border border-[#004080]/10 uupm-card">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-1">Lỗi tải khóa học</h3>
                  <p className="text-sm text-muted-foreground">Vui lòng thử lại sau.</p>
                </div>
              ) : coursesData?.courses?.length > 0 ? (
                <>
                  <div className="grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {coursesData.courses.map((course: {
                      id: number;
                      slug?: string;
                      title: string;
                      instructor?: string;
                      topic?: string;
                      level?: string;
                      youtube_url?: string;
                      thumbnail_url?: string;
                      playlist_id?: string;
                    }) => (
                      <article
                        key={course.id}
                        onClick={() => navigate(buildCourseDetailUrl(course, listReturnPath))}
                        className="group uupm-card uupm-interactive overflow-hidden border border-[#004080]/10 rounded-xl bg-white cursor-pointer flex flex-col"
                      >
                        <div className="relative pt-[56%] overflow-hidden">
                          <CourseThumbnail
                            videoUrl={course.youtube_url || course.thumbnail_url || ""}
                            title={course.title}
                            playlistId={course.playlist_id}
                            thumbnailUrl={course.thumbnail_url}
                            fallbackGradient={getPlaceholderGradient(course.title)}
                          />
                          {course.playlist_id && (
                            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-semibold">
                              <ListVideo className="h-3 w-3" />
                              Playlist
                            </span>
                          )}
                          {course.level && (
                            <span
                              className={cn(
                                "absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                                LEVEL_BADGE[course.level] || "bg-slate-100 text-slate-700",
                              )}
                            >
                              {LEVEL_LABEL[course.level] || course.level}
                            </span>
                          )}
                        </div>
                        <div className="p-3 flex flex-col flex-1 gap-2">
                          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-[#004080] transition-colors">
                            {course.title}
                          </h3>
                          {course.instructor && (
                            <p className="text-xs text-muted-foreground truncate">{course.instructor}</p>
                          )}
                          {course.topic && (
                            <span className="mt-auto self-start px-2 py-0.5 bg-[#004080]/8 text-[#004080] rounded text-[10px] font-medium">
                              {course.topic}
                            </span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="pt-4">
                      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-[#004080]/10 uupm-card">
                  <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-1">Không tìm thấy khóa học</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Thử đổi bộ lọc hoặc từ khóa tìm kiếm khác.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-medium text-[#004080] hover:underline"
                  >
                    Xóa bộ lọc
                  </button>
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
