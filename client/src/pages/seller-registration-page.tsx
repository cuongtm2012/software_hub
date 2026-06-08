import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
// @ts-ignore - vietqr doesn't have TypeScript definitions
import { VietQR } from "vietqr";
import { Layout } from "@/components/layout";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Store,
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  Building2,
  CreditCard,
  FileText,
  Mail,
  Phone,
  AlertCircle,
  ArrowLeft,
  Loader2,
  BadgeCheck,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { VerificationDocumentUploader } from "@/components/VerificationDocumentUploader";
import { cn } from "@/lib/utils";

interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
}

const sellerRegistrationSchema = z.object({
  business_name: z.string().min(2, "Vui lòng nhập tên cửa hàng / doanh nghiệp"),
  contact_phone: z.string().min(10, "Số điện thoại phải có ít nhất 10 ký tự"),
  contact_email: z.string().email("Email không hợp lệ"),
  business_address: z.string().min(10, "Địa chỉ phải có ít nhất 10 ký tự"),
  tax_id: z.string().min(1, "Vui lòng nhập mã số thuế / số đăng ký"),
  bank_code: z.string().min(1, "Vui lòng chọn ngân hàng"),
  bank_name: z.string().min(2, "Tên ngân hàng là bắt buộc"),
  account_number: z.string().min(5, "Số tài khoản phải có ít nhất 5 ký tự"),
  account_holder_name: z.string().min(2, "Vui lòng nhập tên chủ tài khoản"),
  terms_accepted: z.boolean().refine((val) => val === true, {
    message: "Bạn cần đồng ý với điều khoản Seller",
  }),
});

type SellerRegistrationForm = z.infer<typeof sellerRegistrationSchema>;

const inputClass =
  "border-[#004080]/15 bg-white focus-visible:ring-[#004080]/30 h-11";

const vietQR = new VietQR({
  clientID: "27f69663-48e7-430e-88a5-c5f4ae1fbbe5",
  apiKey: "64c1060c-098a-4b19-b272-d56f12e70583",
});

const STEPS = [
  { n: 1, title: "Thông tin doanh nghiệp", desc: "Tên cửa hàng, liên hệ & địa chỉ" },
  { n: 2, title: "Giấy tờ xác minh", desc: "CMND/CCCD & thông tin ngân hàng" },
  { n: 3, title: "Tài khoản thanh toán", desc: "Nhận doanh thu từ marketplace" },
  { n: 4, title: "Gửi duyệt", desc: "Admin xem xét trong 1–2 ngày làm việc" },
];

const BENEFITS = [
  {
    icon: Store,
    title: "Bán trên marketplace",
    desc: "Tiếp cận hàng ngàn khách hàng tìm phần mềm & giải pháp số",
  },
  {
    icon: Wallet,
    title: "Thanh toán minh bạch",
    desc: "Doanh thu chuyển thẳng vào tài khoản ngân hàng đã đăng ký",
  },
  {
    icon: TrendingUp,
    title: "Theo dõi hiệu suất",
    desc: "Dashboard riêng để quản lý sản phẩm, đơn hàng & doanh số",
  },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "verified") {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Đã xác minh
      </Badge>
    );
  }
  if (status === "pending") {
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200">
        <Clock className="h-3 w-3 mr-1" />
        Đang chờ duyệt
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-800 border-red-200">
      <XCircle className="h-3 w-3 mr-1" />
      Bị từ chối
    </Badge>
  );
}

export default function SellerRegistrationPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [uploadedDocuments, setUploadedDocuments] = useState<
    { fileKey: string; originalName: string; downloadUrl: string }[]
  >([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);

  const form = useForm<SellerRegistrationForm>({
    resolver: zodResolver(sellerRegistrationSchema),
    defaultValues: {
      business_name: "",
      contact_phone: user?.phone || "",
      contact_email: user?.email || "",
      business_address: "",
      tax_id: "",
      bank_code: "",
      bank_name: "",
      account_number: "",
      account_holder_name: "",
      terms_accepted: false,
    },
  });

  useEffect(() => {
    const loadBanks = async () => {
      try {
        setIsLoadingBanks(true);
        const banksList = await vietQR.getBanks();
        setBanks((banksList as { data?: Bank[] }).data || []);
      } catch (error) {
        console.error("Error loading banks:", error);
        toast({
          title: "Không tải được danh sách ngân hàng",
          description: "Vui lòng tải lại trang.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingBanks(false);
      }
    };
    loadBanks();
  }, [toast]);

  const handleBankSelect = (bankCode: string) => {
    const selectedBank = banks.find((bank) => bank.code === bankCode);
    if (selectedBank) {
      form.setValue("bank_code", bankCode);
      form.setValue("bank_name", selectedBank.shortName);
    }
  };

  const { data: sellerProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/seller/profile"],
    enabled: !!user,
  });

  const registerMutation = useMutation({
    mutationFn: async (data: SellerRegistrationForm) => {
      const bankAccount = JSON.stringify({
        bank_code: data.bank_code,
        bank_name: data.bank_name,
        account_number: data.account_number,
        account_holder_name: data.account_holder_name,
      });

      return apiRequest("POST", "/api/seller/register", {
        business_name: data.business_name,
        business_type: "individual",
        tax_id: data.tax_id,
        business_address: data.business_address,
        bank_account: bankAccount,
        verification_documents: uploadedDocuments.map((f) => f.fileKey),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/profile"] });
      setIsSubmitted(true);
      toast({
        title: "Đã gửi đăng ký",
        description: "Hồ sơ Seller của bạn đang được xem xét.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gửi thất bại",
        description: error.message || "Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SellerRegistrationForm) => {
    if (!data.terms_accepted) {
      toast({
        title: "Cần đồng ý điều khoản",
        description: "Vui lòng đồng ý với điều khoản Seller để tiếp tục.",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate(data);
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center bg-[#f9f9f9] px-4 py-16">
          <Card className="max-w-md w-full uupm-card border-[#004080]/10">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#004080]/8">
                <Shield className="h-7 w-7 text-[#004080]" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Cần đăng nhập</h2>
              <p className="text-muted-foreground mb-6 text-sm">
                Đăng nhập để đăng ký trở thành Seller trên Software Hub.
              </p>
              <Button
                onClick={() => navigate("/auth")}
                className="bg-[#004080] hover:bg-[#003366] w-full"
              >
                Đăng nhập
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (profileLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center bg-[#f9f9f9]">
          <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
        </div>
      </Layout>
    );
  }

  if (isSubmitted) {
    return (
      <Layout>
        <PageHero
          align="centered"
          badge="Đăng ký Seller"
          title="Đã gửi hồ sơ thành công!"
          subtitle="Cảm ơn bạn đã đăng ký. Team sẽ xem xét và phản hồi qua email trong 1–2 ngày làm việc."
        />
        <div className="bg-[#f9f9f9] px-4 py-12">
          <Card className="max-w-lg mx-auto uupm-card border-[#004080]/10">
            <CardContent className="p-8 text-center space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-9 w-9 text-emerald-600" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Trong thời gian chờ duyệt, bạn vẫn có thể thêm sản phẩm — mỗi sản phẩm sẽ được admin duyệt riêng trước khi hiển thị.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => navigate("/seller/products/new")}
                  className="border-[#004080]/20"
                >
                  Thêm sản phẩm ngay
                </Button>
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="bg-[#004080] hover:bg-[#003366]"
                >
                  Về bảng điều khiển
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if ((sellerProfile as { seller_profile?: { verification_status: string; business_name?: string } })?.seller_profile) {
    const profile = (sellerProfile as { seller_profile: { verification_status: string; business_name?: string } }).seller_profile;
    return (
      <Layout>
        <PageHero
          badge="Hồ sơ Seller"
          title={profile.business_name || "Seller của bạn"}
          subtitle="Theo dõi trạng thái xác minh tài khoản bán hàng"
          actions={<StatusBadge status={profile.verification_status} />}
        />
        <div className="bg-[#f9f9f9] px-4 py-8 sm:py-10">
          <div className="max-w-2xl mx-auto space-y-5">
            {profile.verification_status === "verified" && (
              <Alert className="border-emerald-200 bg-emerald-50">
                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-900">
                  Tài khoản đã được xác minh. Bạn có thể bán và nhận thanh toán bình thường.
                </AlertDescription>
              </Alert>
            )}
            {profile.verification_status === "pending" && (
              <Alert className="border-amber-200 bg-amber-50">
                <Clock className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-900">
                  Hồ sơ đang được duyệt (thường 1–2 ngày làm việc). Bạn vẫn có thể thêm sản phẩm trong lúc chờ.
                </AlertDescription>
              </Alert>
            )}
            {profile.verification_status === "rejected" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Hồ sơ bị từ chối. Vui lòng liên hệ hỗ trợ để được hướng dẫn gửi lại.
                </AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-[#004080] hover:bg-[#003366] flex-1"
              >
                Về bảng điều khiển
              </Button>
              {(profile.verification_status === "verified" || profile.verification_status === "pending") && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/seller/products/new")}
                  className="flex-1 border-[#004080]/20"
                >
                  Thêm sản phẩm
                </Button>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHero
        badge="Marketplace"
        title="Đăng ký Seller"
        subtitle="Hoàn tất hồ sơ để bán phần mềm, nhận thanh toán và quản lý cửa hàng trên Software Hub."
      />

      <div className="bg-[#f9f9f9]">
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
            {/* Form */}
            <div className="lg:col-span-2 space-y-5">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <SectionPanel
                    title="Thông tin doanh nghiệp"
                    subtitle="Thông tin hiển thị với khách hàng và dùng để xác minh"
                  >
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="business_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Tên cửa hàng / doanh nghiệp <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="VD: ABC Software Store"
                                  className={cn(inputClass, "pl-10")}
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="contact_phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Số điện thoại <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="0901234567"
                                    className={cn(inputClass, "pl-10")}
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="contact_email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email liên hệ</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    className={cn(inputClass, "pl-10 bg-muted/40")}
                                    disabled
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="business_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Địa chỉ kinh doanh <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                                className="min-h-[88px] border-[#004080]/15 focus-visible:ring-[#004080]/30 resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tax_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Mã số thuế / Số đăng ký <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="MST hoặc số GPKD"
                                  className={cn(inputClass, "pl-10")}
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </SectionPanel>

                  <SectionPanel
                    title="Giấy tờ xác minh"
                    subtitle="Tải lên 3 tài liệu để xác minh danh tính và tài khoản ngân hàng"
                  >
                    <VerificationDocumentUploader
                      onFilesUploaded={setUploadedDocuments}
                    />
                  </SectionPanel>

                  <SectionPanel
                    title="Tài khoản nhận thanh toán"
                    subtitle="Doanh thu từ đơn hàng sẽ được chuyển vào tài khoản này"
                  >
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="bank_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Ngân hàng <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleBankSelect(value);
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className={inputClass}>
                                  <SelectValue
                                    placeholder={
                                      isLoadingBanks ? "Đang tải ngân hàng…" : "Chọn ngân hàng"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-60">
                                {isLoadingBanks ? (
                                  <SelectItem value="loading" disabled>
                                    Đang tải…
                                  </SelectItem>
                                ) : banks.length > 0 ? (
                                  banks.map((bank) => (
                                    <SelectItem key={bank.code} value={bank.code}>
                                      {bank.shortName} — {bank.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="none" disabled>
                                    Không có dữ liệu ngân hàng
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bank_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên ngân hàng</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Tự động điền khi chọn ngân hàng"
                                className={cn(inputClass, "bg-muted/40")}
                                readOnly
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="account_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Số tài khoản <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="1234567890"
                                    className={cn(inputClass, "pl-10")}
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="account_holder_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Tên chủ tài khoản <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="NGUYEN VAN A"
                                  className={inputClass}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </SectionPanel>

                  <SectionPanel title="Xác nhận & gửi hồ sơ">
                    <div className="space-y-5">
                      <FormField
                        control={form.control}
                        name="terms_accepted"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-lg border border-[#004080]/10 bg-[#004080]/[0.03] p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="mt-0.5 border-[#004080]/30 data-[state=checked]:bg-[#004080]"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-snug">
                              <FormLabel className="text-sm font-medium cursor-pointer">
                                Tôi đồng ý với Điều khoản Seller của Software Hub
                              </FormLabel>
                              <p className="text-xs text-muted-foreground">
                                Bao gồm chính sách hoa hồng, quy trình thanh toán và tiêu chuẩn sản phẩm trên marketplace.
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />

                      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate("/dashboard")}
                          className="sm:flex-1 border-[#004080]/20"
                        >
                          Hủy
                        </Button>
                        <Button
                          type="submit"
                          disabled={registerMutation.isPending || !form.watch("terms_accepted")}
                          className="sm:flex-[2] bg-[#004080] hover:bg-[#003366] font-semibold disabled:opacity-60"
                        >
                          {registerMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Đang gửi…
                            </>
                          ) : (
                            <>
                              <FileText className="h-4 w-4 mr-2" />
                              Gửi đăng ký Seller
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-center text-muted-foreground">
                        <span className="text-red-500">*</span> Trường bắt buộc. Hồ sơ thường được duyệt trong 1–2 ngày làm việc.
                      </p>
                    </div>
                  </SectionPanel>
                </form>
              </Form>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-5">
                <div className="rounded-xl bg-gradient-to-br from-[#004080] to-slate-900 text-white p-5 sm:p-6 border border-[#004080]/20 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 text-white">Lợi ích khi trở thành Seller</h3>
                  <ul className="space-y-4">
                    {BENEFITS.map(({ icon: Icon, title, desc }) => (
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

                <div className="rounded-xl border border-[#004080]/10 bg-card p-5 sm:p-6 uupm-card">
                  <h3 className="text-base font-semibold mb-4">Quy trình đăng ký</h3>
                  <ol className="space-y-0">
                    {STEPS.map((step, i) => (
                      <li key={step.n} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#004080] text-white text-xs font-bold">
                            {step.n}
                          </div>
                          {i < STEPS.length - 1 && (
                            <div className="w-px flex-1 min-h-[1.25rem] bg-[#004080]/15 my-1" />
                          )}
                        </div>
                        <div className={cn("pb-4", i === STEPS.length - 1 && "pb-0")}>
                          <div className="font-medium text-sm">{step.title}</div>
                          <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
