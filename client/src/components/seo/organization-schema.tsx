import { useEffect } from "react";
import { SITE_NAME, getSiteUrl } from "@/lib/seo-config";

/** Sitewide Organization + WebSite schema — helps AI/search engines understand the entity. */
export function OrganizationSchema() {
  useEffect(() => {
    const origin = getSiteUrl();
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${origin}/#organization`,
          name: SITE_NAME,
          url: origin,
          logo: `${origin}/icon-192x192.svg`,
          description:
            "Nền tảng khóa học IT miễn phí, kho phần mềm và marketplace số cho sinh viên, developer và SME Việt Nam.",
          sameAs: [],
        },
        {
          "@type": "WebSite",
          "@id": `${origin}/#website`,
          url: origin,
          name: SITE_NAME,
          publisher: { "@id": `${origin}/#organization` },
          inLanguage: "vi",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${origin}/courses?search={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        },
      ],
    };

    const scriptId = "organization-schema-ld";
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
  }, []);

  return null;
}
