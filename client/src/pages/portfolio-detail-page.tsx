import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useRoute } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { insertPortfolioReviewSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { StarRating } from "@/components/ui/star-rating";
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
import {
  ArrowLeft,
  Star,
  Code,
  Link as LinkIcon,
  ExternalLink,
  User,
  MessageSquare,
  Trash2,
  Loader2,
  Calendar,
} from "lucide-react";

export default function PortfolioDetailPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/portfolios/:id");
  const portfolioId = params?.id ? parseInt(params.id, 10) : 0;
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  
  // Portfolio details query
  const { 
    data: portfolio, 
    isLoading: isLoadingPortfolio,
    error: portfolioError 
  } = useQuery({
    queryKey: ['/api/portfolios', portfolioId],
    queryFn: undefined,
    enabled: !!portfolioId,
  });
  
  // Portfolio reviews query
  const {
    data: reviews,
    isLoading: isLoadingReviews,
    error: reviewsError,
  } = useQuery({
    queryKey: ['/api/portfolio-reviews', portfolioId],
    queryFn: undefined,
    enabled: !!portfolioId,
  });
  
  // Create review form
  const reviewForm = useForm({
    resolver: zodResolver(insertPortfolioReviewSchema),
    defaultValues: {
      portfolio_id: portfolioId,
      rating: 0,
      comment: "",
    },
  });
  
  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/portfolio-reviews", {
        ...data,
        rating,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit review");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Review submitted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio-reviews', portfolioId] });
      reviewForm.reset();
      setRating(0);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit review",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/portfolio-reviews/${id}`, {});
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete review");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Review deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio-reviews', portfolioId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete review",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle review submission
  const onSubmitReview = (data: any) => {
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        description: "You must provide a rating (1-5 stars)",
        variant: "destructive",
      });
      return;
    }
    
    submitReviewMutation.mutate({
      ...data,
      portfolio_id: portfolioId,
      rating,
    });
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Calculate average rating
  const getAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc: number, review: any) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };
  
  // Format technologies list
  const formatTechnologies = (technologies: string[]) => {
    if (!technologies || technologies.length === 0) return "Not specified";
    return technologies.join(", ");
  };
  
  // Check if user has already submitted a review
  const hasUserReviewed = () => {
    return reviews?.some((review: any) => review.user_id === user?.id);
  };
  
  // Loading and error states
  const isLoading = isLoadingPortfolio || isLoadingReviews;
  const error = portfolioError || reviewsError;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#004080]" />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !portfolio) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
        <Header />
        <main className="flex-grow container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
            <h2 className="text-lg font-medium text-red-800 mb-2">Error loading portfolio</h2>
            <p className="text-red-600">The portfolio could not be found or you don't have permission to view it.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/portfolios')}
            >
              Back to Portfolios
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Header />
      
      <main className="flex-grow container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/portfolios')}
            className="mb-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portfolios
          </Button>
          
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{portfolio.title}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-gray-500" />
                  <span className="text-gray-700">
                    {portfolio.developer?.name || `Developer #${portfolio.developer_id}`}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                  <span className="text-gray-700">
                    {formatDate(portfolio.created_at)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="bg-white px-3 py-2 rounded-md border border-gray-200 flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-1" />
                <span className="font-semibold">{getAverageRating()}</span>
                <span className="text-gray-500 text-sm ml-1">
                  ({reviews?.length || 0} {reviews?.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
              
              {portfolio.demo_link && (
                <Button
                  variant="outline"
                  className="border-[#004080] text-[#004080]"
                  asChild
                >
                  <a 
                    href={portfolio.demo_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Demo
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            {/* Portfolio Images */}
            {portfolio.images && portfolio.images.length > 0 ? (
              <Card className="bg-white shadow-sm overflow-hidden mb-6">
                <CardContent className="p-0">
                  <Carousel>
                    <CarouselContent>
                      {portfolio.images.map((image: string, index: number) => (
                        <CarouselItem key={index}>
                          <div className="relative pt-[60%]">
                            <img 
                              src={image}
                              alt={`${portfolio.title} - image ${index + 1}`}
                              className="absolute inset-0 h-full w-full object-contain"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/800x500?text=Image+Not+Available';
                              }}
                            />
                          </div>
                          <div className="p-4 text-center">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  View Full Size
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
                                <div className="relative h-full">
                                  <img 
                                    src={image}
                                    alt={`${portfolio.title} - image ${index + 1}`}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      e.currentTarget.src = 'https://via.placeholder.com/1200x800?text=Image+Not+Available';
                                    }}
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </Carousel>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white shadow-sm overflow-hidden mb-6">
                <CardContent className="p-0">
                  <div className="bg-gray-100 h-64 flex items-center justify-center">
                    <Code className="h-20 w-20 text-gray-300" />
                  </div>
                  <div className="p-4 text-center text-gray-500">
                    No images available for this project
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Project Description */}
            <Card className="bg-white shadow-sm mb-6">
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{portfolio.description}</p>
              </CardContent>
            </Card>
            
            {/* Reviews Section */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Reviews</CardTitle>
                  <CardDescription>
                    {reviews?.length || 0} {reviews?.length === 1 ? 'review' : 'reviews'} for this portfolio
                  </CardDescription>
                </div>
                
                {user && !hasUserReviewed() && user.id !== portfolio.developer_id && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-[#004080] hover:bg-[#003366] text-white">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Write a Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Write a Review</DialogTitle>
                        <DialogDescription>
                          Share your feedback about this developer's work
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...reviewForm}>
                        <form onSubmit={reviewForm.handleSubmit(onSubmitReview)} className="space-y-4 mt-2">
                          <FormField
                            control={reviewForm.control}
                            name="rating"
                            render={() => (
                              <FormItem>
                                <FormLabel>Rating</FormLabel>
                                <FormControl>
                                  <div className="flex items-center">
                                    <StarRating 
                                      value={rating} 
                                      size="md" 
                                      readonly={false} 
                                      onChange={setRating} 
                                    />
                                    <span className="ml-2 text-gray-500">{rating} of 5 stars</span>
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  How would you rate this developer's work?
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={reviewForm.control}
                            name="comment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Review</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Share your thoughts on this developer's work..."
                                    className="min-h-[120px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Provide honest feedback that will help others
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button
                            type="submit"
                            className="w-full bg-[#004080] hover:bg-[#003366] text-white"
                            disabled={submitReviewMutation.isPending}
                          >
                            {submitReviewMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              "Submit Review"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent>
                {reviews?.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Be the first to review this portfolio
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="border border-gray-100 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            <div className="h-10 w-10 rounded-full bg-[#004080] flex items-center justify-center text-white mr-3">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center">
                                <h3 className="font-medium text-gray-900">{review.user?.name || `User #${review.user_id}`}</h3>
                                {user?.id === review.user_id && <span className="ml-2 text-xs text-gray-500">(You)</span>}
                              </div>
                              <div className="flex items-center mt-1">
                                <StarRating value={review.rating} size="sm" />
                                <span className="ml-2 text-sm text-gray-500">{formatDate(review.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          
                          {user?.id === review.user_id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 h-8 w-8"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete your review?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. Your review will be permanently deleted.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    onClick={() => deleteReviewMutation.mutate(review.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                        <p className="mt-2 text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            {/* Developer Info Card */}
            <Card className="bg-white shadow-sm mb-6">
              <CardHeader>
                <CardTitle>Developer</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-[#004080] flex items-center justify-center text-white mr-3">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{portfolio.developer?.name || `Developer #${portfolio.developer_id}`}</h3>
                    <p className="text-sm text-gray-500">Software Developer</p>
                  </div>
                </div>
                
                {user && user.id !== portfolio.developer_id && (
                  <Button 
                    className="w-full bg-[#004080] hover:bg-[#003366] text-white mb-4"
                    onClick={() => navigate(`/projects/new?developer=${portfolio.developer_id}`)}
                  >
                    Contact Developer
                  </Button>
                )}
                
                <Separator className="my-4" />
                
                {portfolio.demo_link && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Demo Link:</h4>
                    <a 
                      href={portfolio.demo_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#004080] hover:underline flex items-center text-sm"
                    >
                      <LinkIcon className="h-4 w-4 mr-1" />
                      {portfolio.demo_link}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Technologies Used:</h4>
                  <div className="flex flex-wrap gap-2">
                    {portfolio.technologies && portfolio.technologies.length > 0 ? (
                      portfolio.technologies.map((tech: string, index: number) => (
                        <span 
                          key={index}
                          className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                        >
                          {tech}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No technologies specified</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* More portfolios by this developer */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>More from this Developer</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/portfolios?developer=${portfolio.developer_id}`)}
                >
                  View All Projects
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}