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

function useProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Simplified loading check
  const isProfileLoading = false;

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
        title: "Đã cập nhật hồ sơ",
        description: "Thông tin của bạn đã được lưu thành công.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cập nhật thất bại",
        description: error.message || "Không thể cập nhật hồ sơ. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  return {
    isProfileLoading,
    updateProfileMutation,
  };
}

export { useProfile };