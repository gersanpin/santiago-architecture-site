import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/Reveal";
import { buildMetadata } from "@/lib/seo";
import { getPortfolioPdf } from "@/lib/portfolio";
import type { Locale } from "@/i18n/routing";
import styles from "../content.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return buildMetadata({
    locale: locale as Locale,
    pathname: `/${locale}/about`,
    title: t("aboutTitle"),
    description: t("aboutDescription"),
  });
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");
  const intro = [t("p1"), t("p2"), t("p3"), t("p4")];
  const approach = [t("approach1"), t("approach2")];
  const portfolio = getPortfolioPdf();

  return (
    <div className={`${styles.stage} ${styles.stageScroll}`}>
      <div className={styles.shell}>
        <Reveal as="section" className={styles.aboutSection}>
          <h1 className={styles.title}>{t("title")}</h1>
          <hr className={styles.rule} />
          <p className={styles.statement}>{t("lead")}</p>
          {intro.map((text, i) => (
            <Reveal
              key={text}
              as="p"
              className={styles.body}
              delay={(Math.min(i + 1, 3) as 1 | 2 | 3)}
            >
              {text}
            </Reveal>
          ))}
        </Reveal>

        {/* Reserved for a future founder / studio / process photograph. */}
        <div className={styles.aboutMedia} aria-hidden="true" />

        <Reveal as="section" className={styles.aboutSection} delay={1}>
          <h2 className={styles.sectionLabel}>{t("approachTitle")}</h2>
          {approach.map((text, i) => (
            <Reveal
              key={text}
              as="p"
              className={styles.body}
              delay={(Math.min(i + 1, 3) as 1 | 2 | 3)}
            >
              {text}
            </Reveal>
          ))}
        </Reveal>

        <Reveal className={styles.pageCta} delay={2}>
          <Link href="/contact?start=1" className={styles.pageCtaLink}>
            {t("cta")}
          </Link>
        </Reveal>

        {portfolio ? (
          <Reveal as="section" className={styles.portfolio} delay={1}>
            <h2 className={styles.portfolioTitle}>{t("portfolioTitle")}</h2>
            <hr className={styles.rule} />
            <p className={styles.body}>{t("portfolioBody")}</p>
            <a
              className={styles.portfolioLink}
              href={portfolio.href}
              download={portfolio.filename}
            >
              {t("portfolioDownload")}
              <svg
                className={styles.portfolioArrow}
                viewBox="0 0 16 16"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M2.5 8h10M8.5 4.25 12.75 8 8.5 11.75"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </Reveal>
        ) : null}
      </div>
    </div>
  );
}
