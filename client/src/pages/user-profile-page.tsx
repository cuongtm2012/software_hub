import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, type ProfileData } from "@/hooks/use-profile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageHero } from "@/components/design-system/page-hero";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatDateVi, formatVnd } from "@/components/dashboard/format";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  Save,
  Download,
  Star,
  Calendar,
  FileText,
  User,
  Mail,
  Wallet,
  Building2,
  MapPin,
  Phone,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StarRating } from "@/components/ui/star-rating";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  company: z.string().optional(),
  bio: z.string().max(500, "Giới thiệu tối đa 500 ký tự").optional(),
});

const ROLE_LABELS: Record<string, string> = {
  user: "Người dùng",
  buyer: "Người mua",
  seller: "Người bán",
  admin: "Quản trị viên",
  developer: "Lập trình viên",
  client: "Khách hàng",
};

const tabTriggerClass = cn(
  "gap-2 text-sm font-semibold rounded-lg h-10 transition-colors duration-200",
  "text-muted-foreground hover:text-[#004080] hover:bg-[#004080]/5",
  "data-[state=active]:bg-[#004080] data-[state=active]:text-white data-[state=active]:shadow-md",
  "data-[state=active]:hover:bg-[#003366] data-[state=active]:hover:text-white",
  "focus-visible:ring-2 focus-visible:ring-[#004080]/40 focus-visible:ring-offset-2",
);

const inputClass =
  "bg-white border-[#004080]/15 focus-visible:ring-[#004080]/30";

function getProfileField(profileData: unknown, key: string): string {
  if (typeof profileData === "object" && profileData !== null) {
    return String((profileData as Record<string, unknown>)[key] || "");
  }
  return "";
}

export default function UserProfilePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { isProfileLoading, updateProfileMutation } = useProfile();
  const [activeTab, setActiveTab] = useState("profile");

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

  const { data: downloads = [], isLoading: isDownloadsLoading } = useQuery<any[]>({
    queryKey: ["/api/user/downloads"],
    enabled: activeTab === "downloads" && !!user,
  });

  const { data: reviews = [], isLoading: isReviewsLoading } = useQuery<any[]>({
    queryKey: ["/api/user/reviews"],
    enabled: activeTab === "reviews" && !!user,
  });

  useEffect(() => {
    if (user) {
      const profileData = user.profile_data;
      form.reset({
        name: user.name,
        phone: getProfileField(profileData, "phone"),
        address: getProfileField(profileData, "address"),
        company: getProfileField(profileData, "company"),
        bio: getProfileField(profileData, "bio"),
      });
    }
  }, [user, form]);

  const onSubmit = (data: ProfileData) => {
    updateProfileMutation.mutate(data);
  };

  const walletBalance = Number(
    getProfileField(user?.profile_data, "wallet_balance") || 0,
  );
  const roleLabel = ROLE_LABELS[user?.role || "user"] || user?.role;

  if (isProfileLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f9f9f9]">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f9f9f9]">
      <Header />

      <PageHero
        title={
          <>
            Xin chào,{" "}
            <span className="text-[#ffcc00]">{user?.name?.split(" ")[0] || "bạn"}</span>
          </>
        }
        subtitle="Quản lý thông tin cá nhân, tải xuống và đánh giá của bạn"
        badge={roleLabel}
      />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-4">
              <div className="rounded-xl border border-[#004080]/12 bg-white shadow-sm uupm-card overflow-hidden">
                <div className="bg-gradient-to-br from-[#004080] to-[#003566] px-6 py-8 text-center text-white">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/15 ring-2 ring-[#ffcc00]/40">
                    <span className="text-3xl font-semibold">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-white tracking-tight">
                    {user?.name}
                  </p>
                  <p className="text-sm text-white/75 mt-1 flex items-center justify-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    {user?.email}
                  </p>
                  <Badge
                    variant="outline"
                    className="mt-3 border-[#ffcc00]/40 bg-[#ffcc00]/10 text-[#ffcc00] font-medium"
                  >
                    {roleLabel}
                  </Badge>
                </div>

                <div className="p-5 space-y-3 text-sm">
                  {walletBalance > 0 && (
                    <div className="flex items-center justify-between rounded-lg bg-[#004080]/5 px-3 py-2.5">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Wallet className="h-4 w-4 text-[#004080]" />
                        Số dư ví
                      </span>
                      <span className="font-semibold text-[#004080]">
                        {formatVnd(walletBalance)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-muted-foreground pt-1">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Cập nhật
                    </span>
                    <span className="font-medium text-foreground">
                      {user?.updated_at
                        ? formatDateVi(user.updated_at)
                        : "Chưa cập nhật"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#004080]/12 bg-white p-4 shadow-sm uupm-card">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#004080]/70 mb-3">
                  Liên kết nhanh
                </p>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-[#004080] hover:bg-[#004080]/5"
                    onClick={() => navigate("/dashboard")}
                  >
                    Bảng điều khiển
                  </Button>
                  {(user?.role === "buyer" || user?.role === "user") && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-[#004080] hover:bg-[#004080]/5"
                      onClick={() => navigate("/add-funds")}
                    >
                      Nạp tiền ví
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-[#004080] hover:bg-[#004080]/5"
                    onClick={() => navigate("/software")}
                  >
                    Khám phá phần mềm
                  </Button>
                </div>
              </div>
            </aside>

            {/* Main tabs */}
            <div className="lg:col-span-8">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="rounded-xl border border-[#004080]/10 bg-white shadow-sm overflow-hidden uupm-card">
                  <TabsList
                    className={cn(
                      "grid w-full h-auto p-1.5 gap-1.5 rounded-none border-b border-[#004080]/10",
                      "bg-gradient-to-r from-[#004080]/8 via-[#004080]/5 to-transparent",
                      "grid-cols-3",
                    )}
                  >
                    <TabsTrigger value="profile" className={tabTriggerClass}>
                      <User className="h-4 w-4" />
                      Hồ sơ
                    </TabsTrigger>
                    <TabsTrigger value="downloads" className={tabTriggerClass}>
                      <Download className="h-4 w-4" />
                      Tải xuống
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className={tabTriggerClass}>
                      <Star className="h-4 w-4" />
                      Đánh giá
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile" className="mt-0 p-4 sm:p-5">
                    <div className="mb-5">
                      <h3 className="text-base font-semibold text-[#004080]">
                        Chỉnh sửa hồ sơ
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Cập nhật thông tin liên hệ và giới thiệu bản thân
                      </p>
                    </div>
                    <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(onSubmit)}
                          className="space-y-5"
                        >
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Họ và tên</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nguyễn Văn A"
                                    className={inputClass}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5" />
                                    Số điện thoại
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="0901234567"
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
                              name="company"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-1.5">
                                    <Building2 className="h-3.5 w-3.5" />
                                    Công ty
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Tên công ty"
                                      className={inputClass}
                                      {...field}
                                    />
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
                                <FormLabel className="flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5" />
                                  Địa chỉ
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Địa chỉ liên hệ"
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
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Giới thiệu</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Mô tả ngắn về bạn hoặc doanh nghiệp"
                                    className={cn(inputClass, "resize-none h-28")}
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Tối đa 500 ký tự
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex justify-end pt-2">
                            <Button
                              type="submit"
                              size="sm"
                              className="bg-[#004080] hover:bg-[#003366] font-semibold"
                              disabled={updateProfileMutation.isPending}
                            >
                              {updateProfileMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Đang lưu...
                                </>
                              ) : (
                                <>
                                  <Save className="mr-2 h-4 w-4" />
                                  Lưu thay đổi
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                  </TabsContent>

                  <TabsContent value="downloads" className="mt-0 p-4 sm:p-5">
                    <div className="mb-5">
                      <h3 className="text-base font-semibold text-[#004080]">
                        Phần mềm đã tải
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Danh sách phần mềm bạn đã tải từ Software Hub
                      </p>
                    </div>
                      {isDownloadsLoading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-lg" />
                          ))}
                        </div>
                      ) : downloads.length > 0 ? (
                        <ul className="divide-y divide-[#004080]/10">
                          {downloads.map((download: any) => (
                            <li
                              key={download.id}
                              className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 first:pt-0 last:pb-0"
                            >
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-semibold text-[#004080] truncate">
                                    {download.software?.name}
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className="bg-[#004080]/5 border-[#004080]/20 text-[#004080] shrink-0"
                                  >
                                    v{download.version}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {formatDateVi(download.downloaded_at)}
                                </p>
                                {download.software?.platform?.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {download.software.platform.map(
                                      (platform: string, idx: number) => (
                                        <span
                                          key={idx}
                                          className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                                        >
                                          {platform}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="shrink-0 border-[#004080]/30 text-[#004080] hover:bg-[#004080]/5"
                                onClick={() =>
                                  window.open(download.software?.download_link, "_blank")
                                }
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Tải lại
                              </Button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <EmptyState
                          icon={Download}
                          title="Chưa có tải xuống"
                          description="Bạn chưa tải phần mềm nào từ nền tảng."
                          actionLabel="Khám phá phần mềm"
                          onAction={() => navigate("/software")}
                        />
                      )}
                  </TabsContent>

                  <TabsContent value="reviews" className="mt-0 p-4 sm:p-5">
                    <div className="mb-5">
                      <h3 className="text-base font-semibold text-[#004080]">
                        Đánh giá của bạn
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Các nhận xét bạn đã đăng trên phần mềm và sản phẩm
                      </p>
                    </div>
                      {isReviewsLoading ? (
                        <div className="space-y-3">
                          {[1, 2].map((i) => (
                            <Skeleton key={i} className="h-24 w-full rounded-lg" />
                          ))}
                        </div>
                      ) : reviews.length > 0 ? (
                        <ul className="divide-y divide-[#004080]/10">
                          {reviews.map((review: any) => (
                            <li key={review.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <h3 className="font-semibold text-[#004080]">
                                  {review.target_type === "software"
                                    ? "Đánh giá phần mềm"
                                    : "Đánh giá sản phẩm"}
                                </h3>
                                <div className="flex items-center gap-1.5">
                                  <StarRating value={review.rating} />
                                  <span className="text-sm text-muted-foreground">
                                    ({review.rating}/5)
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-foreground/90 leading-relaxed">
                                {review.comment}
                              </p>
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {formatDateVi(review.created_at)}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-[#004080]/20 hover:bg-[#004080]/5"
                                  onClick={() => {
                                    if (review.target_type === "software") {
                                      navigate(`/software/${review.target_id}`);
                                    } else {
                                      navigate(`/marketplace/product/${review.target_id}`);
                                    }
                                  }}
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  Xem mục
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <EmptyState
                          icon={Star}
                          title="Chưa có đánh giá"
                          description="Bạn chưa đăng đánh giá nào trên nền tảng."
                          actionLabel="Khám phá phần mềm"
                          onAction={() => navigate("/software")}
                        />
                      )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
