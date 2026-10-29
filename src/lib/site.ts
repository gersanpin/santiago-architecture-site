export const siteConfig = {
  name: "Santiago Architecture",
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://santiago-architecture.com"
  ).replace(/\/+$/, ""),
  /** Public studio inbox — only address shown on the site. */
  email: "hello@santiago-architecture.com",
  /** Default share image when a page has no project-specific photo. */
  ogImage: "/projects-hd/casa-sisal/00.webp",
  instagram: {
    handle: "Santiago.architecture",
    url: "https://www.instagram.com/santiago.architecture/",
  },
  /** Optional booking page (Calendly, Cal.com, etc.). */
  meetingUrl: process.env.NEXT_PUBLIC_MEETING_URL ?? "",
  /**
   * Selected-works PDF. Activate both download links by placing the file at
   * public/portfolio/santiago-architecture-selected-works-2026.pdf
   */
  portfolio: {
    href: "/portfolio/santiago-architecture-selected-works-2026.pdf",
    filename: "Santiago Architecture — Selected Works 2026.pdf",
  },
};
