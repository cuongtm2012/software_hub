import { useEffect, useState } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Loader2, 
  Save, 
  Download, 
  Star, 
  Calendar, 
  FileText,
  User
} from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { StarRating } from "@/components/ui/star-rating";

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
  const [activeTab, setActiveTab] = useState("profile");
  
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

  // Fetch user downloads
  const { 
    data: downloads = [], 
    isLoading: isDownloadsLoading 
  } = useQuery<any[]>({
    queryKey: ['/api/user/downloads'],
    enabled: activeTab === "downloads" && !!user,
  });

  // Fetch user reviews
  const { 
    data: reviews = [], 
    isLoading: isReviewsLoading 
  } = useQuery<any[]>({
    queryKey: ['/api/user/reviews'],
    enabled: activeTab === "reviews" && !!user,
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
        <h1 className="text-3xl font-bold mb-8 text-[#004080]">My Account</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Profile Header */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Manage your account
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

          {/* Main Content */}
          <div className="md:col-span-3">
            <Tabs 
              defaultValue="profile" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="downloads" className="flex items-center">
                  <Download className="mr-2 h-4 w-4" />
                  Downloads
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center">
                  <Star className="mr-2 h-4 w-4" />
                  Reviews
                </TabsTrigger>
              </TabsList>
              
              {/* Profile Tab */}
              <TabsContent value="profile">
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
              </TabsContent>
              
              {/* Downloads Tab */}
              <TabsContent value="downloads">
                <Card>
                  <CardHeader>
                    <CardTitle>Downloaded Software</CardTitle>
                    <CardDescription>
                      Track all the software you've downloaded from our platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isDownloadsLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
                      </div>
                    ) : downloads && downloads.length > 0 ? (
                      <div className="space-y-4">
                        {downloads.map((download: any) => (
                          <Card key={download.id} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                              <div className="p-4 md:p-6 flex-grow space-y-2">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-lg font-medium text-[#004080]">{download.software?.name}</h3>
                                  <Badge variant="outline" className="bg-[#004080]/5 border-[#004080]/20 text-[#004080]">
                                    v{download.version}
                                  </Badge>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Downloaded on {format(new Date(download.downloaded_at), 'MMMM d, yyyy')}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {download.software?.platform.map((platform: string, idx: number) => (
                                    <span 
                                      key={idx} 
                                      className="inline-block px-2 py-1 text-xs rounded-full bg-[#004080]/10 text-[#004080]"
                                    >
                                      {platform}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="p-4 md:p-6 bg-gray-50 md:w-1/4 flex flex-col justify-center items-center">
                                <Button 
                                  variant="outline" 
                                  className="w-full border-[#004080] text-[#004080] hover:bg-[#004080]/10"
                                  onClick={() => window.open(download.software?.download_link, '_blank')}
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download Again
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <Download className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No Downloads Yet</h3>
                        <p className="text-gray-500">
                          You haven't downloaded any software from our platform yet.
                        </p>
                        <Button 
                          className="mt-4 bg-[#004080] hover:bg-[#003366]"
                          onClick={() => window.location.href = '/'}
                        >
                          Browse Software
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Reviews Tab */}
              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Reviews</CardTitle>
                    <CardDescription>
                      Manage reviews you've left on software products
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isReviewsLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
                      </div>
                    ) : reviews && reviews.length > 0 ? (
                      <div className="space-y-6">
                        {reviews.map((review: any) => (
                          <Card key={review.id} className="overflow-hidden">
                            <div className="p-4 md:p-6 space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-[#004080]">
                                  {review.target_type === 'software' ? 'Software Review' : 'Product Review'}
                                </h3>
                                <div className="flex items-center gap-1">
                                  <StarRating value={review.rating} />
                                  <span className="text-sm text-gray-500">({review.rating}/5)</span>
                                </div>
                              </div>
                              
                              <p className="text-gray-700">{review.comment}</p>
                              
                              <div className="flex items-center justify-between pt-2 border-t">
                                <div className="flex items-center text-sm text-gray-500">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Posted on {format(new Date(review.created_at), 'MMMM d, yyyy')}
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="border-gray-200 hover:bg-gray-50"
                                    onClick={() => {
                                      if (review.target_type === 'software') {
                                        window.location.href = `/software/${review.target_id}`;
                                      } else {
                                        window.location.href = `/product/${review.target_id}`;
                                      }
                                    }}
                                  >
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Item
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No Reviews Yet</h3>
                        <p className="text-gray-500">
                          You haven't posted any reviews on our platform yet.
                        </p>
                        <Button 
                          className="mt-4 bg-[#004080] hover:bg-[#003366]"
                          onClick={() => window.location.href = '/'}
                        >
                          Browse Software
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}