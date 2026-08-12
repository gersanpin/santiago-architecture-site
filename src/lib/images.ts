/** Max fidelity for next/image (must be listed in next.config images.qualities). */
export const IMAGE_QUALITY = 100 as const;

/**
 * Serve original source bytes — no Next.js resize/recompress.
 * Prefer for architectural photography across the site.
 */
export const IMAGE_UNOPTIMIZED = true as const;
