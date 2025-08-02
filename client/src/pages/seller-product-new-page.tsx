import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Package, 
  Upload, 
  DollarSign, 
  Tag, 
  FileText, 
  Image as ImageIcon,
  Link as LinkIcon,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

const productSchema = z.object({
  title: z.string().min(3, "Product title must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  price: z.string().transform((val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) throw new Error("Price must be a positive number");
    return num;
  }),
  price_type: z.enum(["fixed", "range", "auction"]),
  stock_quantity: z.string().transform((val) => {
    const num = parseInt(val);
    if (isNaN(num) || num < 1) throw new Error("Stock must be at least 1");
    return num;
  }),
  download_link: z.string().url().optional().or(z.literal("")),
  license_info: z.string().optional(),
  tags: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

const categories = [
  "Software Licenses",
  "Digital Tools",
  "Graphics & Design",
  "Web Development",
  "Mobile Apps",
  "Games",
  "Productivity",
  "Security",
  "Database",
  "AI & Machine Learning",
  "DevOps",
  "Other"
];

export default function SellerProductNewPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      price: "",
      price_type: "fixed",
      stock_quantity: "1",
      download_link: "",
      license_info: "",
      tags: "",
    },
  });

  // Check seller verification status
  const { data: sellerData, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/seller/profile"],
    enabled: !!user,
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      const tagsArray = data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [];
      
      return apiRequest("/api/seller/products", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          tags: tagsArray,
          images: uploadedImages,
          product_files: uploadedFiles,
          status: "pending", // Products go for review by default
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/products"] });
      toast({
        title: "Product Created",
        description: "Your product has been submitted for review and will be live once approved.",
      });
      navigate("/seller/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductForm) => {
    createProductMutation.mutate(data);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Login Required</h2>
              <p className="text-gray-600 mb-4">Please log in to add products.</p>
              <Button onClick={() => navigate("/auth")}>Login</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (profileLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004080]"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // Check if user is verified seller
  if (!sellerData?.seller_profile || sellerData.seller_profile.verification_status !== "verified") {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Seller Verification Required
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                You must be a verified seller to add products to the marketplace.
              </p>
              {!sellerData?.seller_profile ? (
                <Button onClick={() => navigate("/seller/register")} className="bg-[#004080] hover:bg-[#003366]">
                  Register as Seller
                </Button>
              ) : (
                <div>
                  <p className="text-sm text-yellow-600 mb-4">
                    Your seller account is {sellerData.seller_profile.verification_status}. 
                    Please wait for verification to complete.
                  </p>
                  <Button onClick={() => navigate("/seller/dashboard")} variant="outline">
                    Back to Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/seller/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-gray-600">Create a new product listing for the marketplace</p>
            </div>
          </div>

          {/* Product Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter product title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your product in detail" 
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Tag className="h-4 w-4" />
                              Tags (Optional)
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. windows, productivity, business" {...field} />
                            </FormControl>
                            <p className="text-xs text-gray-500">Separate tags with commas</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing & Inventory */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Pricing & Inventory</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              Price (USD) *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                placeholder="0.00" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="price_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="fixed">Fixed Price</SelectItem>
                                <SelectItem value="range">Price Range</SelectItem>
                                <SelectItem value="auction">Auction</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stock_quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock Quantity *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                placeholder="1" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Product Files & Images */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Product Files & Media</h3>
                    
                    <FormField
                      control={form.control}
                      name="download_link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4" />
                            Download Link (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/download" {...field} />
                          </FormControl>
                          <p className="text-xs text-gray-500">
                            Provide a direct download link for your product
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Product Images Upload */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                        <ImageIcon className="h-4 w-4" />
                        Product Images
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          Upload product screenshots or images
                        </p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          id="images"
                          onChange={(e) => {
                            if (e.target.files) {
                              const fileNames = Array.from(e.target.files).map(f => f.name);
                              setUploadedImages(fileNames);
                            }
                          }}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => document.getElementById('images')?.click()}
                        >
                          Choose Images
                        </Button>
                      </div>
                      {uploadedImages.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Uploaded images:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {uploadedImages.map((image, index) => (
                              <Badge key={index} variant="outline">{image}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Product Files Upload */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4" />
                        Product Files (Optional)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          Upload additional product files or documentation
                        </p>
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          id="files"
                          onChange={(e) => {
                            if (e.target.files) {
                              const fileNames = Array.from(e.target.files).map(f => f.name);
                              setUploadedFiles(fileNames);
                            }
                          }}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => document.getElementById('files')?.click()}
                        >
                          Choose Files
                        </Button>
                      </div>
                      {uploadedFiles.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Uploaded files:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {uploadedFiles.map((file, index) => (
                              <Badge key={index} variant="outline">{file}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* License Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">License & Terms</h3>
                    
                    <FormField
                      control={form.control}
                      name="license_info"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Information (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the license terms, usage rights, or any restrictions" 
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <p className="text-xs text-gray-500">
                            Specify how buyers can use your product
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Review Notice */}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Review Process:</strong> Your product will be reviewed by our team before going live. 
                      This typically takes 24-48 hours. You'll be notified once approved.
                    </AlertDescription>
                  </Alert>

                  {/* Submit Buttons */}
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/seller/dashboard")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createProductMutation.isPending}
                      className="bg-[#004080] hover:bg-[#003366]"
                    >
                      {createProductMutation.isPending ? "Creating..." : "Submit for Review"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}