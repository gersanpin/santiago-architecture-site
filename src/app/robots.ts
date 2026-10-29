import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/*.md$", "/*/README.md"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
