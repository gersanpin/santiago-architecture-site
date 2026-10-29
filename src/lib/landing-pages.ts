import type { Locale } from "@/i18n/routing";

export type LandingKind = "residential" | "hospitality";

export type LandingPageConfig = {
  kind: LandingKind;
  locale: Locale;
  slug: string;
  projectType: "residence" | "hospitality";
  projectSlugs: readonly string[];
};

const landingPages: readonly LandingPageConfig[] = [
  {
    kind: "residential",
    locale: "en",
    slug: "residential-architecture",
    projectType: "residence",
    projectSlugs: ["casa-sisal", "villa-nosara", "jungle-house-tulum"],
  },
  {
    kind: "residential",
    locale: "es",
    slug: "arquitectura-residencial",
    projectType: "residence",
    projectSlugs: ["casa-sisal", "villa-nosara", "jungle-house-tulum"],
  },
  {
    kind: "hospitality",
    locale: "en",
    slug: "hospitality-architecture",
    projectType: "hospitality",
    projectSlugs: ["bali-resort", "costa-rica-spa", "aldea-uh-may"],
  },
  {
    kind: "hospitality",
    locale: "es",
    slug: "arquitectura-hospitalidad",
    projectType: "hospitality",
    projectSlugs: ["bali-resort", "costa-rica-spa", "aldea-uh-may"],
  },
] as const;

export function getLandingPage(
  locale: string,
  slug: string,
): LandingPageConfig | undefined {
  return landingPages.find(
    (page) => page.locale === locale && page.slug === slug,
  );
}

export function getLandingHref(kind: LandingKind, locale: Locale): string {
  const page = landingPages.find(
    (candidate) => candidate.kind === kind && candidate.locale === locale,
  );
  return page ? `/${page.slug}` : "/";
}

export function getLandingAlternates(kind: LandingKind) {
  const en = landingPages.find(
    (page) => page.kind === kind && page.locale === "en",
  );
  const es = landingPages.find(
    (page) => page.kind === kind && page.locale === "es",
  );
  return {
    en: en ? `/en/${en.slug}` : "/en",
    es: es ? `/es/${es.slug}` : "/es",
  };
}

export function getLandingStaticParams() {
  return landingPages.map(({ locale, slug }) => ({
    locale,
    landingSlug: slug,
  }));
}

export function isAdLandingPath(pathname: string): boolean {
  const normalized = pathname.replace(/^\/(en|es)(?=\/|$)/, "");
  return landingPages.some((page) => normalized === `/${page.slug}`);
}
