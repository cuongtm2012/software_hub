import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageHero } from "@/components/design-system/page-hero";
import {
  catalogGridClass,
  getPlaceholderGradient,
  pageContainerClass,
  pageMainClass,
  pageShellClass,
} from "@/components/design-system/tokens";
import {
  SoftwareProductCard,
  SoftwareProductCardSkeleton,
  type SoftwareProductCardData,
} from "@/components/software-product-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Star,
  Grid,
  List,
  Loader2,
  Search,
  Package,
  LayoutGrid,
  ChevronLeft,
} from "lucide-react";
import { Pagination } from "@/components/pagination";
import { cn } from "@/lib/utils";
import { PageMeta } from "@/components/seo/page-meta";
import { buildSoftwareDetailUrl, buildSoftwareListPath } from "@/lib/software-utils";
import { absoluteUrl } from "@/lib/seo-config";

const PLATFORMS = [
  { value: "all", label: "Tất cả nền tảng" },
  { value: "windows", label: "Windows" },
  { value: "mac", label: "macOS" },
  { value: "linux", label: "Linux" },
  { value: "android", label: "Android" },
  { value: "ios", label: "iOS" },
  { value: "web", label: "Web" },
];

const SORT_OPTIONS = [
  { value: "name", label: "Tên (A-Z)" },
  { value: "popular", label: "Phổ biến nhất" },
  { value: "recent", label: "Mới thêm" },
  { value: "rating", label: "Đánh giá cao" },
];

function stripMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/!\[[^\]]*\]\[[^\]]*\]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_>`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const GRID_CLASS = catalogGridClass;

interface SoftwareListCardProps {
  software: SoftwareProductCardData;
  onOpen: (software: SoftwareProductCardData) => void;
}

function SoftwareListCard({ software, onOpen }: SoftwareListCardProps) {
  const description = stripMarkdown(software.description || "");
  const gradient = getPlaceholderGradient(software.name);

  return (
      <article
        className="group flex gap-4 sm:gap-5 p-4 sm:p-5 rounded-xl border border-[#004080]/10 bg-white uupm-card uupm-interactive cursor-pointer"
        onClick={() => onOpen(software)}
      >
        <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden">
          {software.image_url ? (
            <img
              src={software.image_url}
              alt={software.name}
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : null}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br flex items-center justify-center",
              gradient,
            )}
            style={{ display: software.image_url ? "none" : "flex" }}
          >
            <span className="text-2xl font-bold text-white">
              {software.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
            <h3 className="text-base font-semibold text-slate-900 group-hover:text-[#004080] transition-colors">
              {software.name}
            </h3>
            <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 shrink-0">
              Miễn phí
            </Badge>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              4.5
            </span>
            {software.platform?.slice(0, 3).map((p) => (
              <Badge
                key={p}
                variant="outline"
                className="text-xs border-[#004080]/15 text-slate-600"
              >
                {p}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          size="sm"
          className="hidden sm:flex shrink-0 self-center bg-[#004080] hover:bg-[#003366]"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(software);
          }}
        >
          <Download className="h-4 w-4 mr-1.5" />
          Tải ngay
        </Button>
      </article>
  );
}

export default function SoftwareListPage() {
  const [location, navigate] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");

  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [platform, setPlatform] = useState(searchParams.get("platform") || "all");
  const [sort, setSort] = useState(searchParams.get("sort") || "name");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("software-filters-collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("software-filters-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (platform !== "all") params.set("platform", platform);
    if (sort !== "name") params.set("sort", sort);
    if (searchQuery) params.set("search", searchQuery);
    if (page !== 1) params.set("page", page.toString());

    const newUrl = `/software${params.toString() ? "?" + params.toString() : ""}`;
    window.history.replaceState({}, "", newUrl);
  }, [category, platform, sort, searchQuery, page]);

  const { data: categories } = useQuery({
    queryKey: ["/api/softwares/categories"],
    queryFn: async () => {
      const response = await fetch("/api/softwares/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  const {
    data: softwareData,
    isLoading: isLoadingSoftware,
    error: softwareError,
  } = useQuery({
    queryKey: ["/api/softwares", category, platform, sort, searchQuery, page, categories],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (category !== "all" && categories && Array.isArray(categories)) {
        const categoryObj = categories.find((c: { slug: string }) => c.slug === category);
        if (categoryObj) params.set("category", categoryObj.id.toString());
      }

      if (platform !== "all") params.set("platform", platform);
      if (searchQuery) params.set("search", searchQuery);
      params.set("page", page.toString());
      params.set("limit", "24");

      const response = await fetch(`/api/softwares?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch software");
      return response.json();
    },
  });

  const listReturnPath = buildSoftwareListPath({
    category,
    platform,
    sort,
    search: searchQuery,
    page,
  });

  const handleOpenSoftware = (software: SoftwareProductCardData) => {
    navigate(buildSoftwareDetailUrl(software, listReturnPath));
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === "category") setCategory(value);
    if (filterType === "platform") setPlatform(value);
    if (filterType === "sort") setSort(value);
    setPage(1);
  };

  const totalPages = Math.ceil((softwareData?.total || 0) / 24);

  const getCurrentCategoryName = () => {
    if (category === "all") return "Tất cả phần mềm";
    const categoryObj =
      categories && Array.isArray(categories)
        ? categories.find((c: { slug: string; name: string }) => c.slug === category)
        : null;
    return categoryObj ? categoryObj.name : "Tất cả phần mềm";
  };

  const selectClass =
    "w-full h-10 px-3 text-sm border border-[#004080]/15 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#004080]/30 uupm-focus";

  return (
    <div className={pageShellClass}>
      <PageMeta
        title="Kho phần mềm miễn phí — Windows, Mac, Linux"
        description="Tải và khám phá phần mềm, công cụ developer được tuyển chọn. Hướng dẫn cài đặt tiếng Việt cho Windows, macOS và Linux."
        canonicalUrl={absoluteUrl("/software")}
      />
      <Header />

      <main className={pageMainClass}>
        <PageHero
          title={getCurrentCategoryName()}
          subtitle={`Khám phá và tải về từ ${softwareData?.total?.toLocaleString("vi-VN") || "..."}+ phần mềm được tuyển chọn`}
          badge="Kho phần mềm"
        />

        <div className={cn(pageContainerClass, "py-6 sm:py-8")}>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar filters */}
            <aside
              className={cn(
                "shrink-0 transition-[width] duration-300 ease-in-out",
                sidebarCollapsed ? "w-full lg:w-14" : "w-full lg:w-64 xl:w-72",
              )}
            >
              <div
                className={cn(
                  "bg-white rounded-xl border border-[#004080]/10 sticky top-24 uupm-card transition-all duration-300",
                  sidebarCollapsed ? "p-2 lg:p-3" : "p-5 space-y-5",
                )}
              >
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed((c) => !c)}
                  className={cn(
                    "flex items-center text-[#004080] rounded-lg transition-colors uupm-focus",
                    sidebarCollapsed
                      ? "justify-center w-full p-2 hover:bg-[#004080]/8"
                      : "gap-2 w-full p-1 -m-1 hover:bg-[#004080]/5",
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
                  <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Tìm kiếm
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Tên phần mềm..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      className="w-full h-10 pl-9 pr-3 text-sm border border-[#004080]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080]/30 uupm-focus"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Danh mục
                  </label>
                  <select
                    value={category}
                    onChange={(e) => handleFilterChange("category", e.target.value)}
                    className={selectClass}
                  >
                    <option value="all">Tất cả danh mục</option>
                    {categories && Array.isArray(categories)
                      ? categories.map((cat: { id: number; slug: string; name: string; count: number }) => (
                          <option key={cat.id} value={cat.slug}>
                            {cat.name}
                            {cat.count > 0 ? ` (${cat.count.toLocaleString("vi-VN")})` : ""}
                          </option>
                        ))
                      : null}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nền tảng
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => handleFilterChange("platform", e.target.value)}
                    className={selectClass}
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Sắp xếp
                  </label>
                  <select
                    value={sort}
                    onChange={(e) => handleFilterChange("sort", e.target.value)}
                    className={selectClass}
                  >
                    {SORT_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Hiển thị
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setView("grid")}
                      className={cn(
                        "h-10 rounded-lg",
                        view === "grid"
                          ? "bg-[#004080] text-white hover:bg-[#003366] hover:text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                      )}
                    >
                      <Grid className="h-4 w-4 mr-1.5" />
                      Lưới
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setView("list")}
                      className={cn(
                        "h-10 rounded-lg",
                        view === "list"
                          ? "bg-[#004080] text-white hover:bg-[#003366] hover:text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                      )}
                    >
                      <List className="h-4 w-4 mr-1.5" />
                      Danh sách
                    </Button>
                  </div>
                </div>
                  </>
                )}
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1 min-w-0">
              {isLoadingSoftware ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-[#004080]" />
                    Đang tải phần mềm...
                  </div>
                  <div className={GRID_CLASS}>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <SoftwareProductCardSkeleton key={i} />
                    ))}
                  </div>
                </div>
              ) : softwareError ? (
                <EmptyState
                  icon={Package}
                  title="Không tải được dữ liệu"
                  description="Đã xảy ra lỗi khi tải danh sách phần mềm. Vui lòng thử lại sau."
                  actionLabel="Tải lại trang"
                  onAction={() => window.location.reload()}
                />
              ) : softwareData?.softwares?.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="Không tìm thấy phần mềm"
                  description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm khác."
                  actionLabel="Xóa bộ lọc"
                  onAction={() => {
                    setCategory("all");
                    setPlatform("all");
                    setSearchQuery("");
                    setPage(1);
                  }}
                />
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-5">
                    Hiển thị{" "}
                    <span className="font-semibold text-[#004080]">
                      {softwareData?.softwares?.length || 0}
                    </span>{" "}
                    /{" "}
                    <span className="font-semibold text-[#004080]">
                      {softwareData?.total || 0}
                    </span>{" "}
                    kết quả
                  </p>

                  {view === "grid" ? (
                    <div className={GRID_CLASS}>
                      {softwareData?.softwares?.map((software: SoftwareProductCardData) => (
                        <SoftwareProductCard
                          key={software.id}
                          software={software}
                          onOpen={handleOpenSoftware}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {softwareData?.softwares?.map((software: SoftwareProductCardData) => (
                        <SoftwareListCard
                          key={software.id}
                          software={software}
                          onOpen={handleOpenSoftware}
                        />
                      ))}
                    </div>
                  )}

                  {totalPages > 1 && (
                    <div className="mt-10">
                      <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        className="justify-center"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
