import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useAuth } from "./use-auth";
import { UserDownload } from "@shared/schema";

// ProfileData type matches the schema on the server
export type ProfileData = {
  name?: string;
  phone?: string;
  address?: string;
  company?: string;
  bio?: string;
  preferences?: Record<string, any>;
};

export function useProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get user profile
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["/api/auth/profile"],
    queryFn: getQueryFn(),
    enabled: !!user, // Only run if user is logged in
  });

  // Update user profile
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: ProfileData) => {
      const res = await apiRequest("PUT", "/api/auth/profile", { profileData });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/profile"], data);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get user downloads
  const {
    data: downloads,
    isLoading: isDownloadsLoading,
    error: downloadsError,
  } = useQuery<UserDownload[]>({
    queryKey: ["/api/user/downloads"],
    queryFn: getQueryFn(),
    enabled: !!user, // Only run if user is logged in
  });

  // Track a new download
  const trackDownloadMutation = useMutation({
    mutationFn: async (data: { software_id: number; version: string }) => {
      const res = await apiRequest("POST", "/api/user/downloads", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/downloads"] });
      toast({
        title: "Download tracked",
        description: "Your download has been recorded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Tracking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get user reviews
  const {
    data: reviews,
    isLoading: isReviewsLoading,
    error: reviewsError,
  } = useQuery({
    queryKey: ["/api/user/reviews"],
    queryFn: getQueryFn(),
    enabled: !!user, // Only run if user is logged in
  });

  // Update a review
  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { rating?: number; comment?: string } }) => {
      const res = await apiRequest("PUT", `/api/user/reviews/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/reviews"] });
      toast({
        title: "Review updated",
        description: "Your review has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete a review
  const deleteReviewMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/user/reviews/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/reviews"] });
      toast({
        title: "Review deleted",
        description: "Your review has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    // Profile data and operations
    profile,
    isProfileLoading,
    profileError,
    updateProfileMutation,
    
    // Downloads data and operations
    downloads,
    isDownloadsLoading,
    downloadsError,
    trackDownloadMutation,
    
    // Reviews data and operations
    reviews,
    isReviewsLoading,
    reviewsError,
    updateReviewMutation,
    deleteReviewMutation,
  };
}