import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Monitor,
  Download,
  Star,
  Grid,
  List,
  Loader2,
  Filter,
  Search,
  ArrowUpDown,
  Package
} from "lucide-react";
import { Pagination } from "@/components/pagination";
import { SoftwareDetailModal } from "@/components/software-detail-modal";
import { StarRating } from "@/components/ui/star-rating";

export default function SoftwareListPage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');

  // State from URL parameters
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [platform, setPlatform] = useState(searchParams.get('platform') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'name');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [selectedSoftware, setSelectedSoftware] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (platform !== 'all') params.set('platform', platform);
    if (sort !== 'name') params.set('sort', sort);
    if (searchQuery) params.set('search', searchQuery);
    if (page !== 1) params.set('page', page.toString());

    const newUrl = `/software${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [category, platform, sort, searchQuery, page]);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["/api/softwares/categories"],
    queryFn: async () => {
      const response = await fetch("/api/softwares/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  // Fetch software with filters
  const { data: softwareData, isLoading: isLoadingSoftware, error: softwareError } = useQuery({
    queryKey: ["/api/softwares", category, platform, sort, searchQuery, page, categories],
    queryFn: async () => {
      const params = new URLSearchParams();

      // Add category filter
      if (category !== 'all' && categories && Array.isArray(categories)) {
        const categoryObj = categories.find((c: any) => c.name.toLowerCase() === category.toLowerCase());
        if (categoryObj) {
          params.set('category', categoryObj.id.toString());
        }
      }

      // Add filters
      if (platform !== 'all') params.set('platform', platform);
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', page.toString());
      params.set('limit', '24');

      const response = await fetch(`/api/softwares?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch software");
      return response.json();
    },
  });

  const handleSoftwareClick = (software: any) => {
    setSelectedSoftware(software);
    setIsModalOpen(true);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'category') setCategory(value);
    if (filterType === 'platform') setPlatform(value);
    if (filterType === 'sort') setSort(value);
    setPage(1); // Reset to first page when filters change
  };

  const totalPages = Math.ceil((softwareData?.total || 0) / 24);

  // Get current category name for display
  const getCurrentCategoryName = () => {
    if (category === 'all') return 'All Software';
    const categoryObj = categories && Array.isArray(categories) ? categories.find((c: any) => c.name.toLowerCase() === category.toLowerCase()) : null;
    return categoryObj ? categoryObj.name : category;
  };

  // Generate consistent gradient color based on software name
  const getGradientColors = (name: string) => {
    const gradients = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600',
      'from-indigo-400 to-indigo-600',
      'from-teal-400 to-teal-600',
      'from-orange-400 to-orange-600',
      'from-cyan-400 to-cyan-600',
    ];

    const charCode = name.charCodeAt(0);
    const index = charCode % gradients.length;
    return gradients[index];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white shadow-xl">
          <div className="w-full px-[4%] py-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                <Package className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">{getCurrentCategoryName()}</h1>
                <p className="mt-2 text-slate-200">Discover and download from {softwareData?.total || 0}+ curated software</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full px-[4%] py-8">
          {/* Compact Single-Row Filters */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search Bar - Flexible width */}
              <div className="relative flex-grow min-w-[280px] max-w-[400px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search software..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-[38px] pl-10 pr-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent transition-all"
                />
              </div>

              {/* Category Filter - Compact */}
              <select
                value={category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="h-[38px] px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent transition-all min-w-[140px]"
              >
                <option value="all">All Categories</option>
                {categories && Array.isArray(categories) ? categories.map((cat: any) => (
                  <option key={cat.id} value={cat.name.toLowerCase()}>{cat.name}</option>
                )) : null}
              </select>

              {/* Platform Filter - Compact */}
              <select
                value={platform}
                onChange={(e) => handleFilterChange('platform', e.target.value)}
                className="h-[38px] px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent transition-all min-w-[130px]"
              >
                <option value="all">All Platforms</option>
                <option value="windows">Windows</option>
                <option value="mac">Mac</option>
                <option value="linux">Linux</option>
                <option value="android">Android</option>
                <option value="ios">iOS</option>
                <option value="web">Web</option>
              </select>

              {/* Sort By - Compact */}
              <select
                value={sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="h-[38px] px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent transition-all min-w-[130px]"
              >
                <option value="name">Name (A-Z)</option>
                <option value="popular">Most Popular</option>
                <option value="recent">Recently Added</option>
                <option value="rating">Highest Rated</option>
              </select>

              {/* View Toggle - Pushed to right */}
              <div className="flex gap-2 ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView("grid")}
                  className={`h-[38px] w-[38px] p-0 rounded-lg transition-all ${view === "grid"
                    ? "bg-[#004080] text-white hover:bg-[#003366]"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView("list")}
                  className={`h-[38px] w-[38px] p-0 rounded-lg transition-all ${view === "list"
                    ? "bg-[#004080] text-white hover:bg-[#003366]"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          {isLoadingSoftware ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-16 w-16 animate-spin text-[#004080] mb-4" />
              <p className="text-gray-600">Loading software...</p>
            </div>
          ) : softwareError ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-md">
              <div className="p-4 bg-red-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-red-600 mb-2">Error loading software</h3>
              <p className="text-gray-500">Please try again later.</p>
            </div>
          ) : (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm font-medium text-gray-700">
                  Showing <span className="text-[#004080] font-bold">{softwareData?.softwares?.length || 0}</span> of <span className="text-[#004080] font-bold">{softwareData?.total || 0}</span> results
                </div>
              </div>

              {view === "grid" ? (
                <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                  {softwareData?.softwares?.map((software: any) => (
                    <Card key={software.id} className="group overflow-hidden border border-gray-200 rounded-xl hover:shadow-2xl hover:border-[#004080] transition-all duration-300 flex flex-col h-full bg-white">
                      <div
                        className="relative pt-[60%] cursor-pointer overflow-hidden"
                        onClick={() => handleSoftwareClick(software)}
                      >
                        {software.image_url ? (
                          <img
                            src={software.image_url}
                            alt={`${software.name} screenshot`}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              // Hide broken image and show placeholder instead
                              e.currentTarget.style.display = 'none';
                              const placeholder = e.currentTarget.nextElementSibling;
                              if (placeholder) {
                                (placeholder as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${getGradientColors(software.name)} flex items-center justify-center transition-all duration-300`}
                          style={{ display: software.image_url ? 'none' : 'flex' }}
                        >
                          <div className="text-center">
                            <div className="text-6xl font-bold text-white mb-2 opacity-90">
                              {software.name.charAt(0).toUpperCase()}
                            </div>
                            <Monitor className="h-8 w-8 text-white/70 mx-auto" />
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-green-500 text-white text-xs font-semibold px-2 py-1 shadow-md">FREE</Badge>
                        </div>
                      </div>

                      <div className="p-4 flex-grow flex flex-col">
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-2 group-hover:text-[#004080] transition-colors">{software.name}</h3>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2 flex-grow leading-relaxed">{software.description}</p>

                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-semibold text-gray-700">4.5</span>
                          </div>
                          <Button
                            size="sm"
                            className="h-8 px-3 py-0 bg-[#004080] hover:bg-[#003366] text-white text-xs rounded-lg shadow-md hover:shadow-lg transition-all"
                            asChild
                          >
                            <a href={software.download_link} target="_blank" rel="noopener noreferrer">
                              <Download className="h-3.5 w-3.5 mr-1.5" />
                              Get
                            </a>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {softwareData?.softwares?.map((software: any) => (
                    <div key={software.id} className="group flex gap-6 p-6 border border-gray-200 rounded-xl bg-white hover:shadow-xl hover:border-[#004080] transition-all duration-300">
                      <div
                        className="flex-shrink-0 w-24 h-24 relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden cursor-pointer"
                        onClick={() => handleSoftwareClick(software)}
                      >
                        {software.image_url ? (
                          <img
                            src={software.image_url}
                            alt={`${software.name} screenshot`}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
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
                          className={`absolute inset-0 bg-gradient-to-br ${getGradientColors(software.name)} flex items-center justify-center transition-all duration-300`}
                          style={{ display: software.image_url ? 'none' : 'flex' }}
                        >
                          <div className="text-center">
                            <div className="text-3xl font-bold text-white opacity-90">
                              {software.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-grow min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-grow">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#004080] transition-colors">{software.name}</h3>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                <span className="text-sm font-semibold text-gray-700">4.5</span>
                              </div>
                              <Badge className="bg-green-500 text-white font-semibold">FREE</Badge>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{software.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {software.platform?.slice(0, 4).map((p: string) => (
                            <Badge key={p} variant="outline" className="text-xs font-medium border-gray-300">{p}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex-shrink-0 self-center">
                        <Button
                          className="px-6 py-3 bg-[#004080] hover:bg-[#003366] text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                          asChild
                        >
                          <a href={software.download_link} target="_blank" rel="noopener noreferrer">
                            <Download className="h-5 w-5 mr-2" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12">
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
      </main>

      <Footer />

      {/* Software Detail Modal */}
      <SoftwareDetailModal
        software={selectedSoftware}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}