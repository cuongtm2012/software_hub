import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, type ProfileData } from "@/hooks/use-profile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save } from "lucide-react";
import { format } from "date-fns";

// Profile schema validation
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  company: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

export default function UserProfilePage() {
  const { user } = useAuth();
  const { isProfileLoading, updateProfileMutation } = useProfile();
  
  // Form setup for profile
  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: "",
      address: "",
      company: "",
      bio: "",
    },
  });
  
  // Update form values when profile data is loaded
  useEffect(() => {
    if (user) {
      const profileData = user.profile_data || {};
      form.reset({
        name: user.name,
        phone: typeof profileData === 'object' && profileData !== null ? (profileData as any).phone || "" : "",
        address: typeof profileData === 'object' && profileData !== null ? (profileData as any).address || "" : "",
        company: typeof profileData === 'object' && profileData !== null ? (profileData as any).company || "" : "",
        bio: typeof profileData === 'object' && profileData !== null ? (profileData as any).bio || "" : "",
      });
    }
  }, [user, form]);

  // Handle profile form submission
  const onSubmit = (data: ProfileData) => {
    updateProfileMutation.mutate(data);
  };

  // If loading, show spinner
  if (isProfileLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-[#004080]">Profile Settings</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Header */}
          <div className="w-full md:w-1/3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Manage your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4 py-4">
                  <div className="relative h-24 w-24 rounded-full bg-[#004080]/10 flex items-center justify-center">
                    <span className="text-3xl font-semibold text-[#004080]">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">{user?.name}</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <div className="mt-2">
                      <Badge variant="outline" className="bg-[#004080]/5 border-[#004080]/20 text-[#004080] mr-1">
                        {user?.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-center">
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Last Updated: {user?.updated_at ? 
                      format(new Date(user.updated_at), 'MMMM d, yyyy') : 
                      'Not updated yet'
                    }
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="w-full md:w-2/3">
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>
                  Update your personal information below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input placeholder="Your company name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Your address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about yourself" 
                              className="resize-none h-32"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Briefly describe yourself or your business
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#004080] hover:bg-[#003366]"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Profile
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}