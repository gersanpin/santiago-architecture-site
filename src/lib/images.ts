/** Max fidelity for next/image (must be listed in next.config images.qualities). */
export const IMAGE_QUALITY = 90 as const;

/** High-detail frames (gallery / lightbox / hero). */
export const IMAGE_QUALITY_HERO = 92 as const;

/**
 * Prefer optimized delivery via Next/Cloudflare Images.
 * Gallery/lightbox can still request higher quality.
 */
export const IMAGE_UNOPTIMIZED = false as const;
