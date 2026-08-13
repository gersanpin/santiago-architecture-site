"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site";
import { InstagramLink } from "./InstagramLink";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  const t = useTranslations("Footer");
  const pathname = usePathname();
  const year = new Date().getFullYear();

  // Full-bleed screens — no footer below the fold.
  if (pathname === "/" || pathname === "/projects") return null;

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <span className={styles.brand}>Santiago Architecture</span>
          <a className={styles.email} href={`mailto:${siteConfig.email}`}>
            {siteConfig.email}
          </a>
          <InstagramLink muted />
        </div>
        <span>
          © {year}. {t("rights")}
        </span>
      </div>
    </footer>
  );
}
