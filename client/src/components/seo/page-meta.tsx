import { useEffect } from "react";

interface PageMetaProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

function setMetaTag(name: string, content: string, isProperty = false) {
  const attr = isProperty ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLinkTag(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export function PageMeta({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = "website",
  noindex = false,
}: PageMetaProps) {
  useEffect(() => {
    document.title = title;
    setMetaTag("description", description);
    setMetaTag("robots", noindex ? "noindex,nofollow" : "index,follow");
    setMetaTag("og:title", title, true);
    setMetaTag("og:description", description, true);
    setMetaTag("og:type", ogType, true);
    if (canonicalUrl) {
      setMetaTag("og:url", canonicalUrl, true);
      setLinkTag("canonical", canonicalUrl);
    }
    if (ogImage) setMetaTag("og:image", ogImage, true);
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", title);
    setMetaTag("twitter:description", description);
    if (ogImage) setMetaTag("twitter:image", ogImage);
  }, [title, description, canonicalUrl, ogImage, ogType, noindex]);

  return null;
}
