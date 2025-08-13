import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  PageBreadcrumb,
  createBreadcrumbs,
} from "@/components/page-breadcrumb";
import {
  Package,
  DollarSign,
  Tag,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Upload,
  X,
  Plus,
  Image as ImageIcon,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useDropzone } from "react-dropzone";

const productSchema = z.object({
  title: z.string().min(3, "Product title must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  price_type: z.string().min(1, "Please specify the price type"),
  price: z.number().min(1000, "Price must be at least 1,000 VND"),
  stock_quantity: z.number().min(1, "Stock must be at least 1"),
  images: z.array(z.string()).optional(),
  download_link: z.string().url().optional().or(z.literal("")),
  license_info: z.string().optional(),
  tags: z.string().optional(),
  pricing_rows: z.array(z.object({
    price_type: z.string().min(1, "Please specify the price type"),
    price: z.number().min(1000, "Price must be at least 1,000 VND"),
    stock_quantity: z.number().min(1, "Stock must be at least 1"),
  })).min(1, "At least one pricing row is required"),
});

type ProductFormData = z.infer<typeof productSchema>;

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
  "Other",
];

// VND Currency formatting utility
const formatVND = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function SellerProductNewPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imageUploadRows, setImageUploadRows] = useState<number[]>([0]);
  const [pricingRows, setPricingRows] = useState<number[]>([0]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      price_type: "",
      price: 100000,
      stock_quantity: 1,
      images: [],
      download_link: "",
      license_info: "",
      tags: "",
      pricing_rows: [{
        price_type: "",
        price: 100000,
        stock_quantity: 1,
      }],
    },
  });

  // Image upload handlers
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload/image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const result = await response.json();
    return result.url;
  };



  const removeImage = useCallback(
    (indexToRemove: number) => {
      const newImages = uploadedImages.filter(
        (_, index) => index !== indexToRemove,
      );
      setUploadedImages(newImages);
      form.setValue("images", newImages);
    },
    [uploadedImages],
  );

  // Image upload row management
  const addImageUploadRow = () => {
    const nextId = Math.max(...imageUploadRows) + 1;
    setImageUploadRows([...imageUploadRows, nextId]);
  };

  const removeImageUploadRow = () => {
    if (imageUploadRows.length > 1) {
      setImageUploadRows(imageUploadRows.slice(0, -1));
    }
  };

  // Pricing row management
  const addPricingRow = () => {
    const currentRows = form.getValues('pricing_rows') || [];
    const newRow = {
      price_type: "",
      price: 100000,
      stock_quantity: 1,
    };
    form.setValue('pricing_rows', [...currentRows, newRow]);
    const nextId = Math.max(...pricingRows) + 1;
    setPricingRows([...pricingRows, nextId]);
  };

  const removePricingRow = () => {
    if (pricingRows.length > 1) {
      const currentRows = form.getValues('pricing_rows') || [];
      form.setValue('pricing_rows', currentRows.slice(0, -1));
      setPricingRows(pricingRows.slice(0, -1));
    }
  };

  // Single dropzone for all image uploads
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setUploading(true);
    try {
      const uploadPromises = acceptedFiles.map(uploadImage);
      const imageUrls = await Promise.all(uploadPromises);
      
      const newImages = [...uploadedImages, ...imageUrls];
      setUploadedImages(newImages);
      form.setValue("images", newImages);
      
      toast({
        title: "Images Uploaded",
        description: `Successfully uploaded ${acceptedFiles.length} image(s)`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [uploadedImages, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: true,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  // Check seller verification status
  const { data: sellerData, isLoading: profileLoading } = useQuery<any>({
    queryKey: ["/api/seller/profile"],
    enabled: !!user,
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const tagsArray = data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

      // Use the first pricing row for the main product data (backward compatibility)
      const mainPricingRow = data.pricing_rows?.[0] || {
        price_type: data.price_type,
        price: data.price,
        stock_quantity: data.stock_quantity,
      };

      return await apiRequest("POST", "/api/seller/products", {
        title: data.title,
        description: data.description,
        category: data.category,
        price: mainPricingRow.price.toString(), // Convert to string for API
        price_type: mainPricingRow.price_type,
        images: uploadedImages,
        stock_quantity: mainPricingRow.stock_quantity,
        download_link: data.download_link || null,
        license_info: data.license_info || null,
        tags: tagsArray,
        pricing_rows: data.pricing_rows,
        status: "pending", // Products go for review by default
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/products"] });
      toast({
        title: "Product Created",
        description:
          "Your product has been submitted for review and will be live once approved.",
      });
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description:
          error.message || "Failed to create product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    createProductMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Login Required</h2>
                <p className="text-gray-600 mb-4">
                  Please log in to add products.
                </p>
                <Button onClick={() => navigate("/test-login")}>Login</Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Check if user is verified seller
  if (
    !sellerData?.seller_profile ||
    sellerData.seller_profile.verification_status !== "verified"
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <main className="pt-16">
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
                  You must be a verified seller to add products to the
                  marketplace.
                </p>
                {!sellerData?.seller_profile ? (
                  <Button
                    onClick={() => navigate("/seller/register")}
                    className="bg-[#004080] hover:bg-[#003366]"
                  >
                    Register as Seller
                  </Button>
                ) : (
                  <div>
                    <p className="text-sm text-yellow-600 mb-4">
                      Your seller account is{" "}
                      {sellerData.seller_profile.verification_status}. Please
                      wait for verification to complete.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <PageBreadcrumb items={createBreadcrumbs.sellerProductNew()} />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Add New Product
                </h1>
                <p className="text-gray-600">
                  Create a new product listing for the marketplace
                </p>
              </div>
            </div>

            {/* Product Form */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
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
                              <Input
                                placeholder="Enter product title"
                                {...field}
                              />
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
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
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
                                <Input
                                  placeholder="e.g. windows, productivity, business"
                                  {...field}
                                />
                              </FormControl>
                              <p className="text-xs text-gray-500">
                                Separate tags with commas
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Product Images */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Product Images</h3>

                      {/* Image Upload Rows */}
                      <div className="space-y-4">
                        {imageUploadRows.map((rowId, index) => (
                          <div key={rowId} className="flex items-center gap-3">
                            <div
                              {...getRootProps()}
                              className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-48 h-10"
                            >
                              <input {...getInputProps()} />
                              <div className="flex items-center gap-2">
                                <Upload className="h-3 w-3 text-[#004080]" />
                                <span className="text-[#004080] font-medium text-sm">
                                  Upload File
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 text-xs">
                                  {uploadedImages.length > 0
                                    ? `${uploadedImages.length} file(s)`
                                    : "No file"}
                                </span>
                              </div>
                              {uploading && (
                                <Loader2 className="h-3 w-3 ml-2 animate-spin text-[#004080]" />
                              )}
                            </div>
                            
                            {/* Add/Remove buttons */}
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={addImageUploadRow}
                                className="w-8 h-8 p-0"
                                title="Add image upload row"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={removeImageUploadRow}
                                disabled={imageUploadRows.length <= 1}
                                className="w-8 h-8 p-0"
                                title="Remove image upload row"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Supported formats: JPG, PNG, GIF, WebP (Max 5MB each)
                        </p>
                      </div>

                      {/* Image Thumbnails */}
                      {uploadedImages.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Uploaded Images ({uploadedImages.length})
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {uploadedImages.map((imageUrl, index) => (
                              <div
                                key={index}
                                className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                              >
                                <img
                                  src={imageUrl}
                                  alt={`Product image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                  title="Remove image"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pricing & Inventory */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Pricing & Inventory
                      </h3>

                      {/* Dynamic Pricing Rows */}
                      <div className="space-y-4">
                        {pricingRows.map((rowId, index) => (
                          <div key={rowId} className="flex items-end gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                              <FormField
                                control={form.control}
                                name={`pricing_rows.${index}.price_type`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                      <Tag className="h-4 w-4" />
                                      Price Type *
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="e.g. Fixed Price, Subscription, One-time"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`pricing_rows.${index}.price`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                      <DollarSign className="h-4 w-4" />
                                      Price (VND) *
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="1000"
                                        min="1000"
                                        placeholder="100,000"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(
                                            parseInt(e.target.value) || 0,
                                          )
                                        }
                                      />
                                    </FormControl>
                                    {field.value > 0 && (
                                      <p className="text-sm text-muted-foreground">
                                        {formatVND(field.value)}
                                      </p>
                                    )}
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`pricing_rows.${index}.stock_quantity`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Stock Quantity *</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="1"
                                        placeholder="1"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(
                                            parseInt(e.target.value) || 1,
                                          )
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            {/* Add/Remove buttons */}
                            <div className="flex gap-2 pb-6">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={addPricingRow}
                                className="w-8 h-8 p-0"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={removePricingRow}
                                disabled={pricingRows.length <= 1}
                                className="w-8 h-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Optional Fields */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Additional Information
                      </h3>

                      <FormField
                        control={form.control}
                        name="license_info"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              License Information (Optional)
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe the license terms and conditions"
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-6">
                      <Button
                        type="submit"
                        disabled={createProductMutation.isPending}
                        className="bg-[#004080] hover:bg-[#003366] text-white px-8"
                      >
                        {createProductMutation.isPending && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        {createProductMutation.isPending
                          ? "Creating..."
                          : "Create Product"}
                      </Button>
                    </div>
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
