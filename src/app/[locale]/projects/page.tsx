import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getLocalized,
  projects,
  type LocaleCode,
} from "@/data/projects";
import { PortfolioDownloadLink } from "@/components/PortfolioDownloadLink";
import { ProjectsExplorer } from "@/components/ProjectsExplorer";
import {
  buildBreadcrumbStructuredData,
  StructuredData,
} from "@/components/StructuredData";
import {
  filterProjectsByGroup,
  getProjectFilterSlug,
  parseProjectFilter,
  type ProjectFilterId,
} from "@/lib/project-filters";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string | string[] }>;
};

function filterSearch(filterId: ProjectFilterId) {
  const slug = getProjectFilterSlug(filterId);
  return slug ? `?category=${slug}` : undefined;
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  const filterId = parseProjectFilter(query.category);
  const t = await getTranslations({ locale, namespace: "Meta" });

  return buildMetadata({
    locale: locale as Locale,
    pathname: `/${locale}/projects`,
    title:
      filterId === "all" ? t("projectsTitle") : t(`filterTitles.${filterId}`),
    description:
      filterId === "all"
        ? t("projectsDescription")
        : t(`filterDescriptions.${filterId}`),
    search: filterSearch(filterId),
  });
}

export default async function ProjectsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Projects");
  const lang = locale as LocaleCode;
  const filterId = parseProjectFilter(query.category);
  const listedProjects = filterProjectsByGroup(projects, filterId);

  return (
    <div className={styles.page}>
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: t("home"), path: `/${locale}` },
          { name: t("title"), path: `/${locale}/projects` },
        ])}
      />
      <header className={styles.top}>
        <h1 className={styles.title}>{t("title")}</h1>
        <PortfolioDownloadLink
          className={styles.portfolioLink}
          label={t("portfolioDownload")}
        />
      </header>

      {/* Server-rendered project links for crawlers and no-JS. */}
      <nav className={styles.seoIndex} aria-label={t("title")}>
        <ul>
          {listedProjects.map((project) => (
            <li key={project.slug}>
              <Link href={`/projects/${project.slug}`}>
                {getLocalized(project.name, lang)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Suspense
        fallback={
          <nav className={styles.fallbackIndex} aria-label={t("title")}>
            <ul>
              {listedProjects.map((project) => (
                <li key={`fb-${project.slug}`}>
                  <Link href={`/projects/${project.slug}`}>
                    {getLocalized(project.name, lang)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        }
      >
        <ProjectsExplorer projects={projects} />
      </Suspense>
    </div>
  );
}
