import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getLocalized,
  formatPlace,
  getNextProject,
  getProjectBySlug,
  projects,
  type LocaleCode,
} from "@/data/projects";
import { ProjectGallery } from "@/components/ProjectGallery";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return projects.flatMap((project) =>
    (["en", "es"] as const).map((locale) => ({
      locale,
      slug: project.slug,
    })),
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};

  const lang = locale as LocaleCode;
  return buildMetadata({
    locale: locale as Locale,
    pathname: `/${locale}/projects/${slug}`,
    title: getLocalized(project.seoTitle, lang),
    description: getLocalized(project.seoDescription, lang),
  });
}

export default async function ProjectDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const t = await getTranslations("Projects");
  const lang = locale as LocaleCode;
  const next = getNextProject(slug);
  const name = getLocalized(project.name, lang);

  return (
    <article className={styles.article}>
      <ProjectGallery images={project.images} alt={name}>
        <div className={styles.below}>
          <header className={styles.intro}>
            <p className={styles.kicker}>{t(`filters.${project.category}`)}</p>
            <h1 className={styles.title}>{name}</h1>
            <p className={styles.lead}>
              {getLocalized(project.description, lang)}
            </p>
            <p className={styles.facts}>
              <span>{formatPlace(project, lang)}</span>
            </p>
          </header>

          {next ? (
            <div className={styles.next}>
              <Link href={`/projects/${next.slug}`} className={styles.nextLink}>
                {t("nextProject")}: {getLocalized(next.name, lang)}
              </Link>
            </div>
          ) : null}
        </div>
      </ProjectGallery>
    </article>
  );
}
