"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  getAdvertisingConsent,
  OPEN_CONSENT_PREFERENCES_EVENT,
  setAdvertisingConsent,
} from "@/lib/analytics";
import styles from "./CookieConsent.module.css";

type View = "hidden" | "banner" | "preferences";

export function CookieConsent() {
  const t = useTranslations("Consent");
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>("hidden");
  const [hasSavedChoice, setHasSavedChoice] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = getAdvertisingConsent();
    setMarketing(stored === true);
    setHasSavedChoice(stored !== null);
    setView(stored === null ? "banner" : "hidden");
    setReady(true);

    const openPreferences = () => {
      const current = getAdvertisingConsent();
      setMarketing(current === true);
      setHasSavedChoice(current !== null);
      setView("preferences");
    };
    window.addEventListener(
      OPEN_CONSENT_PREFERENCES_EVENT,
      openPreferences,
    );
    return () => {
      window.removeEventListener(
        OPEN_CONSENT_PREFERENCES_EVENT,
        openPreferences,
      );
    };
  }, []);

  useEffect(() => {
    if (view !== "preferences") return;
    const dialog = dialogRef.current;
    const firstControl = dialog?.querySelector<HTMLElement>(
      "button, input, a[href]",
    );
    firstControl?.focus();
  }, [view]);

  function savePreference(value: boolean) {
    setAdvertisingConsent(value);
    setMarketing(value);
    setHasSavedChoice(true);
    setView("hidden");
  }

  function closePreferences() {
    setView(hasSavedChoice ? "hidden" : "banner");
  }

  function handleDialogKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closePreferences();
      return;
    }
    if (event.key !== "Tab") return;
    const controls = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input:not([disabled]), a[href]",
      ),
    );
    if (controls.length === 0) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (!ready) return null;

  return (
    <>
      {view === "banner" ? (
        <aside
          className={styles.banner}
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-description"
        >
          <div className={styles.bannerCopy}>
            <p id="cookie-consent-title" className={styles.title}>
              {t("title")}
            </p>
            <p id="cookie-consent-description" className={styles.body}>
              {t("body")}{" "}
              <Link href="/privacy" className={styles.inlineLink}>
                {t("learnMore")}
              </Link>
            </p>
          </div>
          <div className={styles.bannerActions}>
            <button
              type="button"
              className={`btn btn-primary ${styles.choiceButton}`}
              onClick={() => savePreference(true)}
            >
              {t("acceptAll")}
            </button>
            <button
              type="button"
              className={`btn btn-line ${styles.choiceButton}`}
              onClick={() => savePreference(false)}
            >
              {t("rejectNonEssential")}
            </button>
            <button
              type="button"
              className={`btn btn-line ${styles.choiceButton}`}
              onClick={() => setView("preferences")}
            >
              {t("manage")}
            </button>
          </div>
        </aside>
      ) : null}

      {view === "preferences" ? (
        <div className={styles.backdrop}>
          <div
            ref={dialogRef}
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-preferences-title"
            onKeyDown={handleDialogKeyDown}
          >
            <div className={styles.dialogHeader}>
              <div>
                <p className={styles.kicker}>{t("preferencesKicker")}</p>
                <h2 id="cookie-preferences-title">{t("preferencesTitle")}</h2>
              </div>
              <button
                type="button"
                className={styles.close}
                onClick={closePreferences}
                aria-label={t("close")}
              >
                ×
              </button>
            </div>

            <div className={styles.preference}>
              <div>
                <h3>{t("necessaryTitle")}</h3>
                <p>{t("necessaryBody")}</p>
              </div>
              <span className={styles.alwaysOn}>{t("alwaysOn")}</span>
            </div>

            <label className={styles.preference}>
              <span>
                <span className={styles.preferenceTitle}>
                  {t("marketingTitle")}
                </span>
                <span className={styles.preferenceBody}>
                  {t("marketingBody")}
                </span>
              </span>
              <input
                className={styles.toggle}
                type="checkbox"
                checked={marketing}
                onChange={(event) => setMarketing(event.target.checked)}
              />
            </label>

            <p className={styles.details}>
              <Link
                href="/privacy"
                className={styles.inlineLink}
                onClick={closePreferences}
              >
                {t("privacyLink")}
              </Link>
            </p>

            <div className={styles.dialogActions}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => savePreference(marketing)}
              >
                {t("save")}
              </button>
              <button
                type="button"
                className="btn btn-line"
                onClick={() => savePreference(false)}
              >
                {t("rejectNonEssential")}
              </button>
              <button
                type="button"
                className="btn btn-line"
                onClick={() => savePreference(true)}
              >
                {t("acceptAll")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {view === "hidden" && hasSavedChoice ? (
        <button
          type="button"
          className={styles.preferencesTrigger}
          onClick={() => setView("preferences")}
        >
          {t("changePreferences")}
        </button>
      ) : null}
    </>
  );
}
