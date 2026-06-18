import { getBlogContentHtml } from "@/lib/blog-content";
import { cn } from "@/lib/utils";

interface BlogContentViewProps {
  content: string;
  className?: string;
}

export function BlogContentView({ content, className }: BlogContentViewProps) {
  const html = getBlogContentHtml(content);

  return (
    <div
      className={cn("blog-content prose max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
