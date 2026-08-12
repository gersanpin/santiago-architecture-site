"use client";

import { usePathname } from "@/i18n/navigation";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function PageFade({ children }: Props) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
