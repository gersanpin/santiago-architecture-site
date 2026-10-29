import { siteConfig } from "@/lib/site";

export type PortfolioPdf = {
  href: string;
  filename: string;
};

/** Official public selected-works PDF. Hosted from /public locally and R2 in production. */
export function getPortfolioPdf(): PortfolioPdf {
  return siteConfig.portfolio;
}
