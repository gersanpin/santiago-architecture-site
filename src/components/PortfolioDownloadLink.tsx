import type { ReactNode } from "react";
import { siteConfig } from "@/lib/site";

type Props = {
  label: string;
  className?: string;
  children?: ReactNode;
};

export function PortfolioDownloadLink({ label, className, children }: Props) {
  const { href, filename } = siteConfig.portfolio;

  return (
    <a className={className} href={href} download={filename}>
      {label}
      {children}
    </a>
  );
}
