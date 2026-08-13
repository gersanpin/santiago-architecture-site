import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    // Optimized AVIF/WebP via Next + Cloudflare Images binding when deployed.
    qualities: [75, 90, 92, 100],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560],
    imageSizes: [64, 96, 128, 256, 384, 512],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);

import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
