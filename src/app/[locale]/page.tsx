import Image from "next/image";
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
import { IMAGE_QUALITY, IMAGE_UNOPTIMIZED } from "@/lib/images";
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

const SERVICE_DO_KEYS = [
  "architecture",
  "designBuild",
  "masterplan",
  "development",
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

      <section className={styles.selectedSection}>
        <Reveal>
          <p className={styles.kicker}>{tHome("selectedTitle")}</p>
        </Reveal>
        <ul className={styles.selected}>
          {selected.map((project, index) => {
            const cover = project.images[0];
            if (!cover) return null;
            const name = getLocalized(project.name, lang);
            const place = formatPlace(project, lang);
            const align =
              index % 2 === 0 ? styles.selectedItemStart : styles.selectedItemEnd;

            return (
              <Reveal
                key={project.slug}
                as="li"
                className={`${styles.selectedItem} ${align}`}
                delay={(Math.min(index + 1, 3) as 1 | 2 | 3)}
                image
              >
                <Link
                  href={`/projects/${project.slug}`}
                  className={styles.selectedLink}
                >
                  <div className={styles.selectedMedia}>
                    <Image
                      src={cover}
                      alt=""
                      fill
                      sizes="(max-width: 700px) 92vw, (max-width: 1100px) 78vw, 72vw"
                      quality={IMAGE_QUALITY}
                      unoptimized={IMAGE_UNOPTIMIZED}
                      className={styles.selectedImage}
                      style={{
                        objectPosition: project.coverFocus ?? "50% 45%",
                      }}
                    />
                  </div>
                  <div className={styles.selectedMeta}>
                    <span className={styles.selectedName}>{name}</span>
                    {place ? (
                      <span className={styles.selectedPlace}>{place}</span>
                    ) : null}
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </ul>
        <Reveal className={styles.allProjects} delay={1}>
          <Link href="/projects" className={styles.textLink}>
            {tHome("viewAllProjects")}
          </Link>
        </Reveal>
      </section>

      <section className={styles.section}>
        <Reveal>
          <p className={styles.kicker}>{tAbout("title")}</p>
          <p className={styles.body}>{tHome("aboutP1")}</p>
          <p className={styles.body}>{tHome("aboutP2")}</p>
          <div className={styles.aboutMedia} aria-hidden="true" />
          <Link href="/about" className={styles.textLink}>
            {tHome("readAbout")}
          </Link>
        </Reveal>
      </section>

      <section className={`${styles.section} ${styles.servicesSection}`}>
        <Reveal>
          <p className={styles.kicker}>{tServices("title")}</p>
          <p className={styles.servicesLead}>{tServices("lead")}</p>
          <ul className={styles.serviceDo}>
            {SERVICE_DO_KEYS.map((key) => (
              <li key={key}>
                {key === "development"
                  ? tHome("development")
                  : tServices(`items.${key}.title`)}
              </li>
            ))}
          </ul>
          <Link href="/services" className={styles.textLink}>
            {tHome("viewServices")}
          </Link>
        </Reveal>
      </section>

      <section className={`${styles.section} ${styles.ctaSection}`}>
        <Reveal>
          <p className={styles.ctaLead}>{tHome("contactLead")}</p>
          <Link href="/contact?start=1" className={styles.textLink}>
            {tHome("startProject")} →
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
