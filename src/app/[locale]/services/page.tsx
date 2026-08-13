import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/Reveal";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import styles from "../content.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};

const DO_KEYS = [
  "architecture",
  "designBuild",
  "masterplan",
  "development",
] as const;

const WHERE_KEYS = ["residential", "hospitality", "largeScale"] as const;

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return buildMetadata({
    locale: locale as Locale,
    pathname: `/${locale}/services`,
    title: t("servicesTitle"),
    description: t("servicesDescription"),
  });
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Services");

  return (
    <div className={`${styles.stage} ${styles.stageScroll}`}>
      <div className={`${styles.shell} ${styles.servicesShell}`}>
        <Reveal className={styles.servicesIntro}>
          <h1 className={styles.title}>{t("title")}</h1>
          <hr className={styles.rule} />
          <p className={styles.statement}>{t("lead")}</p>
          <p className={styles.body}>{t("intro")}</p>
        </Reveal>

        <Reveal as="section" className={styles.serviceGroup} delay={1}>
          <h2 className={styles.sectionLabel}>{t("doTitle")}</h2>
          <ul className={styles.serviceList}>
            {DO_KEYS.map((item, index) => (
              <li key={item}>
                <h3>
                  <span className={styles.serviceIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.serviceSep} aria-hidden="true">
                    —
                  </span>
                  {t(`items.${item}.title`)}
                </h3>
                <p>{t(`items.${item}.body`)}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal as="section" className={styles.serviceGroup} delay={2}>
          <h2 className={styles.sectionLabel}>{t("whereTitle")}</h2>
          <ul className={styles.serviceList}>
            {WHERE_KEYS.map((item, index) => (
              <li key={item}>
                <h3>
                  <span className={styles.serviceIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.serviceSep} aria-hidden="true">
                    —
                  </span>
                  {t(`items.${item}.title`)}
                </h3>
                <p>{t(`items.${item}.body`)}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal as="p" className={styles.servicesClosing} delay={1}>
          {t("closing")}
        </Reveal>

        <Reveal className={styles.pageCta} delay={2}>
          <Link href="/contact?start=1" className={styles.pageCtaLink}>
            {t("cta")}
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
