import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  TrendingUp,
  Clock,
  Star,
  Download,
  Monitor,
  Code,
  Users,
  Briefcase,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { getShortDescription } from "@/lib/translations";

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

  // Fetch popular software
  const {
    data: popularSoftware,
    isLoading: isLoadingPopular
  } = useQuery({
    queryKey: ["/api/softwares/popular"],
    queryFn: async () => {
      const response = await fetch("/api/softwares?limit=10&sort=downloads");
      if (!response.ok) throw new Error("Failed to fetch popular software");
      return response.json();
    }
  });

  // Fetch recent software
  const {
    data: recentSoftware,
    isLoading: isLoadingRecent
  } = useQuery({
    queryKey: ["/api/softwares/recent"],
    queryFn: async () => {
      const response = await fetch("/api/softwares?limit=10&sort=updated_at");
      if (!response.ok) throw new Error("Failed to fetch recent software");
      return response.json();
    }
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

  // Generate gradient colors based on first letter
  const getGradientColors = (name: string) => {
    const firstChar = name.charAt(0).toUpperCase();
    const gradients = [
      'from-purple-400 via-pink-500 to-red-500',
      'from-blue-400 via-cyan-500 to-teal-500',
      'from-green-400 via-emerald-500 to-cyan-500',
      'from-yellow-400 via-orange-500 to-red-500',
      'from-indigo-400 via-purple-500 to-pink-500',
      'from-rose-400 via-fuchsia-500 to-purple-500',
      'from-amber-400 via-orange-500 to-pink-500',
      'from-lime-400 via-green-500 to-emerald-500',
      'from-sky-400 via-blue-500 to-indigo-500',
      'from-violet-400 via-purple-500 to-fuchsia-500',
    ];
    const index = firstChar.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  const categories = [
    { id: "all", name: "Tất cả", icon: Sparkles },
    { id: "software", name: "Phần mềm", icon: Monitor },
    { id: "api", name: "API", icon: Code },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white py-16">
          <div className="w-full px-[4%]">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Discover Amazing Software
              </h1>
              <p className="text-xl text-slate-200 mb-8">
                Find, download, and explore the best software for your needs
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/software")}
                className="bg-white text-slate-900 hover:bg-slate-100"
              >
                Browse All Software
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Top Downloads Section */}
        <section className="bg-white border-b py-8">
          <div className="w-full px-[4%]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Tải nhiều nhất</h2>
                <p className="text-sm text-gray-600">Phần mềm và tài liệu phổ biến nhất tuần này</p>
              </div>
            </div>

            {/* Horizontal Scroll */}
            <div className="horizontal-scroll -mx-[4%] px-[4%]">
              {(popularSoftware?.softwares || Array(10).fill(null)).map((software: any, index: number) => (
                <div
                  key={software?.id || index}
                  onClick={() => software && navigate(`/software/${software.id}`)}
                  className="scroll-snap-item bg-white rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 group cursor-pointer border border-gray-200 hover:border-[#004080] hover:scale-105 flex flex-col h-full"
                  title={software?.name ? `Xem chi tiết ${software.name}` : undefined}
                >
                  <div className="relative h-32 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    {software?.image_url ? (
                      <img
                        src={software.image_url}
                        alt={software.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const placeholder = e.currentTarget.nextElementSibling;
                          if (placeholder) {
                            (placeholder as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${software ? getGradientColors(software.name) : 'from-gray-300 to-gray-400'} flex items-center justify-center transition-all duration-300`}
                      style={{ display: software?.image_url ? 'none' : 'flex' }}
                    >
                      <div className="text-center">
                        <div className="text-4xl font-bold text-white opacity-90 mb-1">
                          {software?.name ? software.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <Monitor className="h-8 w-8 text-white opacity-75 mx-auto" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1">
                      {software?.name || "Loading..."}
                    </h3>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-500">Software</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-current" />
                        <span className="font-semibold">4.5</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <Download className="w-3 h-3" />
                      <span className="font-semibold">{Math.floor(Math.random() * 5000)}K</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* Recent Updates Section */}
        <section className="bg-gradient-to-br from-slate-50 to-white border-b py-8">
          <div className="w-full px-[4%]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Vừa cập nhật</h2>
                <p className="text-sm text-gray-600">Phiên bản mới nhất và cập nhật gần đây</p>
              </div>
            </div>

            {/* Horizontal Scroll */}
            <div className="horizontal-scroll -mx-[4%] px-[4%]">
              {(recentSoftware?.softwares || Array(10).fill(null)).map((software: any, index: number) => (
                <div
                  key={software?.id || index}
                  onClick={() => software && navigate(`/software/${software.id}`)}
                  className="scroll-snap-item bg-white rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 group cursor-pointer border border-gray-200 hover:border-[#004080] hover:scale-105 flex flex-col h-full"
                  title={software?.name ? `Xem chi tiết ${software.name}` : undefined}
                >
                  <div className="relative h-32 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    {software?.image_url ? (
                      <img
                        src={software.image_url}
                        alt={software.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const placeholder = e.currentTarget.nextElementSibling;
                          if (placeholder) {
                            (placeholder as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${software ? getGradientColors(software.name) : 'from-gray-300 to-gray-400'} flex items-center justify-center transition-all duration-300`}
                      style={{ display: software?.image_url ? 'none' : 'flex' }}
                    >
                      <div className="text-center">
                        <div className="text-4xl font-bold text-white opacity-90 mb-1">
                          {software?.name ? software.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <Monitor className="h-8 w-8 text-white opacity-75 mx-auto" />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                      NEW
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1">
                      {software?.name || "Loading..."}
                    </h3>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-500">Software</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-current" />
                        <span className="font-semibold">4.5</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-semibold">Latest</span>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>Today</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                    <div key={rowIndex} className="grid-row">
                      {chunk.map((software: any, index: number) => (
                        <Card
                          key={software?.id || `${rowIndex}-${index}`}
                          onClick={() => software && navigate(`/software/${software.id}`)}
                          className="overflow-hidden border border-gray-200 rounded-xl hover:shadow-2xl hover:border-[#004080] transition-all duration-500 group cursor-pointer hover:scale-105 flex flex-col h-full"
                          title={software?.name ? `Xem chi tiết ${software.name}` : undefined}
                        >
                          <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                            {software?.image_url ? (
                              <img
                                src={software.image_url}
                                alt={software.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const placeholder = e.currentTarget.nextElementSibling;
                                  if (placeholder) {
                                    (placeholder as HTMLElement).style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              className={`absolute inset-0 bg-gradient-to-br ${software ? getGradientColors(software.name) : 'from-gray-300 to-gray-400'} flex items-center justify-center transition-all duration-300`}
                              style={{ display: software?.image_url ? 'none' : 'flex' }}
                            >
                              <div className="text-center">
                                <div className="text-5xl font-bold text-white opacity-90 mb-2">
                                  {software?.name ? software.name.charAt(0).toUpperCase() : '?'}
                                </div>
                                <Monitor className="h-10 w-10 text-white opacity-75 mx-auto" />
                              </div>
                            </div>
                            {software?.badge && (
                              <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                {software.badge}
                              </div>
                            )}
                          </div>
                          <div className="p-4 flex flex-col flex-grow">
                            <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-1">
                              {software?.name || "Đang tải..."}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
                              {software?.description ? getShortDescription(software.description, 100) : ""}
                            </p>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-amber-400 fill-current" />
                                <span className="text-sm font-semibold">4.5</span>
                                <span className="text-xs text-gray-500">(234)</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {Math.floor(Math.random() * 1000)}K tải
                              </span>
                            </div>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (software) {
                                  navigate(`/software/${software.id}`);
                                }
                              }}
                              className="w-full bg-[#004080] hover:bg-[#003366] text-white rounded-lg shadow-md transition-all cursor-pointer"
                              size="sm"
                              title={`Xem chi tiết ${software?.name || 'phần mềm'}`}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Tải ngay
                            </Button>
                          </div>
                        </Card>
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
