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
import { Grid, List, Loader2 } from "lucide-react";

export default function HomePage() {
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));
  const [softwareView, setSoftwareView] = useState<"grid" | "list">("grid");
  const [currentTab, setCurrentTab] = useState<string>("latest");
  const [selectedSoftware, setSelectedSoftware] = useState<Software | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [location, navigate] = useLocation();
  
  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchParams(params);
    
    // Set current tab based on URL
    const view = params.get("view");
    if (view) {
      setCurrentTab(view);
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
      limit: "12"
    };
    
    // Add search term if present
    const search = searchParams.get("search");
    if (search) {
      params.search = search;
    }
    
    // Add filter for current tab
    if (currentTab === "windows" || currentTab === "mac" || currentTab === "linux") {
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
  
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    setPage(1);
    
    // Update URL
    const newParams = new URLSearchParams(searchParams);
    newParams.set("view", tab);
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
  const itemsPerPage = 12;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8" id="software-section">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Browse Software</h2>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              {/* Category tabs */}
              <div className="flex space-x-1 rounded-lg p-1 bg-gray-100 overflow-x-auto whitespace-nowrap">
                <Button
                  variant="ghost"
                  onClick={() => handleTabChange("latest")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentTab === "latest" ? "bg-white shadow" : "hover:bg-gray-200"
                  }`}
                >
                  Latest
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleTabChange("popular")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentTab === "popular" ? "bg-white shadow" : "hover:bg-gray-200"
                  }`}
                >
                  Popular
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleTabChange("windows")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentTab === "windows" ? "bg-white shadow" : "hover:bg-gray-200"
                  }`}
                >
                  Windows
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleTabChange("mac")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentTab === "mac" ? "bg-white shadow" : "hover:bg-gray-200"
                  }`}
                >
                  Mac
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleTabChange("linux")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentTab === "linux" ? "bg-white shadow" : "hover:bg-gray-200"
                  }`}
                >
                  Linux
                </Button>
              </div>
              
              {/* View toggle */}
              <div className="flex items-center space-x-4">
                <div className="flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSoftwareView("grid")}
                    className={`p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      softwareView === "grid" ? "text-primary-600" : "text-gray-400 hover:text-gray-500"
                    }`}
                  >
                    <Grid className="h-5 w-5" />
                    <span className="sr-only">Grid view</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSoftwareView("list")}
                    className={`p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      softwareView === "list" ? "text-primary-600" : "text-gray-400 hover:text-gray-500"
                    }`}
                  >
                    <List className="h-5 w-5" />
                    <span className="sr-only">List view</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Software list/grid */}
          {isLoadingSoftware ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
            </div>
          ) : softwareError ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-red-600 mb-2">Error loading software</h3>
              <p className="text-gray-500">Please try again later.</p>
            </div>
          ) : (
            <>
              {softwareView === "grid" ? (
                <SoftwareGrid
                  softwares={softwareData?.softwares || []}
                  onSoftwareClick={handleSoftwareClick}
                />
              ) : (
                <SoftwareList
                  softwares={softwareData?.softwares || []}
                  onSoftwareClick={handleSoftwareClick}
                />
              )}
              
              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
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
