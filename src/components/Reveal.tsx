"use client";

import {
  createElement,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useReveal } from "@/hooks/useReveal";

type Delay = 0 | 1 | 2 | 3;
type TagName = "div" | "section" | "li" | "article" | "header" | "p" | "h1" | "h2";

type Props = {
  children: ReactNode;
  as?: TagName;
  className?: string;
  delay?: Delay;
  image?: boolean;
  style?: CSSProperties;
};

const delayClass: Record<Delay, string> = {
  0: "",
  1: "revealDelay1",
  2: "revealDelay2",
  3: "revealDelay3",
};

export function Reveal({
  children,
  as = "div",
  className = "",
  delay = 0,
  image = false,
  style,
}: Props) {
  const { ref, visible } = useReveal<HTMLElement>();
  const base = image ? "revealImage" : "reveal";
  const classes = [
    base,
    visible ? "revealVisible" : "",
    delayClass[delay],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return createElement(
    as,
    { ref, className: classes, style },
    children,
  );
}
