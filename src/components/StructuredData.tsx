import { siteConfig } from "@/lib/site";

type JsonLd = Record<string, unknown>;

type BreadcrumbItem = {
  name: string;
  path: string;
};

function serialize(data: JsonLd) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function absoluteUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function StructuredData({ data }: { data: JsonLd }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  );
}

export function buildSiteStructuredData(): JsonLd {
  const organizationId = `${siteConfig.url}/#organization`;
  const personId = `${siteConfig.url}/#gerardo-santiago`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        publisher: { "@id": organizationId },
        inLanguage: ["en", "es"],
      },
      {
        "@type": "Organization",
        "@id": organizationId,
        name: siteConfig.name,
        url: siteConfig.url,
        description:
          "International architecture and design studio focused on organic architecture integrated with landscape, residential, hospitality, masterplanning, and development.",
        email: siteConfig.email,
        sameAs: [siteConfig.instagram.url],
        founder: { "@id": personId },
      },
      {
        "@type": "Person",
        "@id": personId,
        name: "Gerardo Santiago Pineda",
        worksFor: { "@id": organizationId },
      },
    ],
  };
}

export function buildBreadcrumbStructuredData(
  items: BreadcrumbItem[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
