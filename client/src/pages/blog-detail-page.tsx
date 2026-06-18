import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageMeta } from "@/components/seo/page-meta";
import { ArticleSchema } from "@/components/seo/article-schema";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { PageHero } from "@/components/design-system/page-hero";
import { BlogContentView } from "@/components/blog-content-view";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  estimateReadingTimeMinutes,
  formatBlogDate,
  getAuthorInitials,
  getDisplayTags,
  getSourceLabel,
} from "@/lib/blog-display";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  ExternalLink,
  Share2,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const pageShell = "min-h-screen bg-[#f9f9f9] flex flex-col";
const articleWidth = "mx-auto w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl";

function BlogDetailSkeleton() {
  return (
    <div className={pageShell}>
      <Header />
      <div className="h-[280px] bg-slate-200 animate-pulse" />
      <main className="flex-grow px-[4%] py-8">
        <div className={cn(articleWidth, "space-y-4")}>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function TagPills({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full border border-[#004080]/15 bg-[#004080]/8 px-3 py-1 text-xs font-medium text-[#004080]"
        >
          <Tag className="h-3 w-3" />
          {tag}
        </span>
      ))}
    </div>
  );
}

function ArticleMeta({
  authorName,
  publishedLabel,
  readingMinutes,
  sourceLabel,
  variant = "light",
}: {
  authorName: string;
  publishedLabel: string;
  readingMinutes: number;
  sourceLabel: string | null;
  variant?: "light" | "dark";
}) {
  const onDark = variant === "dark";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-5 gap-y-3 text-sm",
        onDark ? "text-white/85" : "text-slate-600",
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold",
            onDark ? "bg-white/15 text-[#ffcc00]" : "bg-[#004080] text-[#ffcc00]",
          )}
        >
          {getAuthorInitials(authorName)}
        </div>
        <span className={cn("font-medium", onDark ? "text-white" : "text-slate-800")}>
          {authorName}
        </span>
      </div>
      <span className="flex items-center gap-1.5">
        <Calendar className={cn("h-4 w-4", onDark ? "text-[#ffcc00]/90" : "text-[#004080]/70")} />
        {publishedLabel}
      </span>
      <span className="flex items-center gap-1.5">
        <Clock className={cn("h-4 w-4", onDark ? "text-[#ffcc00]/90" : "text-[#004080]/70")} />
        {readingMinutes} phút đọc
      </span>
      {sourceLabel && (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs",
            onDark ? "bg-white/10 text-white/90" : "bg-slate-100 text-slate-600",
          )}
        >
          <ExternalLink className="h-3 w-3" />
          Nguồn: {sourceLabel}
        </span>
      )}
    </div>
  );
}

export default function BlogDetailPage() {
  const [, params] = useRoute("/blog/:slug");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const slug = params?.slug;

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["/api/blog", slug],
    queryFn: async () => {
      const res = await fetch(`/api/blog/${slug}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!slug,
  });

  const shareArticle = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Đã sao chép link bài viết" });
    } catch {
      toast({ title: "Không sao chép được link", variant: "destructive" });
    }
  };

  if (isLoading) return <BlogDetailSkeleton />;

  if (error || !post) {
    return (
      <div className={pageShell}>
        <Header />
        <main className="flex-grow flex items-center justify-center px-4 py-24">
          <div className="text-center max-w-sm">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Không tìm thấy bài viết</h2>
            <p className="text-slate-600 mb-6 text-sm">
              Bài viết có thể đã bị gỡ hoặc đường dẫn không đúng.
            </p>
            <Button onClick={() => navigate("/blog")} className="bg-[#004080] hover:bg-[#003366]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại blog
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const canonicalUrl = `${window.location.origin}/blog/${post.slug}`;
  const description = post.seo_description || post.excerpt || post.title;
  const displayTags = getDisplayTags(post.tags);
  const sourceLabel = getSourceLabel(post.tags);
  const authorName = post.author_name || "Software Hub";
  const publishedLabel = formatBlogDate(post.published_at || post.created_at);
  const readingMinutes = estimateReadingTimeMinutes(post.content);
  const hasCover = Boolean(post.cover_image);

  return (
    <div className={pageShell}>
      <PageMeta
        title={`${post.title} | Software Hub Blog`}
        description={description}
        canonicalUrl={canonicalUrl}
        ogImage={post.cover_image}
        ogType="article"
      />
      <ArticleSchema
        title={post.title}
        description={description}
        url={canonicalUrl}
        image={post.cover_image}
        authorName={authorName}
        publishedAt={post.published_at}
        modifiedAt={post.updated_at}
      />
      <BreadcrumbSchema
        items={[
          { name: "Trang chủ", url: window.location.origin },
          { name: "Blog", url: `${window.location.origin}/blog` },
          { name: post.title, url: canonicalUrl },
        ]}
      />

      <Header />

      <div className="bg-white border-b border-[#004080]/10">
        <div className="w-full px-[4%] py-3">
          <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground max-w-5xl mx-auto">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="hover:text-[#004080] transition-colors"
            >
              Trang chủ
            </button>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <button
              type="button"
              onClick={() => navigate("/blog")}
              className="hover:text-[#004080] transition-colors inline-flex items-center gap-1"
            >
              Blog
            </button>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span className="text-slate-900 font-medium truncate max-w-[min(100%,28rem)]">
              {post.title}
            </span>
          </nav>
        </div>
      </div>

      {hasCover ? (
        <section className="relative h-[min(52vw,420px)] min-h-[260px] max-h-[480px] overflow-hidden">
          <img
            src={post.cover_image}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#001a33]/95 via-[#004080]/55 to-[#004080]/20" />
          <div className="relative flex h-full flex-col justify-end px-[4%] pb-10 sm:pb-12">
            <div className={cn(articleWidth, "space-y-4")}>
              {displayTags.length > 0 && <TagPills tags={displayTags.slice(0, 4)} />}
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.15] tracking-tight text-white text-balance">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              <ArticleMeta
                authorName={authorName}
                publishedLabel={publishedLabel}
                readingMinutes={readingMinutes}
                sourceLabel={sourceLabel}
                variant="dark"
              />
            </div>
          </div>
        </section>
      ) : (
        <PageHero
          badge="Blog IT"
          title={post.title}
          subtitle={post.excerpt || undefined}
          align="centered"
        />
      )}

      <main className="flex-grow">
        <div className="w-full px-[4%] py-8 sm:py-10">
          <div className={articleWidth}>
            <article
              className={cn(
                "rounded-2xl border border-slate-200/80 bg-white shadow-sm",
                hasCover ? "-mt-6 relative z-10 px-6 py-8 sm:px-10 sm:py-10" : "px-6 py-8 sm:px-10 sm:py-10",
              )}
            >
              {!hasCover && (
                <header className="mb-8 space-y-5 border-b border-slate-100 pb-8">
                  {displayTags.length > 0 && <TagPills tags={displayTags} />}
                  <ArticleMeta
                    authorName={authorName}
                    publishedLabel={publishedLabel}
                    readingMinutes={readingMinutes}
                    sourceLabel={sourceLabel}
                  />
                </header>
              )}

              <div className="mb-8 flex items-center justify-between gap-3 border-b border-slate-100 pb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/blog")}
                  className="text-slate-600 hover:text-[#004080] -ml-2"
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Tất cả bài viết
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareArticle}
                  className="border-[#004080]/20 text-[#004080] hover:bg-[#004080]/5"
                >
                  <Share2 className="mr-1.5 h-4 w-4" />
                  Chia sẻ
                </Button>
              </div>

              <BlogContentView content={post.content} className="prose-lg prose-slate dark:prose-invert" />
            </article>

            <section className="mt-10 sm:mt-12">
              <LeadCaptureForm
                source="blog_page"
                sourceId={post.slug}
                title="Cần team code project cho bạn?"
                description="Để lại thông tin, Software Hub Studio sẽ tư vấn miễn phí về web, app, CRM cho doanh nghiệp của bạn."
              />
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
