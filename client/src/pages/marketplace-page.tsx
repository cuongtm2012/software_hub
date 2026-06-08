import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  SlidersHorizontal,
  Star,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageHero } from "@/components/design-system/page-hero";
import { getPlaceholderGradient } from "@/components/design-system/tokens";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

function getDisplayPrice(productId: number): number {
  return ((productId * 2654435761) % 4500000) + 500000;
}

const categories = [
  { id: 'all', name: 'Tất cả sản phẩm', count: 1350 },
  { id: 'software', name: 'Phần mềm', count: 543 },
  { id: 'crypto', name: 'Crypto Tools', count: 258 },
  { id: 'marketing', name: 'Marketing Tools', count: 256 },
  { id: 'captcha', name: 'Captcha Solvers', count: 89 },
  { id: 'others', name: 'Khác', count: 204 },
];

function MarketplaceFilters({
  className,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  priceRange,
  onPriceRangeChange,
  onClear,
}: {
  className?: string;
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  priceRange: { min: string; max: string };
  onPriceRangeChange: (range: { min: string; max: string }) => void;
  onClear: () => void;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Tìm kiếm</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm sản phẩm..."
            className="w-full pl-10 pr-4 py-2 border border-[#004080]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080]/40 focus:border-transparent uupm-focus"
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Danh mục</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                selectedCategory === category.id
                  ? "bg-[#004080] text-white font-medium"
                  : "text-gray-700 hover:bg-[#004080]/5",
              )}
            >
              <span>{category.name}</span>
              <span
                className={cn(
                  "text-xs",
                  selectedCategory === category.id ? "text-slate-300" : "text-gray-400",
                )}
              >
                ({category.count})
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Khoảng giá (VND)</h4>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Tối thiểu"
            value={priceRange.min}
            onChange={(e) => onPriceRangeChange({ ...priceRange, min: e.target.value })}
            className="w-full px-3 py-2 border border-[#004080]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080]/30 text-sm uupm-focus"
          />
          <input
            type="text"
            inputMode="numeric"
            placeholder="Tối đa"
            value={priceRange.max}
            onChange={(e) => onPriceRangeChange({ ...priceRange, max: e.target.value })}
            className="w-full px-3 py-2 border border-[#004080]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080]/30 text-sm uupm-focus"
          />
        </div>
        <button
          type="button"
          onClick={onClear}
          className="w-full px-4 py-2 bg-[#004080]/8 hover:bg-[#004080]/12 text-[#004080] rounded-lg text-sm font-medium transition-colors"
        >
          Xóa bộ lọc
        </button>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const [, navigate] = useLocation();
  const { addToCart, closeCart } = useCart();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const clearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setPriceRange({ min: "", max: "" });
    setCurrentPage(1);
  };

  const handleCategoryChange = (id: string) => {
    setSelectedCategory(id);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/marketplace", selectedCategory, searchQuery, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      params.append('sort', sortBy);
      params.append('limit', '10');

      const response = await fetch(`/api/softwares?${params}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    }
  });

  const handleProductClick = (product: { id: number; slug?: string }) => {
    navigate(`/software/${product.slug || product.id}`);
  };

  const handleBuyNow = (product: { id: number; name: string; image_url?: string }, price: number) => {
    addToCart(
      {
        id: String(product.id),
        name: product.name,
        price,
        images: product.image_url ? [product.image_url] : [],
      },
      "standard",
    );
    closeCart();
    toast({
      title: "Đang chuyển đến thanh toán",
      description: product.name,
      duration: 2000,
    });
    navigate("/marketplace/checkout");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Header />

      <main className="flex-grow">
        <PageHero
          title="Marketplace phần mềm"
          subtitle="Khám phá sản phẩm số, công cụ và giải pháp từ seller uy tín"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="hidden lg:block lg:w-72 shrink-0">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 border border-[#004080]/10 uupm-card">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Bộ lọc</h3>
                <MarketplaceFilters
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  priceRange={priceRange}
                  onPriceRangeChange={setPriceRange}
                  onClear={clearFilters}
                />
              </div>
            </aside>

            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetContent side="left" className="w-full sm:max-w-sm overflow-y-auto">
                <SheetHeader className="mb-6 text-left">
                  <SheetTitle>Bộ lọc</SheetTitle>
                </SheetHeader>
                <MarketplaceFilters
                  selectedCategory={selectedCategory}
                  onCategoryChange={(id) => {
                    handleCategoryChange(id);
                  }}
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  priceRange={priceRange}
                  onPriceRangeChange={setPriceRange}
                  onClear={() => {
                    clearFilters();
                    setFiltersOpen(false);
                  }}
                />
              </SheetContent>
            </Sheet>

            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-100">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 border border-[#004080]/20 rounded-lg hover:bg-[#004080]/5 transition-colors uupm-focus"
                    aria-expanded={filtersOpen}
                    aria-controls="marketplace-filters"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-[#004080]" />
                    <span className="text-sm font-medium">Bộ lọc</span>
                  </button>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
                  >
                    <option value="popular">Phổ biến</option>
                    <option value="price-asc">Giá: Thấp đến cao</option>
                    <option value="price-desc">Giá: Cao đến thấp</option>
                    <option value="newest">Mới nhất</option>
                    <option value="rating">Đánh giá cao nhất</option>
                  </select>
                </div>
                <div className="text-sm text-gray-600">
                  {isLoading ? "Đang tải..." : (
                    <>Hiển thị <span className="font-semibold">{products?.softwares?.length || 0}</span> sản phẩm</>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
                {(products?.softwares || []).map((product: any, index: number) => {
                  const discount = [20, 25, 33, 20, 25, 33][index % 6];
                  const mockPrice = getDisplayPrice(product.id);
                  const originalPrice = Math.floor(mockPrice / (1 - discount / 100));

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg shadow-sm uupm-card uupm-interactive overflow-hidden group border border-[#004080]/10 flex flex-col"
                    >
                      <div
                        onClick={() => handleProductClick(product)}
                        className="cursor-pointer flex-1 flex flex-col"
                      >
                        <div className="relative h-40 bg-gray-100 overflow-hidden flex-shrink-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getPlaceholderGradient(product.name)}`}>
                              <span className="text-3xl font-bold text-white/90">
                                {product.name?.charAt(0)?.toUpperCase() ?? "?"}
                              </span>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                            -{discount}%
                          </div>
                          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-xs">
                            <TrendingUp className="w-3 h-3" />
                            {Math.floor(Math.random() * 2000) + 1000}
                          </div>
                        </div>

                        <div className="p-3 flex flex-col flex-1">
                          <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2 leading-tight">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="w-3 h-3 text-amber-400 fill-current" />
                            <span className="font-semibold text-xs">4.{Math.floor(Math.random() * 3) + 6}</span>
                          </div>
                          <div className="text-sm font-bold text-slate-700">
                            {mockPrice.toLocaleString('vi-VN')}₫
                          </div>
                          <div className="text-xs text-gray-400 line-through">{originalPrice.toLocaleString('vi-VN')}₫</div>
                        </div>
                      </div>

                      <div className="px-3 pb-3 mt-auto">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuyNow(product, mockPrice);
                          }}
                          className="w-full bg-[#004080] hover:bg-[#003366] text-white text-sm font-semibold"
                          size="sm"
                        >
                          Mua ngay
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-600">Trang {currentPage}</span>
                  <button
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
