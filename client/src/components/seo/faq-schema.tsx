import { useEffect } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSchemaProps {
  items: FaqItem[];
}

export function FaqSchema({ items }: FaqSchemaProps) {
  useEffect(() => {
    if (!items.length) return;

    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    };

    const scriptId = "faq-schema-ld";
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
  }, [items]);

  return null;
}
