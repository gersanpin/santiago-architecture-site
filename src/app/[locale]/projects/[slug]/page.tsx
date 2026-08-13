import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getLocalized,
  formatPlace,
  formatProjectFacts,
  getNextProject,
  getProjectBySlug,
  projects,
  type LocaleCode,
} from "@/data/projects";
import { ProjectGallery } from "@/components/ProjectGallery";
import { IMAGE_QUALITY, IMAGE_UNOPTIMIZED } from "@/lib/images";
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
    image: project.images[0] ?? null,
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
  const facts = formatProjectFacts(project, lang);
  const credit = project.credit
    ? getLocalized(project.credit, lang)
    : null;
  const nextName = next ? getLocalized(next.name, lang) : null;
  const nextPlace = next ? formatPlace(next, lang) : null;
  const nextImage = next?.images[0] ?? null;

  return (
    <article className={styles.article}>
      <ProjectGallery images={project.images} alt={name}>
        <header className={styles.intro}>
          <p className={styles.kicker}>{t(`filters.${project.category}`)}</p>
          <h1 className={styles.title}>{name}</h1>
          {facts ? <p className={styles.facts}>{facts}</p> : null}
          <p className={styles.lead}>
            {getLocalized(project.description, lang)}
          </p>
          {credit ? <p className={styles.credit}>{credit}</p> : null}
        </header>
      </ProjectGallery>

      {next && nextName && nextImage ? (
        <Link
          href={`/projects/${next.slug}`}
          className={styles.next}
          aria-label={`${t("nextProject")}: ${nextName}`}
        >
          <p className={styles.nextLabel}>{t("nextProject")}</p>
          <div className={styles.nextMedia}>
            <Image
              src={nextImage}
              alt=""
              fill
              sizes="(max-width: 700px) 88vw, (max-width: 1100px) 68vw, 62vw"
              quality={IMAGE_QUALITY}
              unoptimized={IMAGE_UNOPTIMIZED}
              className={styles.nextImage}
            />
          </div>
          <div className={styles.nextMeta}>
            <h2 className={styles.nextName}>{nextName}</h2>
            {nextPlace ? (
              <p className={styles.nextPlace}>{nextPlace}</p>
            ) : null}
          </div>
        </Link>
      ) : null}
    </article>
  );
}
