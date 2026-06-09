import { useEffect } from "react";
import {
  SITE_NAME,
  DEFAULT_LOCALE,
  absoluteUrl,
  defaultOgImage,
} from "@/lib/seo-config";

interface PageMetaProps {
  title: string;
  description: string;
  /** Full canonical URL */
  canonicalUrl?: string;
  /** Relative or absolute path — alias for canonicalUrl */
  url?: string;
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

function resolveCanonical(canonicalUrl?: string, url?: string): string | undefined {
  if (canonicalUrl) return canonicalUrl;
  if (!url) return undefined;
  return url.startsWith("http") ? url : absoluteUrl(url);
}

export function PageMeta({
  title,
  description,
  canonicalUrl,
  url,
  ogImage,
  ogType = "website",
  noindex = false,
}: PageMetaProps) {
  const resolvedCanonical = resolveCanonical(canonicalUrl, url);
  const resolvedOgImage = ogImage || defaultOgImage();
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  useEffect(() => {
    document.documentElement.lang = "vi";
    document.title = fullTitle;
    setMetaTag("description", description);
    setMetaTag("robots", noindex ? "noindex,nofollow" : "index,follow");
    setMetaTag("og:title", fullTitle, true);
    setMetaTag("og:description", description, true);
    setMetaTag("og:type", ogType, true);
    setMetaTag("og:site_name", SITE_NAME, true);
    setMetaTag("og:locale", DEFAULT_LOCALE, true);
    setMetaTag("og:image", resolvedOgImage, true);
    if (resolvedCanonical) {
      setMetaTag("og:url", resolvedCanonical, true);
      setLinkTag("canonical", resolvedCanonical);
    }
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", fullTitle);
    setMetaTag("twitter:description", description);
    setMetaTag("twitter:image", resolvedOgImage);
  }, [fullTitle, description, resolvedCanonical, resolvedOgImage, ogType, noindex]);

  return null;
}
