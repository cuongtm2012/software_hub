import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  SlidersHorizontal,
  Star,
  Download,
  ShoppingCart,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const categories = [
  { id: 'all', name: 'Tất cả sản phẩm', count: 1350 },
  { id: 'software', name: 'Phần mềm', count: 543 },
  { id: 'crypto', name: 'Crypto Tools', count: 258 },
  { id: 'marketing', name: 'Marketing Tools', count: 256 },
  { id: 'captcha', name: 'Captcha Solvers', count: 89 },
  { id: 'others', name: 'Khác', count: 204 },
];

export default function MarketplacePage() {
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch marketplace products
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

  const handleProductClick = (product: any) => {
    // Navigate to marketplace detail page
    navigate(`/marketplace/${product.id}`);
  };

  const handleCheckout = (product: any) => {
    // Navigate to marketplace checkout
    navigate('/marketplace/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-1 text-white">Digital Marketplace</h1>
            <p className="text-sm text-slate-200">Khám phá sản phẩm và dịch vụ số cao cấp</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20 border border-gray-100">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Bộ lọc</h3>

                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tìm kiếm</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm sản phẩm..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Danh mục:</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === category.id
                          ? 'bg-slate-700 text-white font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <span>{category.name}</span>
                        <span className={`text-xs ${selectedCategory === category.id ? 'text-slate-300' : 'text-gray-400'
                          }`}>
                          ({category.count})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Khoảng giá (VND)</h4>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
                    />
                  </div>
                  <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                    Xóa bộ lọc
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Thống kê</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng sản phẩm:</span>
                      <span className="font-semibold text-gray-900">6</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Người bán xác thực:</span>
                      <span className="font-semibold text-gray-900">6</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hiển thị:</span>
                      <span className="font-semibold text-gray-900">6</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {/* Sort Bar */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-100">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <SlidersHorizontal className="w-4 h-4" />
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
                  Hiển thị <span className="font-semibold">{products?.softwares?.length || 0}</span> trong <span className="font-semibold">1,350</span> sản phẩm
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
                {(products?.softwares || Array(10).fill(null)).map((product: any, index: number) => {
                  // Mock discount percentage
                  const discounts = [20, 25, 33, 20, 25, 33];
                  const discount = discounts[index % discounts.length];
                  const mockPrice = Math.floor(Math.random() * 5000000) + 500000;
                  const originalPrice = Math.floor(mockPrice / (1 - discount / 100));

                  return (
                    <div
                      key={product?.id || index}
                      className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all overflow-hidden group border border-gray-100 flex flex-col"
                    >
                      <div
                        onClick={() => product && handleProductClick(product)}
                        className="cursor-pointer flex-1 flex flex-col"
                      >
                        <div className="relative h-40 bg-gray-100 overflow-hidden flex-shrink-0">
                          {product?.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <ShoppingCart className="h-12 w-12 text-gray-300" />
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
                          <div className="flex items-center gap-1 mb-2 flex-wrap">
                            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                              Sản phẩm số
                            </span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              Tải ngay
                            </span>
                          </div>

                          <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2 leading-tight">
                            {product?.name || "Loading..."}
                          </h3>

                          <div className="text-xs text-gray-500 mb-2">
                            <span className="font-medium text-slate-700">Verified Seller</span>
                          </div>

                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-400 fill-current" />
                              <span className="font-semibold text-xs">4.{Math.floor(Math.random() * 3) + 6}</span>
                              <span className="text-gray-400 text-xs">({Math.floor(Math.random() * 1000) + 400})</span>
                            </div>
                          </div>

                          <div className="mb-2">
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm font-bold text-slate-700">
                                {mockPrice.toLocaleString('vi-VN')}₫
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 line-through">{originalPrice.toLocaleString('vi-VN')}₫</div>
                            <div className="text-xs text-gray-500">Còn: {Math.floor(Math.random() * 10) + 4} sp</div>
                          </div>
                        </div>
                      </div>

                      <div className="px-3 pb-3 mt-auto">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            product && handleCheckout(product);
                          }}
                          className="w-full bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold"
                          size="sm"
                        >
                          Mua ngay
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {[1, 2, 3, '...', 10].map((page, i) => (
                    <button
                      key={i}
                      onClick={() => typeof page === 'number' && setCurrentPage(page)}
                      disabled={page === '...'}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${page === currentPage
                        ? 'bg-slate-700 text-white'
                        : page === '...'
                          ? 'cursor-default'
                          : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === 10}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </main>

      <Footer />

    </div>
  );
}