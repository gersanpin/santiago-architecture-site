import "server-only";
import fs from "node:fs";
import path from "node:path";
import { siteConfig } from "@/lib/site";

export type PortfolioPdf = {
  href: string;
  filename: string;
};

/** Returns the public PDF when the file is in /public. Otherwise null, so no broken download is rendered. */
export function getPortfolioPdf(): PortfolioPdf | null {
  const { href, filename } = siteConfig.portfolio;
  const relative = href.replace(/^\/+/, "");

  try {
    const filePath = path.join(process.cwd(), "public", relative);
    if (!fs.existsSync(filePath)) return null;
  } catch {
    return null;
  }

  return { href, filename };
}
