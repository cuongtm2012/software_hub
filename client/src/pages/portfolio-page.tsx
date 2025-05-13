import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StarRating } from "@/components/ui/star-rating";
import {
  PlusCircle,
  Star,
  Code,
  Link as LinkIcon,
  ExternalLink,
  Trash2,
  Pencil,
  Loader2,
  User,
  Briefcase,
} from "lucide-react";

export default function PortfolioPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const limit = 12;
  
  // Developer portfolios query
  const { 
    data: portfolios, 
    isLoading: isLoadingPortfolios,
    error: portfoliosError 
  } = useQuery({
    queryKey: ['/api/portfolios/developer', user?.id],
    queryFn: undefined,
    enabled: !!user && user.role === 'developer',
  });
  
  // Delete portfolio mutation
  const deletePortfolioMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/portfolios/${id}`, {});
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete portfolio");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Portfolio deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolios/developer', user?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete portfolio",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  // Get portfolio image thumbnail
  const getPortfolioThumbnail = (portfolio: any) => {
    if (portfolio.images && portfolio.images.length > 0) {
      return portfolio.images[0];
    }
    return null;
  };
  
  // Average rating calculation
  const getAverageRating = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };
  
  // Format technologies list
  const formatTechnologies = (technologies: string[]) => {
    if (!technologies || technologies.length === 0) return "Not specified";
    return technologies.join(", ");
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Header />
      
      <main className="flex-grow container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Portfolio</h1>
            <p className="text-gray-500 mt-1">
              Showcase your skills and past projects to potential clients
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/portfolios/new')}
            className="bg-[#004080] hover:bg-[#003366] text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Project
          </Button>
        </div>
        
        {/* Developer profile card */}
        <Card className="bg-white shadow-sm mb-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-[#004080] flex items-center justify-center text-white">
                <User className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-xl">{user?.name}</CardTitle>
                <p className="text-gray-500 text-sm">Software Developer</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <p className="text-sm text-gray-700 mb-4">
              Your developer profile and portfolio are visible to potential clients. Make sure to showcase your best work!
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <Briefcase className="mr-1 h-3.5 w-3.5" />
                {portfolios?.length || 0} Projects
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Star className="mr-1 h-3.5 w-3.5 text-yellow-500" />
                Developer Rating: {user?.rating || "N/A"}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Portfolio list */}
        {isLoadingPortfolios ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
          </div>
        ) : portfoliosError ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
            <p className="text-red-800">Error loading portfolios. Please try again later.</p>
          </div>
        ) : portfolios?.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
            <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolio projects yet</h3>
            <p className="text-gray-500 mb-4 max-w-md mx-auto">
              Showcase your skills by adding projects to your portfolio.
            </p>
            <Button 
              onClick={() => navigate('/portfolios/new')}
              className="bg-[#004080] hover:bg-[#003366] text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your First Project
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((portfolio: any) => (
                <Card key={portfolio.id} className="bg-white hover:shadow-md transition-shadow">
                  <div className="relative pt-[60%] bg-gray-100">
                    {getPortfolioThumbnail(portfolio) ? (
                      <img 
                        src={getPortfolioThumbnail(portfolio)}
                        alt={portfolio.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Code className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{portfolio.title}</CardTitle>
                    <div className="flex items-center mt-1">
                      <StarRating rating={getAverageRating(portfolio.reviews)} size="sm" />
                      <span className="text-sm text-gray-500 ml-2">
                        ({portfolio.reviews?.length || 0} {portfolio.reviews?.length === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-sm text-gray-700 line-clamp-3">{portfolio.description}</p>
                    <div className="mt-3">
                      <h4 className="text-xs font-medium text-gray-500 mb-1">Technologies:</h4>
                      <p className="text-xs text-gray-700">{formatTechnologies(portfolio.technologies)}</p>
                    </div>
                    {portfolio.demo_link && (
                      <div className="mt-2">
                        <a 
                          href={portfolio.demo_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#004080] hover:text-[#003366] flex items-center"
                        >
                          <LinkIcon className="h-3 w-3 mr-1" />
                          Demo Link
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => navigate(`/portfolios/${portfolio.id}`)}
                    >
                      View Details
                    </Button>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 h-8 w-8"
                        onClick={() => navigate(`/portfolios/edit/${portfolio.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this portfolio project?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this portfolio project and all associated reviews.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => deletePortfolioMutation.mutate(portfolio.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {/* Pagination */}
            {portfolios.length > limit && (
              <Pagination
                currentPage={page}
                totalPages={Math.ceil(portfolios.length / limit)}
                onPageChange={handlePageChange}
                className="mt-8"
              />
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
}