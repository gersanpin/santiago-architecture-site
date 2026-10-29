import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
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
    pathname: `/${locale}/privacy`,
    title: t("privacyTitle"),
    description: t("privacyDescription"),
  });
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Privacy");

  const sections = [
    ["essentialTitle", "essentialBody"],
    ["marketingTitle", "marketingBody"],
    ["controlTitle", "controlBody"],
    ["activationTitle", "activationBody"],
  ] as const;

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <h1>{t("title")}</h1>
        <p className={styles.lead}>{t("lead")}</p>
        <p className={styles.intro}>{t("intro")}</p>
      </header>

      <div className={styles.sections}>
        {sections.map(([title, body]) => (
          <section key={title}>
            <h2>{t(title)}</h2>
            <p>{t(body)}</p>
            {title === "marketingTitle" ? (
              <a
                href="https://www.facebook.com/privacy/policy/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("metaLink")} ↗
              </a>
            ) : null}
          </section>
        ))}

        <section>
          <h2>{t("contactTitle")}</h2>
          <p>
            {t("contactBody")}{" "}
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          </p>
        </section>
      </div>
    </article>
  );
}
