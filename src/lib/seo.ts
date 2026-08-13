import type { Metadata } from "next";
import { siteConfig } from "./site";
import type { Locale } from "@/i18n/routing";

type BuildMetadataInput = {
  locale: Locale;
  pathname: string;
  title: string;
  description: string;
  image?: string | null;
};

function absoluteUrl(path: string) {
  if (!path) return siteConfig.url;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildMetadata({
  locale,
  pathname,
  title,
  description,
  image,
}: BuildMetadataInput): Metadata {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const pathWithoutLocale =
    normalizedPath === "/"
      ? ""
      : normalizedPath.replace(/^\/(en|es)/, "") || "";

  const enPath = `/en${pathWithoutLocale || ""}`;
  const esPath = `/es${pathWithoutLocale || ""}`;
  const canonicalPath = `/${locale}${pathWithoutLocale || ""}`;

  const canonical = absoluteUrl(canonicalPath);
  const enUrl = absoluteUrl(enPath);
  const esUrl = absoluteUrl(esPath);
  const ogImage = image ? absoluteUrl(image) : absoluteUrl(siteConfig.ogImage);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: enUrl,
        es: esUrl,
        "x-default": enUrl,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: locale === "es" ? "es_ES" : "en_US",
      alternateLocale: locale === "es" ? ["en_US"] : ["es_ES"],
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
