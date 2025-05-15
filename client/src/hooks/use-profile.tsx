import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export type ProfileData = {
  name?: string;
  phone?: string;
  address?: string;
  company?: string;
  bio?: string;
};

export function useProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Check if user profile is loading
  const isProfileLoading = !user && queryClient.getQueryState(["/api/user"])?.status === "loading";

  // Mutation to update user profile
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: ProfileData) => {
      if (!user) {
        throw new Error("You must be logged in to update your profile");
      }
      
      const response = await apiRequest("PATCH", "/api/user/profile", profileData);
      return await response.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    isProfileLoading,
    updateProfileMutation,
  };
}