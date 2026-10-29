import Image from "next/image";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  formatPlace,
  getLocalized,
  getProjectBySlug,
  type LocaleCode,
} from "@/data/projects";
import type { LandingPageConfig } from "@/lib/landing-pages";
import { IMAGE_QUALITY, IMAGE_QUALITY_HERO, IMAGE_UNOPTIMIZED } from "@/lib/images";
import { ContactInquiryForm } from "./ContactInquiryForm";
import styles from "./AdLandingPage.module.css";

type Props = {
  config: LandingPageConfig;
  studioEmail: string;
};

export async function AdLandingPage({ config, studioEmail }: Props) {
  const t = await getTranslations("LandingPages");
  const namespace = config.kind;
  const locale = config.locale as LocaleCode;
  const projects = config.projectSlugs
    .map((slug) => getProjectBySlug(slug))
    .filter((project): project is NonNullable<typeof project> =>
      Boolean(project),
    );
  const heroImage = projects[0]?.images[0];
  const helpItems = t.raw(`${namespace}.helpItems`) as string[];

  return (
    <article className={styles.page}>
      <section className={styles.hero}>
        {heroImage ? (
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            fetchPriority="high"
            quality={IMAGE_QUALITY_HERO}
            unoptimized={IMAGE_UNOPTIMIZED}
            sizes="100vw"
            className={styles.heroImage}
          />
        ) : null}
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>{t(`${namespace}.eyebrow`)}</p>
          <h1>{t(`${namespace}.title`)}</h1>
          <p className={styles.heroLead}>{t(`${namespace}.lead`)}</p>
          <a href="#inquiry" className="btn btn-primary">
            {t(`${namespace}.cta`)}
          </a>
        </div>
      </section>

      <section className={styles.projects} aria-labelledby="selected-projects">
        <p id="selected-projects" className={styles.sectionLabel}>
          {t("selectedProjects")}
        </p>
        <div className={styles.projectGrid}>
          {projects.map((project) => {
            const image = project.images[0];
            const title = getLocalized(project.name, locale);
            const place = formatPlace(project, locale);
            return (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className={styles.project}
              >
                {image ? (
                  <div className={styles.projectMedia}>
                    <Image
                      src={image}
                      alt={place ? `${title} — ${place}` : title}
                      fill
                      sizes="(max-width: 760px) 92vw, 31vw"
                      quality={IMAGE_QUALITY}
                      unoptimized={IMAGE_UNOPTIMIZED}
                      className={styles.projectImage}
                    />
                  </div>
                ) : null}
                <h2>{title}</h2>
                {place ? <p>{place}</p> : null}
                <span>{t("viewProject")}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.approach}>
        <div>
          <p className={styles.sectionLabel}>{t(`${namespace}.eyebrow`)}</p>
          <h2>{t(`${namespace}.approachTitle`)}</h2>
          <p>{t(`${namespace}.approachBody`)}</p>
        </div>
        <div>
          <p className={styles.sectionLabel}>{t(`${namespace}.helpTitle`)}</p>
          <ul>
            {helpItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="inquiry" className={styles.inquiry}>
        <div className={styles.inquiryIntro}>
          <p className={styles.sectionLabel}>{t(`${namespace}.eyebrow`)}</p>
          <h2>{t("formTitle")}</h2>
          <p>{t("formLead")}</p>
        </div>
        <Suspense fallback={null}>
          <ContactInquiryForm
            studioEmail={studioEmail}
            embedded
            initialProjectType={config.projectType}
          />
        </Suspense>
      </section>
    </article>
  );
}
