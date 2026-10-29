"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  AD_CONSENT_EVENT,
  initializeMetaPixel,
  trackMetaPageView,
} from "@/lib/analytics";

let lastTrackedUrl = "";

export function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    const trackCurrentPage = (event?: Event) => {
      if (
        event instanceof CustomEvent &&
        event.detail?.marketing === false
      ) {
        lastTrackedUrl = "";
        return;
      }
      if (!initializeMetaPixel()) return;
      const currentUrl = `${pathname}${query ? `?${query}` : ""}`;
      if (lastTrackedUrl === currentUrl) return;
      lastTrackedUrl = currentUrl;
      trackMetaPageView();
    };

    trackCurrentPage();
    window.addEventListener(AD_CONSENT_EVENT, trackCurrentPage);
    return () => {
      window.removeEventListener(AD_CONSENT_EVENT, trackCurrentPage);
    };
  }, [pathname, query]);

  return null;
}
