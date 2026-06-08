import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { PageHero } from "@/components/design-system/page-hero";
import { SectionPanel } from "@/components/design-system/section-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
  Package,
  DollarSign,
  Tag,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Upload,
  X,
  Plus,
  Shield,
  Clock,
  ImageIcon,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

const inputClass =
  "border-[#004080]/15 bg-white focus-visible:ring-[#004080]/30 h-11";

const TIPS = [
  { icon: Package, title: "Mô tả rõ ràng", desc: "Giải thích tính năng, phiên bản và đối tượng phù hợp" },
  { icon: ImageIcon, title: "Ảnh chất lượng", desc: "Dùng ảnh sắc nét, tối đa 5MB mỗi file" },
  { icon: Clock, title: "Chờ duyệt", desc: "Sản phẩm hiển thị sau khi admin phê duyệt" },
];

const productSchema = z.object({
  title: z.string().min(3, "Tên sản phẩm phải có ít nhất 3 ký tự"),
  description: z.string().min(20, "Mô tả phải có ít nhất 20 ký tự"),
  category: z.string().min(1, "Vui lòng chọn danh mục"),
  price_type: z.string().optional(), // Legacy field, not required
  price: z.number().optional(), // Legacy field, not required
  stock_quantity: z.number().optional(), // Legacy field, not required
  images: z.array(z.string()).optional(),
  download_link: z.string().url().optional().or(z.literal("")),
  license_info: z.string().optional(),
  tags: z.string().optional(),
  pricing_rows: z
    .array(
      z.object({
        price_type: z.string().min(1, "Vui lòng nhập loại giá"),
        price: z.number().min(1000, "Giá tối thiểu 1.000 ₫"),
        stock_quantity: z.number().min(1, "Tồn kho tối thiểu là 1"),
        license_info: z.string().optional(),
      }),
    )
    .min(1, "Cần ít nhất một mức giá"),
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

// VND Currency formatting utilities
const formatVND = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatVNDInput = (value: string): string => {
  // Remove non-numeric characters
  const numericValue = value.replace(/[^\d]/g, "");
  if (!numericValue) return "";

  // Format with thousand separators
  return new Intl.NumberFormat("vi-VN").format(parseInt(numericValue));
};

export default function SellerProductNewPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
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
      pricing_rows: [
        {
          price_type: "",
          price: 100000,
          stock_quantity: 1,
          license_info: "",
        },
      ],
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

  // Remove image upload row functionality - now using single multi-file upload

  // Pricing row management
  const addPricingRow = () => {
    const currentRows = form.getValues("pricing_rows") || [];
    const newRow = {
      price_type: "",
      price: 100000,
      stock_quantity: 1,
      license_info: "",
    };
    form.setValue("pricing_rows", [...currentRows, newRow]);
    const nextId = Math.max(...pricingRows) + 1;
    setPricingRows([...pricingRows, nextId]);
  };

  // Single dropzone for all image uploads
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setUploading(true);
      try {
        const uploadPromises = acceptedFiles.map(uploadImage);
        const imageUrls = await Promise.all(uploadPromises);

        const newImages = [...uploadedImages, ...imageUrls];
        setUploadedImages(newImages);
        form.setValue("images", newImages);

        toast({
          title: "Đã tải ảnh lên",
          description: `Đã tải ${acceptedFiles.length} ảnh thành công`,
        });
      } catch {
        toast({
          title: "Tải ảnh thất bại",
          description: "Vui lòng thử lại.",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    },
    [uploadedImages, toast],
  );

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

      const payload = {
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
      };
      
      return apiRequest("POST", "/api/seller/products", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/products"] });
      toast({
        title: "Đã tạo sản phẩm",
        description: "Sản phẩm đang chờ admin duyệt trước khi hiển thị.",
      });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Tạo sản phẩm thất bại",
        description: error.message || "Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    createProductMutation.mutate(data);
  };

  const onError = () => {
    toast({
      title: "Vui lòng kiểm tra form",
      description: "Còn trường bắt buộc chưa điền hoặc chưa hợp lệ.",
      variant: "destructive",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f9f9f9]">
        <Header />
        <main className="pt-16 flex items-center justify-center px-4 py-16">
          <Card className="max-w-md w-full uupm-card border-[#004080]/10">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#004080]/8">
                <Shield className="h-7 w-7 text-[#004080]" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Cần đăng nhập</h2>
              <p className="text-muted-foreground mb-6 text-sm">
                Đăng nhập để thêm sản phẩm lên marketplace.
              </p>
              <Button onClick={() => navigate("/auth")} className="bg-[#004080] hover:bg-[#003366] w-full">
                Đăng nhập
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9]">
        <Header />
        <main className="pt-16 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
        </main>
        <Footer />
      </div>
    );
  }

  const canAddProducts = user.role === "seller" || user.role === "admin";
  const sellerProfile = sellerData?.seller_profile;
  const profileNeedsAttention =
    !sellerProfile || sellerProfile.verification_status !== "verified";

  if (!canAddProducts) {
    return (
      <div className="min-h-screen bg-[#f9f9f9]">
        <Header />
        <main className="pt-16 px-4 py-12">
          <Card className="max-w-lg mx-auto uupm-card border-[#004080]/10">
            <CardContent className="p-8 text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
              <h2 className="text-xl font-semibold">Cần tài khoản Seller</h2>
              <p className="text-muted-foreground text-sm">
                Chỉ tài khoản Seller mới có thể thêm sản phẩm lên marketplace.
              </p>
              <Button onClick={() => navigate("/seller/register")} className="bg-[#004080] hover:bg-[#003366]">
                Đăng ký Seller
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <Header />
      <PageHero
        badge="Marketplace"
        title="Thêm sản phẩm mới"
        subtitle="Điền thông tin sản phẩm — sau khi gửi, admin sẽ duyệt trước khi hiển thị công khai."
      />
      <main className="pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#004080] mb-6 transition-colors uupm-focus rounded-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại bảng điều khiển
          </button>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-5">
              {profileNeedsAttention && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-900 text-sm">
                    {!sellerProfile ? (
                      <>
                        Bạn chưa hoàn tất hồ sơ Seller. Vẫn có thể thêm sản phẩm — sản phẩm sẽ chờ duyệt.{" "}
                        <button
                          type="button"
                          onClick={() => navigate("/seller/register")}
                          className="font-medium underline underline-offset-2"
                        >
                          Hoàn tất đăng ký
                        </button>
                      </>
                    ) : (
                      <>
                        Hồ sơ Seller: &quot;{sellerProfile.verification_status}&quot;. Mỗi sản phẩm sẽ được admin duyệt riêng.
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-5">
                  <SectionPanel title="Thông tin cơ bản" subtitle="Tên, mô tả và phân loại sản phẩm">
                    <div className="space-y-4">

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Tên sản phẩm <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="VD: Microsoft Office 365 License"
                                className={inputClass}
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
                            <FormLabel>
                              Mô tả <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Mô tả chi tiết tính năng, phiên bản, đối tượng sử dụng…"
                                className="min-h-[120px] border-[#004080]/15 focus-visible:ring-[#004080]/30 resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Danh mục <span className="text-red-500">*</span>
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className={inputClass}>
                                    <SelectValue placeholder="Chọn danh mục" />
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
                              <FormLabel className="flex items-center gap-1.5">
                                <Tag className="h-3.5 w-3.5" />
                                Tags (tùy chọn)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="windows, productivity, business"
                                  className={inputClass}
                                  {...field}
                                />
                              </FormControl>
                              <p className="text-xs text-muted-foreground">Phân cách bằng dấu phẩy</p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </SectionPanel>

                  <SectionPanel title="Hình ảnh sản phẩm" subtitle="JPG, PNG, GIF, WebP — tối đa 5MB mỗi file">
                    <div className="space-y-4">
                      <div
                        {...getRootProps()}
                        className={cn(
                          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition-colors",
                          isDragActive
                            ? "border-[#004080] bg-[#004080]/5"
                            : "border-[#004080]/20 bg-[#004080]/[0.02] hover:border-[#004080]/40 hover:bg-[#004080]/5",
                        )}
                      >
                        <input {...getInputProps()} />
                        {uploading ? (
                          <Loader2 className="h-8 w-8 animate-spin text-[#004080] mb-2" />
                        ) : (
                          <Upload className="h-8 w-8 text-[#004080] mb-2" />
                        )}
                        <p className="text-sm font-medium text-foreground">
                          {isDragActive ? "Thả ảnh vào đây…" : "Kéo thả hoặc bấm để chọn ảnh"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {uploadedImages.length > 0
                            ? `Đã chọn ${uploadedImages.length} ảnh`
                            : "Chưa có ảnh nào"}
                        </p>
                      </div>

                      {uploadedImages.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                          {uploadedImages.map((imageUrl, index) => (
                            <div
                              key={index}
                              className="relative group aspect-square rounded-lg overflow-hidden border border-[#004080]/15 bg-muted/30"
                            >
                              <img
                                src={imageUrl}
                                alt={`Ảnh ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%236b7280'%3EẢnh%3C/text%3E%3C/svg%3E";
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1.5 right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                title="Xóa ảnh"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </SectionPanel>

                  <SectionPanel title="Giá & tồn kho" subtitle="Thiết lập mức giá và số lượng bán">
                    <div className="space-y-4">
                      {pricingRows.map((rowId, index) => (
                        <div
                          key={rowId}
                          className="rounded-xl border border-[#004080]/10 bg-[#004080]/[0.02] p-4 space-y-4"
                        >
                          {pricingRows.length > 1 && (
                            <p className="text-xs font-medium text-muted-foreground">
                              Mức giá #{index + 1}
                            </p>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name={`pricing_rows.${index}.price_type`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-1.5">
                                    <Tag className="h-3.5 w-3.5" />
                                    Loại giá <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="VD: Mua một lần, Gói tháng"
                                      className={inputClass}
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
                                  <FormLabel className="flex items-center gap-1.5">
                                    <DollarSign className="h-3.5 w-3.5" />
                                    Giá (VND) <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        placeholder="100.000"
                                        value={
                                          field.value
                                            ? formatVNDInput(field.value.toString())
                                            : ""
                                        }
                                        onChange={(e) => {
                                          const numericValue = e.target.value.replace(/[^\d]/g, "");
                                          field.onChange(parseInt(numericValue) || 0);
                                        }}
                                        className={cn(inputClass, "pr-8")}
                                      />
                                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                        ₫
                                      </span>
                                    </div>
                                  </FormControl>
                                  {field.value > 0 && (
                                    <p className="text-xs text-muted-foreground">
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
                                  <FormLabel>
                                    Tồn kho <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      placeholder="1"
                                      className={inputClass}
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(parseInt(e.target.value) || 1)
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex gap-3 items-end">
                            <div className="flex-1">
                              <FormField
                                control={form.control}
                                name={`pricing_rows.${index}.license_info`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Thông tin license (tùy chọn)</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Điều khoản license, giới hạn sử dụng…"
                                        className="min-h-[72px] resize-none border-[#004080]/15 focus-visible:ring-[#004080]/30"
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="flex gap-1.5 pb-1 shrink-0">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={addPricingRow}
                                className="h-9 w-9 p-0 border-[#004080]/20"
                                title="Thêm mức giá"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (pricingRows.length > 1) {
                                    const currentRows = form.getValues("pricing_rows") || [];
                                    form.setValue(
                                      "pricing_rows",
                                      currentRows.filter((_, i) => i !== index),
                                    );
                                    setPricingRows(pricingRows.filter((_, i) => i !== index));
                                  }
                                }}
                                disabled={pricingRows.length <= 1}
                                className="h-9 w-9 p-0 border-[#004080]/20"
                                title="Xóa mức giá"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionPanel>

                  <SectionPanel title="Gửi sản phẩm">
                    <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/dashboard")}
                        className="border-[#004080]/20"
                      >
                        Hủy
                      </Button>
                      <Button
                        type="submit"
                        disabled={createProductMutation.isPending}
                        className="bg-[#004080] hover:bg-[#003366] font-semibold min-w-[10rem]"
                      >
                        {createProductMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Đang gửi…
                          </>
                        ) : (
                          <>
                            <Package className="h-4 w-4 mr-2" />
                            Tạo sản phẩm
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center sm:text-right mt-3">
                      <span className="text-red-500">*</span> Trường bắt buộc. Sản phẩm chờ admin duyệt trước khi hiển thị.
                    </p>
                  </SectionPanel>
                </form>
              </Form>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-5">
                <div className="rounded-xl bg-gradient-to-br from-[#004080] to-slate-900 text-white p-5 sm:p-6 border border-[#004080]/20 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 text-white">Mẹo đăng sản phẩm</h3>
                  <ul className="space-y-4">
                    {TIPS.map(({ icon: Icon, title, desc }) => (
                      <li key={title} className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ffcc00]/20 border border-[#ffcc00]/30">
                          <Icon className="h-4 w-4 text-[#ffcc00]" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-white">{title}</div>
                          <p className="text-white/70 text-xs mt-0.5 leading-relaxed">{desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-[#004080]/10 bg-card p-5 uupm-card">
                  <h3 className="text-sm font-semibold mb-3">Quy trình duyệt</h3>
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#004080] text-white text-xs font-bold">1</span>
                      <span className="text-muted-foreground pt-0.5">Gửi form tạo sản phẩm</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#004080] text-white text-xs font-bold">2</span>
                      <span className="text-muted-foreground pt-0.5">Admin kiểm tra nội dung</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#004080] text-white text-xs font-bold">3</span>
                      <span className="text-muted-foreground pt-0.5">Hiển thị trên marketplace</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
