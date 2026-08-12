import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/Reveal";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import styles from "../content.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};

const SERVICE_KEYS = [
  "architecture",
  "designBuild",
  "residential",
  "hospitality",
  "masterplan",
  "development",
] as const;

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

        <ul className={styles.serviceList}>
          {SERVICE_KEYS.map((item, index) => (
            <Reveal
              key={item}
              as="li"
              delay={(Math.min((index % 3) + 1, 3) as 1 | 2 | 3)}
            >
              <h2>
                <span className={styles.serviceIndex}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.serviceSep} aria-hidden="true">
                  —
                </span>
                {t(`items.${item}.title`)}
              </h2>
              <p>{t(`items.${item}.body`)}</p>
            </Reveal>
          ))}
        </ul>

        <Reveal as="p" className={styles.servicesClosing} delay={1}>
          {t("closing")}
        </Reveal>
      </div>
    </div>
  );
}
