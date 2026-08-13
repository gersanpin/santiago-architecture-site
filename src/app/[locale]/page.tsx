import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HomeHero } from "@/components/HomeHero";
import { Reveal } from "@/components/Reveal";
import {
  formatPlace,
  getLocalized,
  getProjectBySlug,
  type LocaleCode,
} from "@/data/projects";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import styles from "./home.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};

const HOME_COVER_SLUGS = [
  "casa-sisal",
  "casa-manglar",
  "jungle-house-tulum",
  "villa-nosara",
  "bali-resort",
] as const;

const SELECTED_SLUGS = [
  "casa-sisal",
  "jungle-house-tulum",
  "villa-nosara",
  "bali-resort",
] as const;

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return buildMetadata({
    locale: locale as Locale,
    pathname: `/${locale}`,
    title: t("homeTitle"),
    description: t("homeDescription"),
    image: "/projects/casa-sisal/01.png",
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = locale as LocaleCode;
  const tHome = await getTranslations("Home");
  const tAbout = await getTranslations("About");
  const tServices = await getTranslations("Services");

  const slides = HOME_COVER_SLUGS.map((slug) => {
    const project = getProjectBySlug(slug);
    if (!project?.images[0]) return null;
    return {
      src: project.images[0],
      name: getLocalized(project.name, lang),
      place: formatPlace(project, lang),
      href: `/projects/${project.slug}`,
    };
  }).filter((slide): slide is NonNullable<typeof slide> => Boolean(slide));

  const selected = SELECTED_SLUGS.map((slug) => getProjectBySlug(slug)).filter(
    (project): project is NonNullable<typeof project> => Boolean(project),
  );

  return (
    <div className={styles.home}>
      <HomeHero slides={slides} />

      <section className={styles.section}>
        <Reveal>
          <p className={styles.kicker}>{tHome("selectedTitle")}</p>
        </Reveal>
        <ul className={styles.selected}>
          {selected.map((project, index) => (
            <Reveal
              key={project.slug}
              as="li"
              delay={(Math.min(index + 1, 3) as 1 | 2 | 3)}
            >
              <Link
                href={`/projects/${project.slug}`}
                className={styles.selectedLink}
              >
                <span className={styles.selectedName}>
                  {getLocalized(project.name, lang)}
                </span>
                <span className={styles.selectedPlace}>
                  {formatPlace(project, lang)}
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <Reveal>
          <p className={styles.kicker}>{tAbout("title")}</p>
          <p className={styles.statement}>{tAbout("lead")}</p>
          <p className={styles.body}>{tAbout("p1")}</p>
          <Link href="/about" className={styles.textLink}>
            {tHome("readAbout")}
          </Link>
        </Reveal>
      </section>

      <section className={styles.section}>
        <Reveal>
          <p className={styles.kicker}>{tServices("title")}</p>
          <p className={styles.statement}>{tServices("lead")}</p>
          <p className={styles.body}>{tServices("intro")}</p>
          <Link href="/services" className={styles.textLink}>
            {tHome("viewServices")}
          </Link>
        </Reveal>
      </section>

      <section className={`${styles.section} ${styles.ctaSection}`}>
        <Reveal>
          <p className={styles.statement}>{tHome("contactLead")}</p>
          <Link href="/contact?start=1" className={styles.textLink}>
            {tHome("startProject")} →
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
