import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertProductSchema, Product } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Extended product schema with validations
const productSchema = insertProductSchema.extend({
  title: z.string().min(3, "Product title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be positive").min(0.01, "Minimum price is $0.01"),
  category: z.string().min(1, "Category is required"),
  images: z.array(z.string()).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  productId?: number;
  isEdit?: boolean;
}

export function ProductForm({ productId, isEdit = false }: ProductFormProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  // Fetch categories
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch product if editing
  const { data: product, isLoading: productLoading } = useQuery<any>({
    queryKey: [`/api/products/${productId}`],
    enabled: isEdit && !!productId,
  });

  // Define form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      category: "",
      images: [],
    },
  });

  // Update form values when editing and product data is loaded
  useEffect(() => {
    if (isEdit && product) {
      console.log("📥 Loading product data:", product);
      
      // Extract first image URL from images array
      const firstImageUrl = product.images && product.images.length > 0 ? product.images[0] : "";
      setImageUrl(firstImageUrl);
      
      form.reset({
        title: product.title || product.name,
        description: product.description,
        price: parseFloat(product.price) || 0,
        category: product.category,
        images: product.images || [],
      });
      
      console.log("✅ Form populated with image URL:", firstImageUrl);
    }
  }, [form, isEdit, product]);

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      console.log("📤 Creating product with data:", data);
      return apiRequest("POST", "/api/seller/products", {
        title: data.title,
        description: data.description,
        price: data.price.toString(),
        category: data.category,
        price_type: "fixed",
        stock_quantity: 1,
        images: imageUrl ? [imageUrl] : null
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/seller/products"],
      });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      setServerError(error.message);
      toast({
        title: "Error",
        description: `Failed to create product: ${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      console.log("📤 Updating product with data:", data);
      console.log("🖼️ Image URL being sent:", imageUrl);
      
      return apiRequest("PUT", `/api/seller/products/${productId}`, {
        title: data.title,
        description: data.description,
        price: data.price.toString(),
        category: data.category,
        images: imageUrl ? [imageUrl] : null
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/seller/products"],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/products/${productId}`],
      });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      setServerError(error.message);
      toast({
        title: "Error",
        description: `Failed to update product: ${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  // Form submission handler
  const onSubmit = async (values: ProductFormValues) => {
    console.log("🎯 Form submission triggered!");
    console.log("📦 Form values:", values);
    console.log("🔧 Is Edit Mode:", isEdit);
    console.log("🆔 Product ID:", productId);
    
    setIsLoading(true);
    setServerError(null);

    try {
      if (isEdit) {
        console.log("✅ Calling UPDATE mutation...");
        updateProductMutation.mutate(values);
      } else {
        console.log("✅ Calling CREATE mutation...");
        createProductMutation.mutate(values);
      }
    } catch (error) {
      console.error("❌ Form submission error:", error);
      setIsLoading(false);
    }
  };

  // Log form errors for debugging
  useEffect(() => {
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0) {
      console.log("⚠️ Form validation errors:", errors);
    }
  }, [form.formState.errors]);

  if (isEdit && productLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {serverError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Display form validation errors */}
      {Object.keys(form.formState.errors).length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Form Validation Errors</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside">
              {Object.entries(form.formState.errors).map(([field, error]) => (
                <li key={field}>
                  <strong>{field}:</strong> {error?.message as string}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Title*</FormLabel>
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
                <FormLabel>Description*</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your product"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (USD)*</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        className="pl-7"
                        {...field}
                        onChange={(e) => {
                          field.onChange(parseFloat(e.target.value));
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormItem>
            <FormLabel>Image URL (Optional)</FormLabel>
            <FormControl>
              <Input 
                placeholder="https://example.com/image.jpg" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </FormControl>
            <FormDescription>
              Enter a URL to an image of your product
            </FormDescription>
          </FormItem>

          {imageUrl && (
            <div className="mt-2 p-2 border rounded">
              <p className="text-sm text-gray-500 mb-2">Image Preview:</p>
              <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden rounded">
                <img
                  src={imageUrl}
                  alt="Preview"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "";
                    (e.target as HTMLImageElement).alt = "Failed to load image";
                  }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              onClick={() => {
                console.log("🔘 Update button clicked!");
                console.log("📝 Current form values:", form.getValues());
                console.log("✔️ Form is valid:", form.formState.isValid);
                console.log("❌ Form errors:", form.formState.errors);
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEdit ? "Update" : "Create"} Product</>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}