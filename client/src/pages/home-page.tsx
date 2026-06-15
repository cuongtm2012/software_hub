import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  TrendingUp,
  Monitor,
  Code,
  ArrowRight,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import {
  SoftwareProductCard,
  SoftwareProductCardSkeleton,
} from "@/components/software-product-card";
import { CourseThumbnail } from "@/components/course-thumbnail";
import { getCourseUrl } from "@/lib/course-utils";
import { PageHero } from "@/components/design-system/page-hero";
import { getPlaceholderGradient } from "@/components/design-system/tokens";
import { HorizontalScrollRow } from "@/components/horizontal-scroll-row";
import { PageMeta } from "@/components/seo/page-meta";
import { absoluteUrl } from "@/lib/seo-config";

// Utility function to chunk array into groups
const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export default function HomePage() {
  const [location, navigate] = useLocation();

  // Get filter from URL params
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const categoryFromUrl = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);

  // Sync URL param changes to state (when URL changes externally)
  useEffect(() => {
    if (categoryFromUrl !== selectedCategory) {
      console.log(`📍 URL changed to category: ${categoryFromUrl}`);
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  // Sync state changes to URL (when user clicks category button)
  useEffect(() => {
    const currentParams = new URLSearchParams(location.split('?')[1] || '');
    const currentCategory = currentParams.get('category') || 'all';

    if (selectedCategory !== currentCategory) {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }
      const newUrl = `/${params.toString() ? '?' + params.toString() : ''}`;
      console.log(`🔄 Updating URL to: ${newUrl}`);
      window.history.replaceState({}, '', newUrl);
    }
  }, [selectedCategory, location]);

  // Responsive grid calculation for "Tất cả sản phẩm" section
  const [gridColumns, setGridColumns] = useState(6); // Default: Desktop
  const [itemsToDisplay, setItemsToDisplay] = useState(18); // 6 columns × 3 rows

  useEffect(() => {
    const calculateGrid = () => {
      const width = window.innerWidth;
      let columns = 6; // Desktop default

      if (width < 640) {
        columns = 2; // Mobile
      } else if (width < 1024) {
        columns = 3; // Tablet Portrait
      } else if (width < 1280) {
        columns = 4; // Tablet Landscape/Laptop
      } else {
        columns = 6; // Desktop
      }

      setGridColumns(columns);
      setItemsToDisplay(columns * 3); // Always 3 rows
    };

    calculateGrid();
    window.addEventListener('resize', calculateGrid);
    return () => window.removeEventListener('resize', calculateGrid);
  }, []);

  // Fetch curated popular software (legacy catalog, stable order)
  const { data: popularSoftware, isLoading: isLoadingPopular } = useQuery({
    queryKey: ["/api/softwares/popular"],
    queryFn: async () => {
      const response = await fetch("/api/softwares?limit=10&sort=popular");
      if (!response.ok) throw new Error("Failed to fetch popular software");
      return response.json();
    },
  });

  // Fetch latest courses (distinct content from software carousel)
  const { data: latestCourses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["/api/courses/latest"],
    queryFn: async () => {
      const response = await fetch("/api/courses?limit=10");
      if (!response.ok) throw new Error("Failed to fetch courses");
      return response.json();
    },
  });

  // Fetch all software with type-based filtering
  const {
    data: allSoftware,
    isLoading: isLoadingAll
  } = useQuery({
    queryKey: ["/api/softwares/all", selectedCategory, itemsToDisplay],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: itemsToDisplay.toString() });

      // Strict type-based filtering
      if (selectedCategory === "software") {
        params.append("type", "software");
      } else if (selectedCategory === "api") {
        params.append("type", "api");
      }
      // For "all" - no type filter, shows both software and api

      const url = `/api/softwares?${params}`;
      console.log(`🔍 Fetching: ${url} for category: ${selectedCategory}`);

      // Add cache-busting headers
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error("Failed to fetch software");
      const data = await response.json();

      console.log(`✅ Received ${data.softwares?.length || 0} items for category: ${selectedCategory}`);
      if (data.softwares?.length > 0) {
        console.log(`   First item: ${data.softwares[0].name} (type: ${data.softwares[0].type})`);
      }

      return data;
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache (React Query v5)
  });

  // Fetch APIs (from Development (APIs) category)
  const {
    data: apiSoftware,
    isLoading: isLoadingApis
  } = useQuery({
    queryKey: ["/api/softwares/apis"],
    queryFn: async () => {
      const response = await fetch("/api/softwares?limit=10&type=api", {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error("Failed to fetch APIs");
      return response.json();
    }
  });


  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const openSoftware = (software: { id: number; slug?: string | null }) => {
    navigate(`/software/${software.slug || software.id}`);
  };

  const categories = [
    { id: "all", name: "Tất cả", icon: Sparkles },
    { id: "software", name: "Phần mềm", icon: Monitor },
    { id: "api", name: "API", icon: Code },
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-[#f9f9f9]">
      <PageMeta
        title="Khóa học IT, phần mềm miễn phí & Marketplace số"
        description="Học lập trình miễn phí, tải phần mềm và mua sản phẩm số. Nền tảng IT cho sinh viên, developer và SME Việt Nam."
        canonicalUrl={absoluteUrl("/")}
      />
      <Header />

      <main className="min-w-0 flex-grow overflow-x-hidden">
        <PageHero
          align="centered"
          badge="Software Hub Marketplace"
          title={
            <>
              Khám phá{" "}
              <span className="text-[#ffcc00] drop-shadow-[0_1px_3px_rgba(0,0,0,0.25)]">
                phần mềm chất lượng
              </span>
            </>
          }
          subtitle="Tìm, tải và khám phá giải pháp phần mềm phù hợp cho doanh nghiệp của bạn"
          actions={
            <>
              <Button
                size="lg"
                onClick={() => navigate("/software")}
                className="bg-[#ffcc00] text-[#004080] hover:bg-[#e6b800] font-semibold shadow-lg shadow-black/10"
              >
                Xem tất cả phần mềm
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/marketplace")}
                className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                Khám phá marketplace
              </Button>
            </>
          }
        />

        {/* Popular Software */}
        <section className="overflow-hidden border-b bg-white py-8">
          <div className="w-full min-w-0 max-w-full px-[4%]">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                  <TrendingUp className="w-6 h-6 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900">Phần mềm nổi bật</h2>
                  <p className="text-sm text-gray-600">Bộ sưu tập được tuyển chọn — tải miễn phí</p>
                </div>
              </div>
              <Button
                variant="link"
                className="text-[#004080] shrink-0 hidden sm:inline-flex"
                onClick={() => navigate("/software")}
              >
                Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <HorizontalScrollRow>
              {isLoadingPopular
                ? Array.from({ length: 6 }).map((_, i) => (
                    <SoftwareProductCardSkeleton
                      key={i}
                      className="w-[calc((100%-1rem)/2.2)] min-w-[160px] max-w-[220px] shrink-0 snap-start sm:w-[calc((100%-2.5rem)/3.5)] lg:w-[calc((100%-5rem)/5.2)]"
                    />
                  ))
                : (popularSoftware?.softwares || []).map((software: Parameters<typeof openSoftware>[0]) => (
                    <SoftwareProductCard
                      key={software.id}
                      software={software}
                      onOpen={openSoftware}
                      className="w-[calc((100%-1rem)/2.2)] min-w-[160px] max-w-[220px] shrink-0 snap-start sm:w-[calc((100%-2.5rem)/3.5)] lg:w-[calc((100%-5rem)/5.2)]"
                    />
                  ))}
            </HorizontalScrollRow>
          </div>
        </section>

        {/* Latest Courses */}
        <section className="overflow-hidden border-b bg-gradient-to-br from-slate-50 to-white py-8">
          <div className="w-full min-w-0 max-w-full px-[4%]">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-[#004080]/10 rounded-lg shrink-0">
                  <GraduationCap className="w-6 h-6 text-[#004080]" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900">Khóa học IT</h2>
                  <p className="text-sm text-gray-600">Học miễn phí qua YouTube — lộ trình tiếng Việt</p>
                </div>
              </div>
              <Button
                variant="link"
                className="text-[#004080] shrink-0 hidden sm:inline-flex"
                onClick={() => navigate("/courses")}
              >
                Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <HorizontalScrollRow>
              {isLoadingCourses
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-[calc((100%-1rem)/2.2)] min-w-[180px] max-w-[240px] shrink-0 snap-start sm:w-[calc((100%-2.5rem)/3.5)] lg:w-[calc((100%-5rem)/5.2)] rounded-xl border border-[#004080]/10 bg-white overflow-hidden"
                    >
                      <div className="aspect-video bg-slate-100 animate-pulse" />
                      <div className="p-3 space-y-2">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                        <div className="h-3 bg-slate-100 rounded w-2/3 animate-pulse" />
                      </div>
                    </div>
                  ))
                : (latestCourses?.courses || []).map(
                    (course: {
                      id: number;
                      title: string;
                      instructor?: string;
                      topic?: string;
                      level?: string;
                      youtube_url?: string;
                      thumbnail_url?: string;
                      slug?: string;
                    }) => (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => navigate(getCourseUrl(course))}
                        className="w-[calc((100%-1rem)/2.2)] min-w-[180px] max-w-[240px] shrink-0 snap-start sm:w-[calc((100%-2.5rem)/3.5)] lg:w-[calc((100%-5rem)/5.2)] text-left rounded-xl border border-[#004080]/10 bg-white overflow-hidden uupm-card uupm-interactive group"
                      >
                        <div className="relative aspect-video bg-slate-100 overflow-hidden">
                          <CourseThumbnail
                            videoUrl={course.youtube_url || course.thumbnail_url || ""}
                            title={course.title}
                            fallbackGradient={getPlaceholderGradient(course.title)}
                          />
                          {course.level && (
                            <span className="absolute top-2 left-2 bg-[#004080] text-white px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                              {course.level === "beginner"
                                ? "Cơ bản"
                                : course.level === "advanced"
                                  ? "Nâng cao"
                                  : "Trung cấp"}
                            </span>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-[#004080] transition-colors mb-1">
                            {course.title}
                          </h3>
                          {course.instructor && (
                            <p className="text-xs text-muted-foreground truncate">{course.instructor}</p>
                          )}
                          {course.topic && (
                            <p className="text-xs text-[#004080] mt-1 truncate">#{course.topic}</p>
                          )}
                        </div>
                      </button>
                    ),
                  )}
            </HorizontalScrollRow>

            {!isLoadingCourses && (!latestCourses?.courses || latestCourses.courses.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Chưa có khóa học.{" "}
                <button type="button" className="text-[#004080] underline" onClick={() => navigate("/courses")}>
                  Khám phá kho học
                </button>
              </p>
            )}
          </div>
        </section>


        {/* IT Services Banner - Dark Section */}
        <section className="bg-slate-800 text-white py-12">
          <div className="w-full px-[4%]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left Content */}
              <div>
                <div className="inline-flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-md mb-4">
                  <Code className="w-4 h-4 text-amber-400" />
                  <span className="text-sm">Dịch vụ phát triển chuyên nghiệp</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                  Cần phát triển phần mềm tùy chỉnh?
                </h2>
                <p className="text-slate-300 text-base mb-6 leading-relaxed">
                  Kết nối với các developer chuyên nghiệp để xây dựng giải pháp phần mềm theo yêu cầu của bạn.
                  Từ web app, mobile app đến hệ thống doanh nghiệp phức tạp.
                </p>



                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => navigate('/it-services')}
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-slate-900 px-6 py-3 bg-transparent"
                  >
                    Xem dịch vụ IT
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => navigate('/request-project')}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-6 py-3"
                  >
                    Yêu cầu dự án ngay
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Right Stats Grid - 2x2 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 backdrop-blur-sm rounded-lg p-6 text-center">
                  <div className="text-4xl font-bold text-amber-400 mb-2">500+</div>
                  <div className="text-sm text-slate-300">Dự án hoàn thành</div>
                </div>
                <div className="bg-slate-700/50 backdrop-blur-sm rounded-lg p-6 text-center">
                  <div className="text-4xl font-bold text-amber-400 mb-2">4.8★</div>
                  <div className="text-sm text-slate-300">Đánh giá trung bình</div>
                </div>
                <div className="bg-slate-700/50 backdrop-blur-sm rounded-lg p-6 text-center">
                  <div className="text-4xl font-bold text-amber-400 mb-2">50+</div>
                  <div className="text-sm text-slate-300">Developers</div>
                </div>
                <div className="bg-slate-700/50 backdrop-blur-sm rounded-lg p-6 text-center">
                  <div className="text-4xl font-bold text-amber-400 mb-2">24/7</div>
                  <div className="text-sm text-slate-300">Hỗ trợ khách hàng</div>
                </div>
              </div>
            </div>
          </div>
        </section >

        {/* Category Filter Bar */}
        <section className="bg-white border-b sticky top-16 z-40 shadow-sm">
          <div className="w-full px-[4%] py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Danh mục</h2>
              <Button
                variant="link"
                className="text-[#004080] font-medium text-sm flex items-center"
                onClick={() => navigate('/software')}
              >
                Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border whitespace-nowrap transition-all duration-200 font-medium ${isActive
                      ? 'bg-[#004080] text-white border-[#004080] shadow-md scale-105'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#004080] hover:bg-gray-50'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-8">
          <div className="w-full px-[4%]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Tất cả sản phẩm</h2>
              <div className="text-sm text-gray-600">
                {allSoftware?.softwares?.length > 0 ? (
                  `Hiển thị ${Math.min(allSoftware.softwares.length, itemsToDisplay)} kết quả (${gridColumns} cột × 3 hàng)`
                ) : (
                  'Không có kết quả'
                )}
              </div>
            </div>

            {/* Empty State */}
            {!isLoadingAll && (!allSoftware?.softwares || allSoftware.softwares.length === 0) ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Monitor className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Chưa có dữ liệu cho danh mục này
                </h3>
                <p className="text-gray-500 mb-6">
                  {selectedCategory === 'api'
                    ? 'Hiện tại chưa có API nào trong hệ thống.'
                    : selectedCategory === 'software'
                      ? 'Hiện tại chưa có phần mềm nào trong danh mục này.'
                      : 'Vui lòng chọn danh mục khác hoặc thử lại sau.'}
                </p>
                <Button
                  onClick={() => setSelectedCategory('all')}
                  className="bg-[#004080] hover:bg-[#003366] text-white"
                >
                  Xem tất cả
                </Button>
              </div>
            ) : (
              <>
                {/* 3 Rows - Responsive Grid (Dynamic) */}
                <div className="space-y-5">
                  {chunkArray(
                    (allSoftware?.softwares || Array(itemsToDisplay).fill(null)).slice(0, itemsToDisplay),
                    gridColumns
                  ).map((chunk, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                      {chunk.map((software: any, index: number) => (
                        <SoftwareProductCard
                          key={software?.id || `${rowIndex}-${index}`}
                          software={software}
                          onOpen={openSoftware}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/software')}
                    className="border-[#004080] text-[#004080] hover:bg-[#004080]/5"
                  >
                    Xem thêm sản phẩm
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>
      </main >

      <Footer />

    </div >
  );
}
