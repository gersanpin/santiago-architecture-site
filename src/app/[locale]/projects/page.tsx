import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getLocalized,
  projects,
  type LocaleCode,
} from "@/data/projects";
import { ProjectsExplorer } from "@/components/ProjectsExplorer";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return buildMetadata({
    locale: locale as Locale,
    pathname: `/${locale}/projects`,
    title: t("projectsTitle"),
    description: t("projectsDescription"),
  });
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Projects");
  const lang = locale as LocaleCode;

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <h1 className={styles.title}>{t("title")}</h1>
      </header>

      {/* Server-rendered project links for crawlers and no-JS. */}
      <nav className={styles.seoIndex} aria-label={t("title")}>
        <ul>
          {projects.map((project) => (
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
              {projects.map((project) => (
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
