import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import { Software, Review, InsertReview } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Download, Monitor, Tag, Calendar } from "lucide-react";
import { format } from "date-fns";

interface SoftwareDetailModalProps {
  software: Software | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ReviewWithUser extends Review {
  user_name?: string;
}

export function SoftwareDetailModal({ software, open, onOpenChange }: SoftwareDetailModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Reset form when modal closes or software changes
  useEffect(() => {
    if (!open || !software) {
      setUserRating(5);
      setReviewComment("");
    }
  }, [open, software]);

  // Fetch reviews for the software
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<ReviewWithUser[]>({
    queryKey: software ? ["/api/reviews", software.id] : [],
    queryFn: async ({ queryKey }) => {
      if (!software) return [];
      const [_, softwareId] = queryKey;
      const res = await fetch(`/api/reviews/${softwareId}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
    enabled: !!software && open,
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: InsertReview) => {
      const res = await apiRequest("POST", "/api/reviews", reviewData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Review submitted",
        description: "Your review has been submitted successfully.",
      });
      setReviewComment("");
      // Invalidate the reviews query to reload the data
      if (software) {
        queryClient.invalidateQueries({ queryKey: ["/api/reviews", software.id] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitReview = () => {
    if (!software || !user) return;
    
    if (!reviewComment.trim()) {
      toast({
        title: "Review required",
        description: "Please write a comment for your review.",
        variant: "destructive",
      });
      return;
    }
    
    const reviewData: InsertReview = {
      target_type: "software",
      target_id: software.id,
      rating: userRating,
      comment: reviewComment,
    };
    
    submitReviewMutation.mutate(reviewData);
  };

  // Calculate average rating
  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        {software && (
          <div className="flex flex-col md:flex-row">
            {/* Software image */}
            <div className="flex-shrink-0 relative bg-gray-100 md:w-2/5">
              {software.image_url ? (
                <img 
                  src={software.image_url} 
                  alt={`${software.name} screenshot`} 
                  className="w-full object-cover h-48 md:h-full" 
                />
              ) : (
                <div className="w-full h-48 md:h-full flex items-center justify-center bg-gray-100">
                  <Monitor className="h-16 w-16 text-gray-400" />
                </div>
              )}
              <div className="absolute top-0 right-0 mt-2 mr-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Free
                </span>
              </div>
            </div>
            
            {/* Software details */}
            <div className="p-6 flex-1 overflow-y-auto max-h-[70vh]">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-bold text-gray-900">{software.name}</h3>
                <div className="flex items-center">
                  <StarRating value={averageRating || 0} size="lg" />
                  <span className="ml-1 font-medium text-gray-700">{averageRating ? averageRating.toFixed(1) : "No ratings"}</span>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Monitor className="h-5 w-5 mr-1.5 text-gray-400" />
                  <span>{software.platform.join(", ")}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-1.5 text-gray-400" />
                  <span>Added: {format(new Date(software.created_at), "MMM d, yyyy")}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-lg font-medium text-gray-900">Description</h4>
                <p className="mt-2 text-gray-600">{software.description}</p>
              </div>
              
              <div className="mt-6">
                <a 
                  href={software.download_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download
                </a>
              </div>
              
              {/* Reviews section */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h4 className="text-lg font-medium text-gray-900">Reviews</h4>
                
                {user ? (
                  <div className="mt-4 border border-gray-300 rounded-md p-4">
                    <div className="flex items-center mb-2">
                      <span className="text-sm text-gray-600 mr-2">Your rating:</span>
                      <StarRating 
                        value={userRating} 
                        onChange={setUserRating} 
                        readonly={false}
                      />
                    </div>
                    <div>
                      <Textarea
                        id="comment"
                        placeholder="Write your review..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button 
                        onClick={handleSubmitReview}
                        disabled={submitReviewMutation.isPending}
                        className="inline-flex items-center"
                      >
                        {submitReviewMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Submit Review
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 bg-gray-50 rounded-md p-4 text-center">
                    <p className="text-gray-600">
                      Please <Button variant="link" className="p-0 h-auto" onClick={() => {
                        onOpenChange(false);
                        window.location.href = "/auth";
                      }}>login</Button> to leave a review.
                    </p>
                  </div>
                )}
                
                <div className="mt-6 space-y-6">
                  {isLoadingReviews ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                    </div>
                  ) : reviews?.length ? (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 rounded-full">
                              <AvatarFallback>{getInitials(review.user_name || "User")}</AvatarFallback>
                            </Avatar>
                            <span className="ml-2 font-medium text-gray-900">{review.user_name || "User"}</span>
                          </div>
                          <div className="flex items-center">
                            <StarRating rating={review.rating} size="sm" />
                            <span className="ml-2 text-sm text-gray-500">
                              {format(new Date(review.created_at), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-gray-600">{review.comment}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No reviews yet. Be the first to leave a review!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
