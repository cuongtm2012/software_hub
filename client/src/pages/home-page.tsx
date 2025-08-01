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
  Monitor,
  LayoutGrid,
  Users,
  TrendingUp,
  ArrowRight,
  Briefcase,
  Code,
  MessageSquare,
  Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StarRating } from "@/components/ui/star-rating";
import { cn } from "@/lib/utils";

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
  
  // Fetch categories from GitHub service
  const {
    data: categories,
    isLoading: isLoadingCategories
  } = useQuery({
    queryKey: ["/api/github/categories"],
    queryFn: async () => {
      const response = await fetch("/api/github/categories");
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
      const response = await fetch("/api/softwares/recent?limit=6");
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
      const response = await fetch("/api/softwares/popular?limit=6");
      if (!response.ok) {
        throw new Error("Failed to fetch popular software");
      }
      return response.json();
    }
  });

  // Fetch trending software
  const {
    data: trendingSoftware,
    isLoading: isLoadingTrending
  } = useQuery({
    queryKey: ["/api/softwares/trending"],
    queryFn: async () => {
      const response = await fetch("/api/softwares/trending?limit=6");
      if (!response.ok) {
        throw new Error("Failed to fetch trending software");
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

  // Category filter handler
  const handleCategoryFilter = (categoryName: string) => {
    setCurrentTab("all");
    setPage(1);
    
    // Update URL with category filter
    const newParams = new URLSearchParams(searchParams);
    if (categoryName === "All Software") {
      newParams.delete("category");
    } else {
      newParams.set("category", categoryName);
    }
    newParams.delete("page");
    navigate(`/?${newParams.toString()}`);
  };
  
  // Download handler for GitHub repositories
  const handleDownload = (software: any) => {
    if (software.downloadUrl) {
      // Open download URL in new tab
      window.open(software.downloadUrl, '_blank');
    }
  };

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
    const ratingValue = software.stars ? Math.min(software.stars / 1000, 5) : 0; // Convert stars to 5-star rating
    
    return (
      <Card className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
        <div className="relative group">
          {/* Image */}
          <div className="relative pb-[60%] bg-gray-100">
            {software.imageUrl ? (
              <img 
                src={software.imageUrl}
                alt={`${software.name} avatar`}
                className="absolute h-full w-full object-cover"
              />
            ) : (
              <div className="absolute h-full w-full flex items-center justify-center bg-gray-100">
                <Code className="h-12 w-12 text-gray-400" />
              </div>
            )}
            
            {/* Badge */}
            <div className="absolute top-0 left-0 mt-2 ml-2">
              {software.isFree && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-800">
                  FREE
                </span>
              )}
            </div>
            
            {/* Category badge */}
            <div className="absolute top-0 right-0 mt-2 mr-2">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                {software.category}
              </span>
            </div>
            
            {/* Ranking badge */}
            {ranking !== undefined && (
              <div className="absolute bottom-0 right-0 mb-2 mr-2 bg-gray-900/70 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                {ranking}
              </div>
            )}
            
            {/* Quick actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-white text-black hover:bg-gray-100"
                  onClick={() => window.open(software.projectUrl, '_blank')}
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-3">
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{software.name}</h3>
              <div className="flex items-center ml-2">
                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                <span className="text-xs text-gray-600">{software.stars.toLocaleString()}</span>
              </div>
            </div>
            
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">{software.description}</p>
            
            {showDetails && (
              <div className="mt-1 space-y-1">
                <div className="text-xs text-gray-500">Downloads: {software.downloads.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Language: {software.language}</div>
                <div className="text-xs text-gray-500">License: {software.license}</div>
              </div>
            )}
            
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-500">
                <span>v{software.version}</span>
              </div>
              
              <Button 
                size="sm" 
                variant="default"
                className="bg-[#004080] hover:bg-[#003366] text-white rounded-md text-xs px-3 py-1 h-auto"
                onClick={() => handleDownload(software)}
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
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Header />
      
      <main className="flex-grow pt-16">
        {/* Category filter bar */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#004080]">Categories</h2>
              <Button variant="link" className="text-[#004080] font-medium text-sm flex items-center">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-4">
              {[
                { icon: <LayoutGrid className="h-5 w-5" />, name: "All Software" },
                ...(categories || []).map((categoryName: string) => ({
                  icon: categoryName === "Utilities" ? <Monitor className="h-5 w-5" /> :
                        categoryName === "Media" ? <Download className="h-5 w-5" /> :
                        categoryName === "Communication" ? <MessageSquare className="h-5 w-5" /> :
                        categoryName === "Business" ? <Briefcase className="h-5 w-5" /> :
                        categoryName === "Games" ? <Star className="h-5 w-5" /> :
                        categoryName === "Development" ? <Code className="h-5 w-5" /> :
                        <Monitor className="h-5 w-5" />,
                  name: categoryName
                }))
              ].map((category, index) => {
                const currentCategory = searchParams.get("category");
                const isSelected = (index === 0 && !currentCategory) || category.name === currentCategory;
                
                return (
                  <Button 
                    key={index}
                    variant="outline" 
                    className={`flex items-center justify-center py-3 px-4 rounded-lg border border-gray-200 hover:border-[#ffcc00] hover:bg-white ${
                      isSelected ? 'bg-[#004080] text-white hover:bg-[#004080] hover:text-white' : 'bg-white text-gray-700'
                    }`}
                    onClick={() => handleCategoryFilter(category.name)}
                  >
                    <div className="flex flex-col items-center text-center">
                      <span className="mb-1">{category.icon}</span>
                      <span className="text-xs font-medium">{category.name}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* OS Filter and view options */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 mr-4">Latest Software</h2>
              
              {/* OS Filter Tabs */}
              <Tabs 
                value={currentTab} 
                onValueChange={handleTabChange}
                className="flex-grow-0"
              >
                <TabsList className="bg-gray-100 p-1 rounded-md">
                  <TabsTrigger value="all" className="text-xs px-3 py-1 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#004080] data-[state=active]:shadow-sm">All</TabsTrigger>
                  <TabsTrigger value="windows" className="text-xs px-3 py-1 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#004080] data-[state=active]:shadow-sm">Windows</TabsTrigger>
                  <TabsTrigger value="mac" className="text-xs px-3 py-1 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#004080] data-[state=active]:shadow-sm">Mac</TabsTrigger>
                  <TabsTrigger value="linux" className="text-xs px-3 py-1 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#004080] data-[state=active]:shadow-sm">Linux</TabsTrigger>
                  <TabsTrigger value="android" className="text-xs px-3 py-1 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#004080] data-[state=active]:shadow-sm">Android</TabsTrigger>
                  <TabsTrigger value="ios" className="text-xs px-3 py-1 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#004080] data-[state=active]:shadow-sm">iOS</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* View toggle */}
            <div className="flex items-center">
              <div className="text-sm text-gray-500 mr-4">
                View:
              </div>
              <div className="flex border border-gray-200 rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoftwareView("grid")}
                  className={`p-2 rounded-l-md ${
                    softwareView === "grid" ? "bg-[#004080] text-white" : "bg-white text-gray-700"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                  <span className="sr-only">Grid view</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoftwareView("list")}
                  className={`p-2 rounded-r-md ${
                    softwareView === "list" ? "bg-[#004080] text-white" : "bg-white text-gray-700"
                  }`}
                >
                  <List className="h-4 w-4" />
                  <span className="sr-only">List view</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Software Grid */}
          <div>
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
                <div className="text-sm text-gray-500 mb-4">
                  Showing {softwareData?.softwares?.length || 0} of {softwareData?.total || 0} results
                </div>
                
                {softwareView === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {(softwareData?.softwares || []).map((software: any, index: number) => (
                      <Card key={software.id + "-" + index} className="overflow-hidden border border-gray-200 rounded-lg hover:shadow-md transition-shadow flex flex-col h-full">
                        <div className="relative pt-[60%] bg-gray-50">
                          {software.imageUrl ? (
                            <img 
                              src={software.imageUrl}
                              alt={`${software.name} screenshot`}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                              <Monitor className="h-12 w-12 text-gray-300" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2">
                            {software.isFree ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                FREE
                              </span>
                            ) : software.trialVersion ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                TRIAL
                              </span>
                            ) : null}
                          </div>
                        </div>
                        
                        <div className="p-3 flex-grow flex flex-col">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{software.name}</h3>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 mr-0.5" />
                              <span className="text-xs text-gray-600">{software.stars?.toLocaleString() || 0}</span>
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2 flex-grow">{software.description}</p>
                          
                          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                            <span className="text-xs text-gray-500">v{software.version}</span>
                            <Button 
                              size="sm"
                              className="h-7 px-2 py-0 bg-[#004080] hover:bg-[#003366] text-white text-xs rounded"
                              onClick={() => handleDownload(software)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(softwareData?.softwares || []).map((software: any, index: number) => (
                      <div key={software.id + "-" + index} className="flex gap-4 p-3 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0 w-20 h-20 relative bg-gray-50 rounded overflow-hidden">
                          {software.imageUrl ? (
                            <img 
                              src={software.imageUrl}
                              alt={`${software.name} screenshot`}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                              <Monitor className="h-8 w-8 text-gray-300" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-grow min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <h3 className="text-base font-semibold text-gray-900">{software.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                  <span className="ml-1 text-xs text-gray-600">{software.stars?.toLocaleString() || 0}</span>
                                </div>
                                {software.isFree ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                    FREE
                                  </span>
                                ) : software.trialVersion ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                    TRIAL
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">v{software.version}</span>
                          </div>
                          <p className="text-sm text-gray-500 mb-2 line-clamp-2">{software.description}</p>
                        </div>
                        
                        <div className="flex-shrink-0 self-center">
                          <Button 
                            className="px-4 py-2 bg-[#004080] hover:bg-[#003366] text-white rounded"
                            onClick={() => handleDownload(software)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
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
          
          {/* IT Services & Project Development Section */}
          <div className="mt-16 mb-16">
            <div className="bg-gradient-to-r from-[#004080] to-[#002b57] rounded-xl overflow-hidden">
              <div className="px-6 py-10 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Need Custom Software Development?</h2>
                  <p className="text-gray-200 mb-6">Connect with expert developers to build your custom software solution. Post your project, receive quotes, and collaborate directly through our secure platform.</p>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-white/20 p-2 rounded-full mr-3">
                        <Briefcase className="h-5 w-5 text-[#ffcc00]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Project Management</h3>
                        <p className="text-sm text-gray-200">Submit detailed project requests and manage development milestones</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-white/20 p-2 rounded-full mr-3">
                        <Code className="h-5 w-5 text-[#ffcc00]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Custom Development</h3>
                        <p className="text-sm text-gray-200">Get software built exactly to your requirements by skilled developers</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-white/20 p-2 rounded-full mr-3">
                        <Users className="h-5 w-5 text-[#ffcc00]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Secure Collaboration</h3>
                        <p className="text-sm text-gray-200">Communicate directly through our platform with integrated payments</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Button 
                      className="bg-[#ffcc00] hover:bg-[#e6b800] text-[#004080] font-medium py-2 px-6"
                      onClick={() => navigate('/request-project')}
                    >
                      Post a Project
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-[#004080] bg-white text-[#004080] hover:bg-blue-50"
                      onClick={() => navigate('/it-services#projects')}
                    >
                      Browse Portfolios
                    </Button>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="relative">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#ffcc00]/20 rounded-full blur-3xl"></div>
                    <div className="relative bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-white font-medium">Project Request</h3>
                          <p className="text-sm text-gray-200">Find the perfect developer</p>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm rounded-md p-4 mb-4">
                        <h4 className="text-[#ffcc00] font-medium mb-2">E-commerce Website Development</h4>
                        <p className="text-sm text-gray-200 mb-3">Need a modern e-commerce platform with payment processing and inventory management.</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-300 mr-1" />
                            <span className="text-xs text-gray-300">30 day deadline</span>
                          </div>
                          <div className="bg-[#004080] text-white text-xs px-2 py-1 rounded">
                            3 Quotes Received
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <Button variant="outline" className="bg-white/10 text-white border-white/20 justify-start">
                          <Monitor className="h-4 w-4 mr-2" />
                          View Active Projects
                        </Button>
                        <Button variant="outline" className="bg-white/10 text-white border-white/20 justify-start">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Developer Messages
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        
          {/* Popular Software Section */}
          <div className="mt-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Popular Software</h2>
              <Button variant="link" className="text-[#004080] font-medium text-sm flex items-center">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {(popularSoftware?.softwares || []).slice(0, 6).map((software: any, index: number) => (
                <Card key={software.id + "-" + index} className="overflow-hidden border border-gray-200 rounded-lg hover:shadow-md transition-shadow flex flex-col h-full">
                  <div className="relative pt-[60%] bg-gray-50">
                    {software.imageUrl ? (
                      <img 
                        src={software.imageUrl}
                        alt={`${software.name} screenshot`}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <Monitor className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      {software.isFree ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                          FREE
                        </span>
                      ) : software.trialVersion ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                          TRIAL
                        </span>
                      ) : null}
                    </div>
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#004080] text-white flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="p-3 flex-grow flex flex-col">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{software.name}</h3>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 mr-0.5" />
                        <span className="text-xs text-gray-600">{software.stars?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2 flex-grow">{software.description}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">{software.downloads?.toLocaleString() || 0} downloads</span>
                      <Button 
                        size="sm"
                        className="h-7 px-2 py-0 bg-[#004080] hover:bg-[#003366] text-white text-xs rounded"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Recently Updated Section */}
          <div className="mt-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recently Updated</h2>
              <Button variant="link" className="text-[#004080] font-medium text-sm flex items-center">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {(recentSoftware?.softwares || []).slice(0, 6).map((software: any, index: number) => (
                <Card key={software.id + "-" + index} className="overflow-hidden border border-gray-200 rounded-lg hover:shadow-md transition-shadow flex flex-col h-full">
                  <div className="relative pt-[60%] bg-gray-50">
                    {software.imageUrl ? (
                      <img 
                        src={software.imageUrl}
                        alt={`${software.name} screenshot`}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <Monitor className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      {software.isFree ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                          FREE
                        </span>
                      ) : software.trialVersion ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                          TRIAL
                        </span>
                      ) : null}
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                        Updated
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3 flex-grow flex flex-col">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{software.name}</h3>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 mr-0.5" />
                        <span className="text-xs text-gray-600">{software.stars?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2 flex-grow">{software.description}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">v{software.version}</span>
                      <Button 
                        size="sm"
                        className="h-7 px-2 py-0 bg-[#004080] hover:bg-[#003366] text-white text-xs rounded"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
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
