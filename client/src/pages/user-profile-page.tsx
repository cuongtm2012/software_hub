import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, type ProfileData } from "@/hooks/use-profile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Star, Trash2, Download, Clock, Package2 } from "lucide-react";
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
  const {
    profile,
    isProfileLoading,
    updateProfileMutation,
    downloads,
    isDownloadsLoading,
    reviews,
    isReviewsLoading,
    updateReviewMutation,
    deleteReviewMutation,
  } = useProfile();
  
  const [activeTab, setActiveTab] = useState("profile");

  // Form setup for profile
  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.profile_data?.phone || "",
      address: user?.profile_data?.address || "",
      company: user?.profile_data?.company || "",
      bio: user?.profile_data?.bio || "",
    },
  });
  
  // Update form values when profile data is loaded
  useState(() => {
    if (user && user.profile_data) {
      form.reset({
        name: user.name,
        phone: user.profile_data.phone || "",
        address: user.profile_data.address || "",
        company: user.profile_data.company || "",
        bio: user.profile_data.bio || "",
      });
    }
  });

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
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Header */}
          <div className="w-full md:w-1/3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Account Management</CardTitle>
                <CardDescription>
                  Manage your profile, downloads, and reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4 py-4">
                  <div className="relative h-24 w-24 rounded-full bg-[#004080]/10 flex items-center justify-center">
                    <span className="text-3xl font-semibold text-[#004080]">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">{user?.name}</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <div className="mt-2">
                      <Badge variant="outline" className="bg-[#004080]/5 border-[#004080]/20 text-[#004080] mr-1">
                        {user?.role}
                      </Badge>
                      {user?.profile_data?.company && (
                        <Badge variant="outline" className="bg-[#ffcc00]/10 border-[#ffcc00]/20 text-[#996600]">
                          {user.profile_data.company}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-center">
                <div className="grid grid-cols-3 w-full text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-semibold text-[#004080]">
                      {downloads?.length || 0}
                    </span>
                    <span className="text-xs text-gray-500">Downloads</span>
                  </div>
                  <div className="flex flex-col items-center border-l border-r border-gray-200 px-2">
                    <span className="text-xl font-semibold text-[#004080]">
                      {reviews?.length || 0}
                    </span>
                    <span className="text-xs text-gray-500">Reviews</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-semibold text-[#004080]">
                      {user?.updated_at ? 
                        format(new Date(user.updated_at), 'MMM d') : 
                        'N/A'
                      }
                    </span>
                    <span className="text-xs text-gray-500">Last Update</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Tabs for Profile Management */}
          <div className="w-full md:w-2/3">
            <Card>
              <CardHeader className="pb-0">
                <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="downloads">Downloads</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Profile Tab */}
                <TabsContent value="profile" className="m-0">
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
                </TabsContent>

                {/* Downloads Tab */}
                <TabsContent value="downloads" className="m-0">
                  {isDownloadsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
                    </div>
                  ) : downloads && downloads.length > 0 ? (
                    <Table>
                      <TableCaption>A history of your software downloads</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Software</TableHead>
                          <TableHead>Version</TableHead>
                          <TableHead>Downloaded</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {downloads.map((download) => (
                          <TableRow key={download.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <Package2 className="h-4 w-4 mr-2 text-[#004080]" />
                                <span>{download.software?.name || `Software #${download.software_id}`}</span>
                              </div>
                            </TableCell>
                            <TableCell>{download.version}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                {download.downloaded_at ? 
                                  format(new Date(download.downloaded_at), 'PPp') : 
                                  'Unknown date'
                                }
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Download className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No Downloads Yet</h3>
                      <p className="text-gray-500 mt-1 max-w-md mx-auto">
                        You haven't downloaded any software yet. Browse our software repository to find applications that meet your needs.
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="m-0">
                  {isReviewsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
                    </div>
                  ) : reviews && reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <Card key={review.id} className="p-0 overflow-hidden">
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">
                                  {review.target_type === 'software' ? 'Software Review' : 
                                   review.target_type === 'product' ? 'Product Review' : 
                                   'Portfolio Review'}
                                </h3>
                                <div className="flex items-center mt-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? "fill-[#ffcc00] text-[#ffcc00]"
                                          : "fill-gray-200 text-gray-200"
                                      }`}
                                    />
                                  ))}
                                  <span className="ml-2 text-sm text-gray-600">
                                    {review.rating}/5
                                  </span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this review?")) {
                                      deleteReviewMutation.mutate(review.id);
                                    }
                                  }}
                                  disabled={deleteReviewMutation.isPending}
                                >
                                  {deleteReviewMutation.isPending && deleteReviewMutation.variables === review.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <p className="mt-2 text-gray-700">{review.comment}</p>
                            <div className="mt-2 text-xs text-gray-500">
                              {review.created_at && (
                                <span>
                                  {format(new Date(review.created_at), 'PPp')}
                                </span>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No Reviews Yet</h3>
                      <p className="text-gray-500 mt-1 max-w-md mx-auto">
                        You haven't reviewed any software or products yet. Share your experiences to help others find quality solutions.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}