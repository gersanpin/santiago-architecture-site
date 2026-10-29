import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const htmlCacheControl =
  "public, max-age=0, s-maxage=60, stale-while-revalidate=600";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: "/:locale(en|es)/projects/awen-tulum",
        destination: "/:locale/projects/awen",
        permanent: true,
      },
    ];
  },
  async headers() {
    const htmlHeaders = [
      { key: "Cache-Control", value: htmlCacheControl },
    ];
    return [
      { source: "/sitemap.xml", headers: htmlHeaders },
      { source: "/robots.txt", headers: htmlHeaders },
      { source: "/:locale(en|es)", headers: htmlHeaders },
      { source: "/:locale(en|es)/:path*", headers: htmlHeaders },
    ];
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

if (process.env.NODE_ENV === "development") {
  import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
}
