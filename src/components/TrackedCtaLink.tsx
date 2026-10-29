"use client";

import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import { trackCtaClick } from "@/lib/analytics";

type Props = ComponentProps<typeof Link> & {
  destination: "residential" | "hospitality" | "contact";
  placement: "hero" | "sector";
};

export function TrackedCtaLink({
  destination,
  placement,
  onClick,
  ...props
}: Props) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        trackCtaClick(destination, placement);
        onClick?.(event);
      }}
    />
  );
}
