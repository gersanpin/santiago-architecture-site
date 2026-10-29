import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdLandingPage } from "@/components/AdLandingPage";
import { getProjectBySlug } from "@/data/projects";
import {
  getLandingAlternates,
  getLandingPage,
  getLandingStaticParams,
} from "@/lib/landing-pages";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string; landingSlug: string }>;
};

export function generateStaticParams() {
  return getLandingStaticParams();
}

export async function generateMetadata({ params }: Props) {
  const { locale, landingSlug } = await params;
  const config = getLandingPage(locale, landingSlug);
  if (!config) return {};

  const t = await getTranslations({ locale, namespace: "Meta" });
  const titleKey =
    config.kind === "residential"
      ? "residentialLandingTitle"
      : "hospitalityLandingTitle";
  const descriptionKey =
    config.kind === "residential"
      ? "residentialLandingDescription"
      : "hospitalityLandingDescription";
  const project = getProjectBySlug(config.projectSlugs[0]);
  const pathname = `/${locale}/${landingSlug}`;
  const metadata = buildMetadata({
    locale: locale as Locale,
    pathname,
    title: t(titleKey),
    description: t(descriptionKey),
    image: project?.images[0],
    absoluteTitle: true,
  });
  const alternates = getLandingAlternates(config.kind);
  const absolute = (path: string) => `${siteConfig.url}${path}`;

  return {
    ...metadata,
    alternates: {
      canonical: absolute(pathname),
      languages: {
        en: absolute(alternates.en),
        es: absolute(alternates.es),
        "x-default": absolute(alternates.en),
      },
    },
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
      },
    },
  };
}

export default async function LandingPage({ params }: Props) {
  const { locale, landingSlug } = await params;
  const config = getLandingPage(locale, landingSlug);
  if (!config) notFound();

  setRequestLocale(locale);

  return <AdLandingPage config={config} studioEmail={siteConfig.email} />;
}
