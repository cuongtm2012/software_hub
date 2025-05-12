import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { Footer } from "@/components/footer";
import { SoftwareGrid } from "@/components/software-grid";
import { SoftwareList } from "@/components/software-list";
import { SoftwareDetailModal } from "@/components/software-detail-modal";
import { Pagination } from "@/components/pagination";
import { Software, Category } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  Grid, 
  List, 
  Loader2, 
  Clock, 
  ChevronRight, 
  Download, 
  Heart, 
  Star,
  Monitor
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StarRating } from "@/components/ui/star-rating";

export default function HomePage() {
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));
  const [softwareView, setSoftwareView] = useState<"grid" | "list">("grid");
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [selectedSoftware, setSelectedSoftware] = useState<Software | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [location, navigate] = useLocation();
  
  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchParams(params);
    
    // Set current tab based on URL
    const platform = params.get("platform");
    if (platform) {
      setCurrentTab(platform);
    } else {
      setCurrentTab("all");
    }
    
    // Set page based on URL
    const pageParam = params.get("page");
    if (pageParam) {
      setPage(parseInt(pageParam, 10));
    } else {
      setPage(1);
    }
    
    // Set view based on localStorage preference
    const savedView = localStorage.getItem("softwareView");
    if (savedView && (savedView === "grid" || savedView === "list")) {
      setSoftwareView(savedView);
    }
  }, [location]);
  
  // Save view preference
  useEffect(() => {
    localStorage.setItem("softwareView", softwareView);
  }, [softwareView]);
  
  // Get query parameters for fetching software
  const getQueryParams = () => {
    const params: Record<string, string> = {
      page: page.toString(),
      limit: "9"
    };
    
    // Add search term if present
    const search = searchParams.get("search");
    if (search) {
      params.search = search;
    }
    
    // Add filter for current tab
    if (currentTab !== "all") {
      params.platform = currentTab;
    }
    
    // Add category if present
    const category = searchParams.get("category");
    if (category) {
      params.category = category;
    }
    
    return params;
  };
  
  // Fetch software list
  const {
    data: softwareData,
    isLoading: isLoadingSoftware,
    error: softwareError
  } = useQuery({
    queryKey: ["/api/softwares", getQueryParams()],
    queryFn: async ({ queryKey }) => {
      const [_, params] = queryKey;
      const queryString = new URLSearchParams(params as Record<string, string>).toString();
      const response = await fetch(`/api/softwares?${queryString}`);
      if (!response.ok) {
        throw new Error("Failed to fetch software");
      }
      return response.json();
    }
  });
  
  // Fetch categories
  const {
    data: categories,
    isLoading: isLoadingCategories
  } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      return response.json();
    }
  });
  
  // Fetch recently updated software
  const {
    data: recentSoftware,
    isLoading: isLoadingRecent
  } = useQuery({
    queryKey: ["/api/softwares/recent"],
    queryFn: async () => {
      const response = await fetch("/api/softwares?limit=3&sort=updated_at");
      if (!response.ok) {
        throw new Error("Failed to fetch recent software");
      }
      return response.json();
    }
  });
  
  // Fetch popular software
  const {
    data: popularSoftware,
    isLoading: isLoadingPopular
  } = useQuery({
    queryKey: ["/api/softwares/popular"],
    queryFn: async () => {
      const response = await fetch("/api/softwares?limit=3&sort=downloads");
      if (!response.ok) {
        throw new Error("Failed to fetch popular software");
      }
      return response.json();
    }
  });
  
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    setPage(1);
    
    // Update URL
    const newParams = new URLSearchParams(searchParams);
    if (tab === "all") {
      newParams.delete("platform");
    } else {
      newParams.set("platform", tab);
    }
    newParams.delete("page");
    navigate(`/?${newParams.toString()}`);
  };
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    
    // Update URL
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    navigate(`/?${newParams.toString()}`);
  };
  
  const handleSoftwareClick = (software: Software) => {
    setSelectedSoftware(software);
    setModalOpen(true);
  };
  
  // Calculate total pages
  const totalItems = softwareData?.total || 0;
  const itemsPerPage = 9;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Sample software data for display (this should be replaced with real data from API)
  const sampleSoftware = [
    {
      id: 1,
      name: "Microsoft Excel",
      description: "Spreadsheet software for Windows",
      version: "2019",
      downloads: 25000,
      rating: 4.5,
      imageUrl: "https://placehold.co/250x150",
      platform: ["windows"],
      isFree: false,
      trialVersion: true
    },
    {
      id: 2,
      name: "VLC Media Player",
      description: "Free and open source cross-platform multimedia player",
      version: "3.0.18",
      downloads: 37500,
      rating: 4.8,
      imageUrl: "https://placehold.co/250x150",
      platform: ["windows", "mac", "linux"],
      isFree: true
    },
    {
      id: 3,
      name: "WinRAR",
      description: "File archiver utility for Windows",
      version: "6.11",
      downloads: 42000,
      rating: 4.6,
      imageUrl: "https://placehold.co/250x150",
      platform: ["windows"],
      isFree: false,
      trialVersion: true
    }
  ];
  
  // Software card component
  const SoftwareCard = ({ 
    software, 
    showDetails = false,
    ranking = undefined 
  }: { 
    software: any, 
    showDetails?: boolean,
    ranking?: number | undefined 
  }) => {
    return (
      <Card className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
        <div className="relative group">
          {/* Image */}
          <div className="relative pb-[60%] bg-gray-100">
            {software.imageUrl ? (
              <img 
                src={software.imageUrl}
                alt={`${software.name} screenshot`}
                className="absolute h-full w-full object-cover"
              />
            ) : (
              <div className="absolute h-full w-full flex items-center justify-center bg-gray-100">
                <Monitor className="h-12 w-12 text-gray-400" />
              </div>
            )}
            
            {/* Badge */}
            <div className="absolute top-0 left-0 mt-2 ml-2">
              {software.isFree ? (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-800">
                  FREE
                </span>
              ) : software.trialVersion ? (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-800">
                  TRIAL VERSION
                </span>
              ) : null}
            </div>
            
            {/* Ranking badge */}
            {ranking !== undefined && (
              <div className="absolute top-0 right-0 mt-2 mr-2 bg-gray-900/70 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                {ranking}
              </div>
            )}
            
            {/* Quick actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                <Button variant="default" size="sm" className="bg-white text-black hover:bg-gray-100">
                  View Details
                </Button>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-3">
            <div className="flex items-start justify-between">
              <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{software.name}</h3>
              {!showDetails && (
                <div className="flex items-center">
                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                  <span className="text-xs text-gray-600">{software.rating}</span>
                </div>
              )}
            </div>
            
            {showDetails && (
              <div className="flex items-center mt-1">
                <StarRating rating={software.rating} size="sm" />
                <span className="ml-1 text-xs text-gray-600">{software.rating}</span>
              </div>
            )}
            
            <p className="mt-1 text-xs text-gray-500 line-clamp-1">{software.description}</p>
            
            {showDetails && (
              <div className="mt-1 text-xs text-gray-500">Downloads: {software.downloads.toLocaleString()}</div>
            )}
            
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-500">
                <span>v{software.version}</span>
              </div>
              
              <Button 
                size="sm" 
                variant="default"
                className="bg-primary hover:bg-primary/90 text-white rounded-md text-xs px-3 py-1 h-auto"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        {/* Software for All Operating Systems Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="border-b border-gray-200 pb-4">
            <h1 className="text-xl font-bold text-gray-900">Software for All Operating Systems</h1>
            <p className="text-sm text-gray-500 mt-1">Browse our collection of software, apps, and games</p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 space-y-4 md:space-y-0">
            {/* OS Filter Tabs */}
            <Tabs 
              value={currentTab} 
              onValueChange={handleTabChange}
              className="w-full md:w-auto"
            >
              <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2">
                <TabsTrigger value="all" className="text-xs px-2">All</TabsTrigger>
                <TabsTrigger value="windows" className="text-xs px-2">Windows</TabsTrigger>
                <TabsTrigger value="mac" className="text-xs px-2">Mac</TabsTrigger>
                <TabsTrigger value="linux" className="text-xs px-2">Linux</TabsTrigger>
                <TabsTrigger value="android" className="text-xs px-2">Android</TabsTrigger>
                <TabsTrigger value="ios" className="text-xs px-2">iOS</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Filters & View Toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Button variant="outline" size="sm" className="text-xs py-1 h-8">
                  Filters
                </Button>
                
                <div className="flex border border-gray-200 rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSoftwareView("grid")}
                    className={`p-1 rounded-l-md h-8 ${
                      softwareView === "grid" ? "bg-gray-100" : ""
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                    <span className="sr-only">Grid view</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSoftwareView("list")}
                    className={`p-1 rounded-r-md h-8 ${
                      softwareView === "list" ? "bg-gray-100" : ""
                    }`}
                  >
                    <List className="h-4 w-4" />
                    <span className="sr-only">List view</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Software Grid */}
          <div className="mt-4">
            {isLoadingSoftware ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : softwareError ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-red-600 mb-2">Error loading software</h3>
                <p className="text-gray-500">Please try again later.</p>
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-500 mb-4">
                  Showing {softwareData?.softwares?.length || 0} of {softwareData?.total || 0} results
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Use real data when available, fallback to sample data */}
                  {(softwareData?.softwares?.length > 0 
                    ? softwareData.softwares 
                    : sampleSoftware).map((software: any) => (
                    <SoftwareCard
                      key={software.id}
                      software={software}
                    />
                  ))}
                </div>
                
                {/* Pagination */}
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className="mt-8"
                />
              </>
            )}
          </div>
        </div>
        
        {/* Discover Top Software Section */}
        <div className="bg-gray-900 text-white py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8 text-center">Discover Top Software</h2>
            <p className="text-center text-gray-400 mb-10 max-w-2xl mx-auto text-sm">
              Find the latest updated software and most popular downloads in our curated collection
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Recently Updated Section */}
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <h3 className="font-semibold">Recently Updated</h3>
                  </div>
                  <Button variant="link" size="sm" className="text-gray-400 hover:text-white p-0">
                    <span className="text-xs mr-1">Newest First</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="p-4 space-y-4">
                  {/* Recently updated items */}
                  {(recentSoftware?.softwares?.length > 0 
                    ? recentSoftware.softwares 
                    : sampleSoftware).slice(0, 3).map((software: any, index: number) => (
                    <div key={software.id} className="flex items-start space-x-4 pb-4 border-b border-gray-700 last:border-0 last:pb-0">
                      <div className="flex-shrink-0 w-10 h-10 rounded bg-gray-700 flex items-center justify-center">
                        {software.imageUrl ? (
                          <img 
                            src={software.imageUrl}
                            alt={software.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <Monitor className="h-6 w-6 text-gray-500" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center text-xs text-gray-400 mb-1">
                          <span className="bg-gray-700 px-1.5 py-0.5 rounded mr-2 text-[10px] uppercase font-medium">
                            {software.isFree ? "Free" : "Trial version"}
                          </span>
                          <span>1 day ago</span>
                        </div>
                        
                        <h4 className="text-sm font-medium text-white truncate">{software.name}</h4>
                        <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{software.description}</p>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <Button variant="default" size="sm" className="h-7 px-3 text-xs">
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="px-4 py-3 border-t border-gray-700">
                  <Button variant="link" size="sm" className="text-gray-400 hover:text-white w-full justify-center">
                    View All Recently Updated
                  </Button>
                </div>
              </div>
              
              {/* Top Downloads Section */}
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                  <div className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    <h3 className="font-semibold">Top Downloads</h3>
                  </div>
                  <Button variant="link" size="sm" className="text-gray-400 hover:text-white p-0">
                    <span className="text-xs mr-1">Most Downloads</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="p-4 space-y-4">
                  {/* Top download items */}
                  {(popularSoftware?.softwares?.length > 0 
                    ? popularSoftware.softwares 
                    : sampleSoftware).slice(0, 3).map((software: any, index: number) => (
                    <div key={software.id} className="flex items-start space-x-4 pb-4 border-b border-gray-700 last:border-0 last:pb-0">
                      <div className="flex-shrink-0 relative">
                        <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center">
                          {software.imageUrl ? (
                            <img 
                              src={software.imageUrl}
                              alt={software.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <Monitor className="h-6 w-6 text-gray-500" />
                          )}
                        </div>
                        <div className="absolute -top-2 -right-2 bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center text-xs space-x-1 mb-1">
                          <div className="flex items-center text-yellow-400">
                            <StarRating rating={software.rating} size="xs" />
                          </div>
                          <span className="text-gray-400">({software.rating})</span>
                        </div>
                        
                        <h4 className="text-sm font-medium text-white truncate">{software.name}</h4>
                        <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                          {software.downloads.toLocaleString()} downloads
                        </p>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <Button variant="default" size="sm" className="h-7 px-3 text-xs">
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="px-4 py-3 border-t border-gray-700">
                  <Button variant="link" size="sm" className="text-gray-400 hover:text-white w-full justify-center">
                    View All Top Downloads
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Software detail modal */}
      <SoftwareDetailModal
        software={selectedSoftware}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
