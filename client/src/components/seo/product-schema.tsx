import { useEffect } from "react";
import { SITE_NAME } from "@/lib/seo-config";

interface ProductSchemaProps {
  name: string;
  description: string;
  url: string;
  image?: string;
  price?: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
}

export function ProductSchema({
  name,
  description,
  url,
  image,
  price,
  currency = "VND",
  rating,
  reviewCount,
}: ProductSchemaProps) {
  useEffect(() => {
    const schema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Product",
      name,
      description,
      url,
      brand: { "@type": "Brand", name: SITE_NAME },
      ...(image && { image }),
      ...(price != null && {
        offers: {
          "@type": "Offer",
          price: String(price),
          priceCurrency: currency,
          availability: "https://schema.org/InStock",
          url,
        },
      }),
      ...(rating != null &&
        reviewCount != null &&
        reviewCount > 0 && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: String(rating),
            reviewCount,
          },
        }),
    };

    const scriptId = "product-schema-ld";
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
  }, [name, description, url, image, price, currency, rating, reviewCount]);

  return null;
}
