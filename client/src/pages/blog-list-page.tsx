import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageMeta } from "@/components/seo/page-meta";
import { PageHero } from "@/components/design-system/page-hero";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBlogDate, getDisplayTags, estimateReadingTimeMinutes } from "@/lib/blog-display";
import { Calendar, Clock, Tag, User } from "lucide-react";

export default function BlogListPage() {
  const [, navigate] = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/blog"],
    queryFn: async () => {
      const res = await fetch("/api/blog?limit=20");
      if (!res.ok) throw new Error("Failed to fetch blog posts");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col overflow-x-hidden">
      <PageMeta
        title="Blog IT — Lộ trình học lập trình miễn phí | Software Hub"
        description="Đọc các bài viết lộ trình học lập trình, hướng dẫn IT và tips cho sinh viên, người mới bắt đầu."
        canonicalUrl={`${window.location.origin}/blog`}
      />
      <Header />

      <PageHero
        badge="Software Hub Blog"
        title="Blog IT"
        subtitle="Lộ trình học, hướng dẫn và kinh nghiệm thực chiến cho developer Việt Nam"
        align="centered"
      />

      <main className="min-w-0 flex-grow overflow-x-hidden">
        <div className="w-full min-w-0 max-w-full px-[4%] py-10 sm:py-12">
          {isLoading ? (
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border bg-white overflow-hidden">
                  <Skeleton className="h-48 w-full rounded-none" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : !data?.posts?.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-slate-600">Chưa có bài viết nào.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {data.posts.map((post: any) => {
                const displayTags = getDisplayTags(post.tags);
                const readingMinutes = estimateReadingTimeMinutes(post.content || post.excerpt || "");

                return (
                  <article
                    key={post.id}
                    onClick={() => navigate(`/blog/${post.slug}`)}
                    className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#004080]/20 hover:shadow-lg"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      {post.cover_image ? (
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#004080]/10 to-[#004080]/5">
                          <span className="text-4xl font-bold text-[#004080]/20">SH</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>

                    <div className="p-5 sm:p-6">
                      {displayTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {displayTags.slice(0, 2).map((tag: string) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 rounded-full bg-[#004080]/8 px-2.5 py-0.5 text-xs font-medium text-[#004080]"
                            >
                              <Tag className="h-3 w-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <h2 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-[#004080] transition-colors">
                        {post.title}
                      </h2>

                      <p className="text-slate-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                        {post.excerpt || post.seo_description}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.author_name || "Software Hub"}
                        </span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatBlogDate(post.published_at || post.created_at)}
                        </span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {readingMinutes} phút
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
