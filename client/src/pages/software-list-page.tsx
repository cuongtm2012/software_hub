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
  Eye, 
  Grid, 
  List, 
  Loader2,
  Filter,
  Search,
  ArrowUpDown
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
    if (page !== 1) params.set('page', page.toString());
    
    const newUrl = `/software${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [category, platform, sort, page]);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Fetch software with filters
  const { data: softwareData, isLoading: isLoadingSoftware, error: softwareError } = useQuery({
    queryKey: ["/api/softwares", category, platform, sort, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category !== 'all') {
        // Find category by name and use its ID
        const categoryObj = categories && Array.isArray(categories) ? categories.find((c: any) => c.name.toLowerCase() === category.toLowerCase()) : null;
        if (categoryObj) {
          params.set('categoryId', categoryObj.id.toString());
        }
      }
      if (platform !== 'all') params.set('platform', platform);
      params.set('sort', sort);
      params.set('page', page.toString());
      params.set('limit', '24');
      
      const response = await fetch(`/api/softwares?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch software");
      return response.json();
    },
    enabled: !!categories, // Only run when categories are loaded
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow pt-16">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">{getCurrentCategoryName()}</h1>
            <p className="mt-2 text-gray-600">Browse and download software from our extensive catalog</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-[#004080]"
                >
                  <option value="all">All Categories</option>
                  {categories && Array.isArray(categories) ? categories.map((cat: any) => (
                    <option key={cat.id} value={cat.name.toLowerCase()}>{cat.name}</option>
                  )) : null}
                </select>
              </div>

              {/* Platform Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                <select 
                  value={platform} 
                  onChange={(e) => handleFilterChange('platform', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-[#004080]"
                >
                  <option value="all">All Platforms</option>
                  <option value="windows">Windows</option>
                  <option value="mac">Mac</option>
                  <option value="linux">Linux</option>
                  <option value="android">Android</option>
                  <option value="ios">iOS</option>
                  <option value="web">Web</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select 
                  value={sort} 
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-[#004080]"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="popular">Most Popular</option>
                  <option value="recent">Recently Added</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* View Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
                <div className="flex border border-gray-300 rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setView("grid")}
                    className={`px-3 py-2 rounded-l-md border-r ${
                      view === "grid" ? "bg-[#004080] text-white" : "bg-white text-gray-700"
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setView("list")}
                    className={`px-3 py-2 rounded-r-md ${
                      view === "list" ? "bg-[#004080] text-white" : "bg-white text-gray-700"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          {isLoadingSoftware ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-[#004080]" />
            </div>
          ) : softwareError ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-red-600 mb-2">Error loading software</h3>
              <p className="text-gray-500">Please try again later.</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-500 mb-6">
                Showing {softwareData?.softwares?.length || 0} of {softwareData?.total || 0} results
              </div>

              {view === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {softwareData?.softwares?.map((software: any) => (
                    <Card key={software.id} className="overflow-hidden border border-gray-200 rounded-lg hover:shadow-lg transition-shadow flex flex-col h-full">
                      <div 
                        className="relative pt-[60%] bg-gray-50 cursor-pointer group overflow-hidden rounded-t-lg"
                        onClick={() => handleSoftwareClick(software)}
                      >
                        {software.image_url ? (
                          <img 
                            src={software.image_url}
                            alt={`${software.name} screenshot`}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 transition-colors group-hover:bg-gray-200">
                            <Monitor className="h-12 w-12 text-gray-300 transition-colors group-hover:text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-2">
                            <Eye className="h-5 w-5 text-gray-700" />
                          </div>
                        </div>
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-green-100 text-green-800 text-xs">FREE</Badge>
                        </div>
                      </div>
                      
                      <div className="p-4 flex-grow flex flex-col">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1">{software.name}</h3>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2 flex-grow">{software.description}</p>
                        
                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-500 mr-0.5" />
                            <span className="text-xs text-gray-600">4.5</span>
                          </div>
                          <Button 
                            size="sm"
                            className="h-7 px-2 py-0 bg-[#004080] hover:bg-[#003366] text-white text-xs rounded"
                            asChild
                          >
                            <a href={software.download_link} target="_blank" rel="noopener noreferrer">
                              <Download className="h-3 w-3 mr-1" />
                              Download
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
                    <div key={software.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
                      <div 
                        className="flex-shrink-0 w-20 h-20 relative bg-gray-50 rounded overflow-hidden cursor-pointer group"
                        onClick={() => handleSoftwareClick(software)}
                      >
                        {software.image_url ? (
                          <img 
                            src={software.image_url}
                            alt={`${software.name} screenshot`}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 transition-colors group-hover:bg-gray-200">
                            <Monitor className="h-8 w-8 text-gray-300 transition-colors group-hover:text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{software.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <StarRating value={4.5} size="sm" />
                              <span className="text-sm text-gray-600">4.5</span>
                              <Badge className="bg-green-100 text-green-800">FREE</Badge>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{software.description}</p>
                        <div className="flex items-center gap-2">
                          {software.platform?.slice(0, 3).map((p: string) => (
                            <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 self-center">
                        <Button 
                          className="px-4 py-2 bg-[#004080] hover:bg-[#003366] text-white rounded"
                          asChild
                        >
                          <a href={software.download_link} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
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
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  className="mt-8"
                />
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