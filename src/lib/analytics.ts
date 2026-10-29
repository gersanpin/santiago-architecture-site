"use client";

export const AD_CONSENT_STORAGE_KEY = "santiago-ad-consent";
export const AD_CONSENT_EVENT = "santiago:ad-consent";
export const OPEN_CONSENT_PREFERENCES_EVENT =
  "santiago:open-consent-preferences";

const CONSENT_VERSION = 1;

type StoredConsent = {
  version: number;
  necessary: true;
  marketing: boolean;
  updatedAt: string;
};

type MetaQueue = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: MetaQueue;
    _fbq?: MetaQueue;
  }
}

let initializedPixelId = "";
let grantedConsentPixelId = "";

function pixelId() {
  const value = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";
  return /^\d+$/.test(value) ? value : "";
}

export function isAdvertisingEnabled() {
  return (
    process.env.NEXT_PUBLIC_AD_TRACKING_ENABLED === "true" &&
    Boolean(pixelId())
  );
}

export function getAdvertisingConsent(): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(AD_CONSENT_STORAGE_KEY);
    if (!stored) return null;
    // Preserve the Phase 1 value while migrating to versioned preferences.
    if (stored === "granted") return true;
    if (stored === "denied") return false;
    const parsed = JSON.parse(stored) as Partial<StoredConsent>;
    if (
      parsed.version !== CONSENT_VERSION ||
      parsed.necessary !== true ||
      typeof parsed.marketing !== "boolean"
    ) {
      return null;
    }
    return parsed.marketing;
  } catch {
    return null;
  }
}

export function hasAdvertisingConsent() {
  return getAdvertisingConsent() === true;
}

export function setAdvertisingConsent(marketing: boolean) {
  if (typeof window === "undefined") return;
  const preference: StoredConsent = {
    version: CONSENT_VERSION,
    necessary: true,
    marketing,
    updatedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(
      AD_CONSENT_STORAGE_KEY,
      JSON.stringify(preference),
    );
  } catch {
    return;
  }

  if (window.fbq) {
    window.fbq("consent", marketing ? "grant" : "revoke");
    grantedConsentPixelId = marketing ? pixelId() : "";
  }
  window.dispatchEvent(
    new CustomEvent(AD_CONSENT_EVENT, { detail: { marketing } }),
  );
}

export function initializeMetaPixel() {
  if (
    typeof window === "undefined" ||
    !isAdvertisingEnabled() ||
    !hasAdvertisingConsent()
  ) {
    return false;
  }

  if (!window.fbq) {
    const fbq: MetaQueue = (...args: unknown[]) => {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
      } else {
        fbq.queue?.push(args);
      }
    };
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    window._fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    script.dataset.santiagoMetaPixel = "true";
    document.head.appendChild(script);
  }

  const id = pixelId();
  if (initializedPixelId !== id) {
    window.fbq("init", id);
    initializedPixelId = id;
  }
  if (grantedConsentPixelId !== id) {
    window.fbq("consent", "grant");
    grantedConsentPixelId = id;
  }
  return true;
}

export function trackMetaPageView() {
  if (initializeMetaPixel()) {
    window.fbq?.("track", "PageView");
  }
}

export function trackCtaClick(
  destination: "residential" | "hospitality" | "contact",
  placement: "hero" | "sector",
) {
  if (!hasAdvertisingConsent() || !initializeMetaPixel()) return;
  window.fbq?.("trackCustom", "CTA_Click", {
    destination,
    placement,
  });
}

export function trackLead(eventId: string) {
  if (!hasAdvertisingConsent() || !initializeMetaPixel()) return;
  window.fbq?.("track", "Lead", {}, { eventID: eventId });
}

export function createEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `lead-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
