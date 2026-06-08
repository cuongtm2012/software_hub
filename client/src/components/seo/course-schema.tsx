import { useEffect } from "react";

interface CourseSchemaProps {
  title: string;
  description: string;
  instructor?: string;
  url: string;
  thumbnailUrl?: string;
  level?: string;
  language?: string;
}

export function CourseSchema({
  title,
  description,
  instructor,
  url,
  thumbnailUrl,
  level,
  language = "vi",
}: CourseSchemaProps) {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Course",
      name: title,
      description,
      url,
      inLanguage: language,
      isAccessibleForFree: true,
      provider: {
        "@type": "Organization",
        name: "Software Hub",
        url: window.location.origin,
      },
      ...(instructor && {
        creator: { "@type": "Person", name: instructor },
      }),
      ...(thumbnailUrl && { image: thumbnailUrl }),
      ...(level && {
        educationalLevel: level,
      }),
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "VND",
        availability: "https://schema.org/InStock",
      },
    };

    const scriptId = "course-schema-ld";
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
  }, [title, description, instructor, url, thumbnailUrl, level, language]);

  return null;
}
