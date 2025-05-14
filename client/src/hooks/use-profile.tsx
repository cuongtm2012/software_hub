import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  User as SelectUser, 
  UserDownload as SelectUserDownload,
  Review as SelectReview 
} from "@shared/schema";

export type ProfileData = {
  name?: string;
  phone?: string;
  address?: string;
  company?: string;
  bio?: string;
  preferences?: Record<string, any>;
};

export function useProfile() {
  const { toast } = useToast();
  
  // Query for user profile
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError
  } = useQuery<SelectUser | undefined>({
    queryKey: ["/api/user"],
    enabled: true,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  // Query for user downloads
  const {
    data: downloads,
    isLoading: isDownloadsLoading,
    error: downloadsError
  } = useQuery<SelectUserDownload[]>({
    queryKey: ["/api/user/downloads"],
    enabled: true,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  // Query for user reviews
  const {
    data: reviews,
    isLoading: isReviewsLoading,
    error: reviewsError
  } = useQuery<SelectReview[]>({
    queryKey: ["/api/user/reviews"],
    enabled: true,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  // Mutation to update profile
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: ProfileData) => {
      const response = await apiRequest("PUT", "/api/auth/profile", { profileData });
      return await response.json();
    },
    onSuccess: (data: SelectUser) => {
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation to update review
  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, reviewData }: { id: number; reviewData: Partial<SelectReview> }) => {
      const response = await apiRequest("PUT", `/api/user/reviews/${id}`, reviewData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/reviews"] });
      toast({
        title: "Review updated",
        description: "Your review has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update review",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation to delete review
  const deleteReviewMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/user/reviews/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/reviews"] });
      toast({
        title: "Review deleted",
        description: "Your review has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete review",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  return {
    profile,
    isProfileLoading,
    profileError,
    updateProfileMutation,
    downloads,
    isDownloadsLoading,
    downloadsError,
    reviews,
    isReviewsLoading,
    reviewsError,
    updateReviewMutation,
    deleteReviewMutation,
  };
}