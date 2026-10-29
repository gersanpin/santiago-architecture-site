"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site";
import { isAdLandingPath } from "@/lib/landing-pages";
import { OPEN_CONSENT_PREFERENCES_EVENT } from "@/lib/analytics";
import { InstagramLink } from "./InstagramLink";
import styles from "./SiteFooter.module.css";

type Props = {
  portfolio: { href: string; filename: string } | null;
};

export function SiteFooter({ portfolio }: Props) {
  const t = useTranslations("Footer");
  const pathname = usePathname();
  const year = new Date().getFullYear();
  const isLanding = isAdLandingPath(pathname);
  const openCookiePreferences = () =>
    window.dispatchEvent(new Event(OPEN_CONSENT_PREFERENCES_EVENT));

  // Full-bleed screens — no footer below the fold.
  if (pathname === "/" || pathname === "/projects") return null;

  if (isLanding) {
    return (
      <footer className={`${styles.footer} ${styles.minimalFooter}`}>
        <div className={styles.inner}>
          <span className={styles.brand}>Santiago Architecture</span>
          <a className={styles.email} href={`mailto:${siteConfig.email}`}>
            {siteConfig.email}
          </a>
          <Link className={styles.footerAction} href="/privacy">
            {t("privacy")}
          </Link>
          <button
            type="button"
            className={styles.footerAction}
            onClick={openCookiePreferences}
          >
            {t("cookiePreferences")}
          </button>
          <span>
            © {year}. {t("rights")}
          </span>
        </div>
      </footer>
    );
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <span className={styles.brand}>Santiago Architecture</span>
          <a className={styles.email} href={`mailto:${siteConfig.email}`}>
            {siteConfig.email}
          </a>
          <InstagramLink muted />
          <Link className={styles.footerAction} href="/privacy">
            {t("privacy")}
          </Link>
          <button
            type="button"
            className={styles.footerAction}
            onClick={openCookiePreferences}
          >
            {t("cookiePreferences")}
          </button>
          {portfolio ? (
            <a
              className={styles.portfolio}
              href={portfolio.href}
              download={portfolio.filename}
            >
              {t("portfolio")}
            </a>
          ) : null}
        </div>
        <span>
          © {year}. {t("rights")}
        </span>
      </div>
    </footer>
  );
}
