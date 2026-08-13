export const siteConfig = {
  name: "Santiago Architecture",
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://santiago-architecture.com"
  ).replace(/\/+$/, ""),
  /** Public studio inbox — only address shown on the site. */
  email: "hello@santiago-architecture.com",
  /** Default share image when a page has no project-specific photo. */
  ogImage: "/projects/casa-sisal/01.png",
  instagram: {
    handle: "Santiago.architecture",
    url: "https://www.instagram.com/santiago.architecture/",
  },
  /** Optional booking page (Calendly, Cal.com, etc.). */
  meetingUrl: process.env.NEXT_PUBLIC_MEETING_URL ?? "",
};
