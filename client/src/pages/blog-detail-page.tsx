import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageMeta } from "@/components/seo/page-meta";
import { ArticleSchema } from "@/components/seo/article-schema";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Loader2, Tag, User } from "lucide-react";

function renderContent(content: string) {
  return content.split("\n").map((line, i) => {
    if (line.startsWith("## ")) {
      return (
        <h2 key={i} className="text-2xl font-bold text-gray-900 mt-8 mb-4">
          {line.replace("## ", "")}
        </h2>
      );
    }
    if (line.startsWith("### ")) {
      return (
        <h3 key={i} className="text-xl font-semibold text-gray-900 mt-6 mb-3">
          {line.replace("### ", "")}
        </h3>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <li key={i} className="text-gray-700 ml-4 list-disc mb-1">
          {line.replace("- ", "")}
        </li>
      );
    }
    if (line.trim() === "") return <br key={i} />;
    return (
      <p key={i} className="text-gray-700 leading-relaxed mb-4 text-lg">
        {line}
      </p>
    );
  });
}

export default function BlogDetailPage() {
  const [, params] = useRoute("/blog/:slug");
  const [, navigate] = useLocation();
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Không tìm thấy bài viết</h2>
            <Button onClick={() => navigate("/blog")}>
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
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
        authorName={post.author_name}
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

      <main className="flex-grow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" onClick={() => navigate("/blog")} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại blog
          </Button>

          {post.cover_image && (
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-64 md:h-80 object-cover rounded-xl mb-8"
            />
          )}

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {post.author_name || "Software Hub"}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.published_at || post.created_at).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          <article className="prose prose-lg max-w-none mb-12">
            {renderContent(post.content)}
          </article>

          <LeadCaptureForm
            source="blog_page"
            sourceId={post.slug}
            title="Cần team code project cho bạn?"
            description="Để lại thông tin, Software Hub Studio sẽ tư vấn miễn phí về web, app, CRM cho doanh nghiệp của bạn."
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
