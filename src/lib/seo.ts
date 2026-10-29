import type { Metadata } from "next";
import { siteConfig } from "./site";
import type { Locale } from "@/i18n/routing";

type BuildMetadataInput = {
  locale: Locale;
  pathname: string;
  title: string;
  description: string;
  image?: string | null;
  imageAlt?: string;
  absoluteTitle?: boolean;
  /** Optional query string beginning with `?`, included on canonical and hreflang URLs. */
  search?: string;
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
  imageAlt,
  absoluteTitle = false,
  search,
}: BuildMetadataInput): Metadata {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const pathWithoutLocale =
    normalizedPath === "/"
      ? ""
      : normalizedPath.replace(/^\/(en|es)/, "") || "";

  const enPath = `/en${pathWithoutLocale || ""}`;
  const esPath = `/es${pathWithoutLocale || ""}`;
  const canonicalPath = `/${locale}${pathWithoutLocale || ""}`;

  const query =
    search && search.startsWith("?")
      ? search
      : search
        ? `?${search}`
        : "";
  const canonical = `${absoluteUrl(canonicalPath)}${query}`;
  const enUrl = `${absoluteUrl(enPath)}${query}`;
  const esUrl = `${absoluteUrl(esPath)}${query}`;
  const ogImage = image ? absoluteUrl(image) : absoluteUrl(siteConfig.ogImage);

  return {
    title: absoluteTitle ? { absolute: title } : title,
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
          alt: imageAlt ?? title,
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
