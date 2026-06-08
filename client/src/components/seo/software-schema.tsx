import { useEffect } from "react";

interface SoftwareSchemaProps {
  name: string;
  description: string;
  url: string;
  image?: string;
  operatingSystem?: string[];
  downloadUrl?: string;
}

export function SoftwareSchema({
  name,
  description,
  url,
  image,
  operatingSystem,
  downloadUrl,
}: SoftwareSchemaProps) {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name,
      description,
      url,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: operatingSystem?.join(", ") || "Windows, macOS, Linux",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "VND",
      },
      ...(image && { image }),
      ...(downloadUrl && { downloadUrl }),
    };

    const scriptId = "software-schema-ld";
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
  }, [name, description, url, image, operatingSystem, downloadUrl]);

  return null;
}
