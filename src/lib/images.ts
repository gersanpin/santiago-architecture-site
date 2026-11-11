/** Max fidelity for next/image (must be listed in next.config images.qualities). */
export const IMAGE_QUALITY = 100 as const;

/** High-detail frames (gallery / lightbox / hero). */
export const IMAGE_QUALITY_HERO = 100 as const;

/**
 * Serve static assets as-is — skip Next/Cloudflare re-encode so portfolio
 * photos keep full sharpness and color from the source files.
 */
export const IMAGE_UNOPTIMIZED = true as const;
