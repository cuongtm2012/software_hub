import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import { Software, Review, InsertReview } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Loader2,
  Download,
  Monitor,
  Calendar,
  ArrowLeft,
  FileText,
  Shield,
  BadgeCheck,
  ClipboardList,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { getShortDescription } from "@/lib/translations";
import { buildSoftwareSeoDescription, buildSoftwareSeoContent, formatSoftwareDisplayTitle, normalizeExternalUrl, resolveDocumentationLink } from "@/lib/software-utils";
import { getUrlSearchParams } from "@/lib/url-search";
import { renderSeoMarkdown, stripImageRefs } from "@/lib/render-seo-markdown";
import { PageMeta } from "@/components/seo/page-meta";
import { SoftwareSchema } from "@/components/seo/software-schema";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import {
  pageContainerClass,
  pageMainClass,
  pageShellClass,
} from "@/components/design-system/tokens";
import { cn } from "@/lib/utils";

interface ReviewWithUser extends Review {
  user_name?: string;
}

type ContentSection = {
  id: string;
  label: string;
  visible: boolean;
};

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-slate-900 text-right">{value}</span>
    </div>
  );
}

function SectionCard({
  id,
  title,
  icon: Icon,
  children,
  className,
}: {
  id: string;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 bg-white rounded-xl border border-[#004080]/10 p-6 sm:p-8 uupm-card",
        className,
      )}
    >
      <h2 className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-slate-900 mb-5">
        {Icon ? <Icon className="h-5 w-5 text-[#004080] shrink-0" /> : null}
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function SoftwareDetailPage() {
  const [, params] = useRoute("/software/:idOrSlug");
  const idOrSlug = params?.idOrSlug;
  const [location, navigate] = useLocation();
  const searchParams = getUrlSearchParams();
  const softwareListUrl = (() => {
    const returnTo = searchParams.get("returnTo");
    if (returnTo === "/software" || returnTo?.startsWith("/software?")) return returnTo;
    return "/software";
  })();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const {
    data: software,
    isLoading: isLoadingSoftware,
    error: softwareError,
  } = useQuery<Software>({
    queryKey: ["/api/softwares", idOrSlug],
    queryFn: async () => {
      const response = await fetch(`/api/softwares/${idOrSlug}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error("Software not found");
        throw new Error("Failed to fetch software");
      }
      return response.json();
    },
    enabled: !!idOrSlug,
  });

  const softwareId = software?.id;

  const { data: reviews, isLoading: isLoadingReviews } = useQuery<ReviewWithUser[]>({
    queryKey: ["/api/reviews/software", softwareId],
    queryFn: async () => {
      if (!softwareId) return [];
      const res = await fetch(`/api/reviews/software/${softwareId}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
    enabled: !!softwareId,
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: InsertReview) => {
      if (!softwareId) throw new Error("Software ID not available");
      const res = await apiRequest("POST", `/api/reviews/software/${softwareId}`, reviewData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Đã gửi đánh giá",
        description: "Đánh giá của bạn đã được gửi thành công.",
      });
      setReviewComment("");
      setUserRating(5);
      if (softwareId) {
        queryClient.invalidateQueries({ queryKey: ["/api/reviews/software", softwareId] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Gửi đánh giá thất bại",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitReview = () => {
    if (!software || !user) return;
    if (!reviewComment.trim()) {
      toast({
        title: "Cần có đánh giá",
        description: "Vui lòng viết nhận xét cho đánh giá của bạn.",
        variant: "destructive",
      });
      return;
    }
    submitReviewMutation.mutate({
      target_type: "software",
      target_id: software.id,
      rating: userRating,
      comment: reviewComment,
    });
  };

  const averageRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  const platformLabels = Array.isArray(software?.platform)
    ? software.platform.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    : [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [idOrSlug]);

  if (isLoadingSoftware) {
    return (
      <div className={pageShellClass}>
        <Header />
        <main className={cn(pageMainClass, "flex items-center justify-center py-24")}>
          <Loader2 className="h-12 w-12 animate-spin text-[#004080]" />
        </main>
        <Footer />
      </div>
    );
  }

  if (softwareError || !software) {
    return (
      <div className={pageShellClass}>
        <Header />
        <main className={cn(pageMainClass, "flex items-center justify-center py-24")}>
          <div className="text-center px-4">
            <Monitor className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy phần mềm</h2>
            <p className="text-gray-600 mb-6">
              Phần mềm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
            <Button onClick={() => navigate(softwareListUrl)} className="bg-[#004080] hover:bg-[#003366]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay về kho phần mềm
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const softwarePath = `/software/${(software as Software & { slug?: string }).slug || software.id}`;
  const softwareUrl = `${window.location.origin}${softwarePath}`;
  const seoDesc = buildSoftwareSeoDescription(
    software as Parameters<typeof buildSoftwareSeoDescription>[0],
  );
  const seoContent = buildSoftwareSeoContent(
    software as Parameters<typeof buildSoftwareSeoContent>[0],
  );

  const hasInstallGuide = Boolean(software.installation_instructions?.trim());
  const hasDetailedGuide = Boolean(seoContent?.trim());

  const contentSections: ContentSection[] = [
    { id: "tong-quan", label: "Tổng quan", visible: Boolean(software.description?.trim()) },
    { id: "cai-dat", label: "Cài đặt", visible: hasInstallGuide },
    { id: "huong-dan", label: "Hướng dẫn chi tiết", visible: hasDetailedGuide },
    { id: "danh-gia", label: "Đánh giá", visible: true },
  ].filter((s) => s.visible);

  const metaRows = [
    software.version ? { label: "Phiên bản", value: software.version } : null,
    software.vendor ? { label: "Nhà phát triển", value: software.vendor } : null,
    software.license ? { label: "Giấy phép", value: software.license } : null,
    platformLabels.length ? { label: "Nền tảng", value: platformLabels.join(" · ") } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const downloadUrl = normalizeExternalUrl(software.download_link);
  const documentationUrl = resolveDocumentationLink(software.documentation_link, software.download_link);
  const displayName = formatSoftwareDisplayTitle(
    stripImageRefs(software.name),
    software.platform,
  );
  const titleSizeClass =
    displayName.length > 48
      ? "text-xl sm:text-2xl lg:text-3xl"
      : displayName.length > 32
        ? "text-xl sm:text-2xl lg:text-[1.75rem]"
        : "text-2xl sm:text-3xl lg:text-4xl";

  const handleExternalLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
    if (e.detail > 1) e.preventDefault();
  };

  return (
    <div className={pageShellClass}>
      <PageMeta
        title={`${software.name} — Tải miễn phí & Hướng dẫn cài đặt`}
        description={seoDesc}
        canonicalUrl={softwareUrl}
        ogImage={software.image_url ?? undefined}
      />
      <SoftwareSchema
        name={software.name}
        description={seoDesc}
        url={softwareUrl}
        image={software.image_url ?? undefined}
        operatingSystem={Array.isArray(software.platform) ? software.platform : undefined}
        downloadUrl={downloadUrl ?? undefined}
      />
      <BreadcrumbSchema
        items={[
          { name: "Trang chủ", url: window.location.origin },
          { name: "Phần mềm", url: `${window.location.origin}/software` },
          { name: software.name, url: softwareUrl },
        ]}
      />
      <Header />

      <main className={pageMainClass}>
        <div className="bg-white border-b border-[#004080]/10">
          <div className={cn(pageContainerClass, "py-3")}>
            <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <button
                type="button"
                onClick={() => navigate(softwareListUrl)}
                className="hover:text-[#004080] transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Phần mềm
              </button>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              <span className="text-slate-900 font-medium truncate max-w-[min(100%,28rem)]">
                {displayName}
              </span>
            </nav>
          </div>
        </div>

        <div className={cn(pageContainerClass, "py-6 sm:py-8")}>
          {/* Hero — title & summary only, no heavy card */}
          <header className="mb-6 sm:mb-8 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-200">
                {software.license || "Miễn phí"}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#004080]/10 text-[#004080]">
                <BadgeCheck className="h-3.5 w-3.5 mr-1" />
                Đã kiểm duyệt
              </span>
              {platformLabels.slice(0, 4).map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600"
                >
                  {p}
                </span>
              ))}
            </div>

            <h1
              className={cn(
                titleSizeClass,
                "font-bold tracking-tight text-balance text-pretty leading-[1.2] break-words text-slate-900 mb-3 max-w-4xl",
              )}
            >
              {displayName}
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mb-4 leading-relaxed break-words">
              {getShortDescription(software.description, 200)}
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <StarRating value={averageRating || 0} size="sm" />
                <span className="font-medium text-slate-700">
                  {averageRating ? averageRating.toFixed(1) : "Chưa có đánh giá"}
                </span>
                {reviews && reviews.length > 0 && (
                  <span>({reviews.length} đánh giá)</span>
                )}
              </div>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Cập nhật {format(new Date(software.created_at), "dd/MM/yyyy")}
              </span>
            </div>
          </header>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 min-w-0">
            {/* Sidebar — actions & metadata */}
            <aside className="w-full lg:w-72 xl:w-80 shrink-0 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24 space-y-4">
                <div className="bg-white rounded-xl border border-[#004080]/10 overflow-hidden uupm-card">
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200">
                    {software.image_url ? (
                      <img
                        src={software.image_url}
                        alt={software.name}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white bg-[#004080]/80 w-16 h-16 rounded-xl flex items-center justify-center">
                          {software.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    {downloadUrl && (
                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Tải xuống ${software.name}`}
                        onClick={handleExternalLinkClick}
                        className="w-full inline-flex items-center justify-center px-5 py-3 text-base font-semibold rounded-lg text-white bg-[#004080] hover:bg-[#003366] transition-colors"
                      >
                        <Download className="h-5 w-5 mr-2" />
                        Tải ngay
                      </a>
                    )}

                    {documentationUrl && (
                      <a
                        href={documentationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Xem tài liệu hướng dẫn"
                        onClick={handleExternalLinkClick}
                        className="w-full inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg border border-[#004080]/15 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Tài liệu chính thức
                      </a>
                    )}
                  </div>
                </div>

                {metaRows.length > 0 && (
                  <div className="bg-white rounded-xl border border-[#004080]/10 p-5 uupm-card space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900">Thông tin</h3>
                    {metaRows.map((row) => (
                      <MetaRow key={row.label} label={row.label} value={row.value} />
                    ))}
                  </div>
                )}

                {contentSections.length > 1 && (
                  <nav className="hidden lg:block bg-white rounded-xl border border-[#004080]/10 p-5 uupm-card">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Mục lục</h3>
                    <ul className="space-y-1">
                      {contentSections.map((section) => (
                        <li key={section.id}>
                          <a
                            href={`#${section.id}`}
                            className="block text-sm text-muted-foreground hover:text-[#004080] py-1.5 transition-colors"
                          >
                            {section.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}
              </div>
            </aside>

            {/* Main content — guide first, reviews last */}
            <div className="flex-1 min-w-0 w-full order-1 lg:order-2 space-y-6">
              {software.description?.trim() && (
                <SectionCard id="tong-quan" title="Tổng quan" icon={Monitor}>
                  <div className="text-slate-700 leading-relaxed prose prose-sm max-w-none break-words [overflow-wrap:anywhere]">
                    {renderSeoMarkdown(software.description)}
                  </div>
                </SectionCard>
              )}

              {hasInstallGuide && (
                <SectionCard id="cai-dat" title="Hướng dẫn cài đặt" icon={Shield}>
                  <div className="prose prose-sm max-w-none text-slate-700">
                    <p className="whitespace-pre-wrap">{software.installation_instructions}</p>
                  </div>
                </SectionCard>
              )}

              {hasDetailedGuide && (
                <SectionCard id="huong-dan" title="Hướng dẫn chi tiết" icon={ClipboardList}>
                  <div className="prose prose-sm max-w-none text-slate-700 break-words [overflow-wrap:anywhere]">
                    {renderSeoMarkdown(seoContent)}
                  </div>
                </SectionCard>
              )}

              <SectionCard id="danh-gia" title="Đánh giá từ cộng đồng" icon={MessageSquare}>
                {user ? (
                  <div className="mb-6 rounded-lg border border-[#004080]/10 p-5 bg-[#f9f9f9]">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">
                      Viết đánh giá của bạn
                    </h3>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm text-muted-foreground">Điểm:</span>
                      <StarRating value={userRating} onChange={setUserRating} readonly={false} />
                    </div>
                    <Textarea
                      placeholder="Chia sẻ trải nghiệm sử dụng..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      className="resize-none mb-3 bg-white"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSubmitReview}
                        disabled={submitReviewMutation.isPending}
                        className="bg-[#004080] hover:bg-[#003366]"
                        size="sm"
                      >
                        {submitReviewMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Gửi đánh giá
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mb-6 text-sm text-muted-foreground">
                    <Button
                      variant="link"
                      className="p-0 h-auto text-[#004080] hover:text-[#003366]"
                      onClick={() => navigate("/auth")}
                    >
                      Đăng nhập
                    </Button>{" "}
                    để viết đánh giá.
                  </p>
                )}

                <div className="space-y-5">
                  {isLoadingReviews ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="h-7 w-7 animate-spin text-[#004080]" />
                    </div>
                  ) : reviews?.length ? (
                    reviews.map((review) => (
                      <article
                        key={review.id}
                        className="border-b border-slate-100 pb-5 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-9 w-9 shrink-0">
                              <AvatarFallback className="text-xs">
                                {getInitials(review.user_name || "User")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 truncate">
                                {review.user_name || "User"}
                              </p>
                              <StarRating value={review.rating} size="sm" />
                            </div>
                          </div>
                          <time className="text-xs text-muted-foreground shrink-0">
                            {format(new Date(review.created_at), "dd/MM/yyyy")}
                          </time>
                        </div>
                        <p className="text-sm text-slate-700 pl-12">{review.comment}</p>
                      </article>
                    ))
                  ) : (
                    <p className="text-center py-6 text-sm text-muted-foreground">
                      Chưa có đánh giá. Hãy là người đầu tiên!
                    </p>
                  )}
                </div>
              </SectionCard>
            </div>
          </div>

          <div className="mt-10">
            <LeadCaptureForm
              source="software_page"
              sourceId={software.id}
              title="Cần hỗ trợ cài đặt hoặc tư vấn IT?"
              description="Team Software Hub hỗ trợ cài đặt phần mềm và tư vấn giải pháp IT cho doanh nghiệp miễn phí."
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
