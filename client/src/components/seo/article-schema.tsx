import { useEffect } from "react";

interface ArticleSchemaProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  authorName?: string;
  publishedAt?: string;
  modifiedAt?: string;
}

export function ArticleSchema({
  title,
  description,
  url,
  image,
  authorName = "Software Hub",
  publishedAt,
  modifiedAt,
}: ArticleSchemaProps) {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      url,
      ...(image && { image }),
      author: { "@type": "Person", name: authorName },
      publisher: {
        "@type": "Organization",
        name: "Software Hub",
        url: window.location.origin,
      },
      ...(publishedAt && { datePublished: publishedAt }),
      ...(modifiedAt && { dateModified: modifiedAt }),
    };

    const scriptId = "article-schema-ld";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [title, description, url, image, authorName, publishedAt, modifiedAt]);

  return null;
}
