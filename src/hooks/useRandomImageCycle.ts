"use client";

import { useEffect, useState } from "react";

type Options = {
  /** Minimum delay between changes (ms). */
  minMs?: number;
  /** Maximum delay between changes (ms). */
  maxMs?: number;
  /** Pause automatic cycling. */
  paused?: boolean;
  /** Start on this index instead of a random one (e.g. 0 = cover). */
  initialIndex?: number;
  /** Extra hold on the first image before the first change (ms). */
  firstHoldMs?: number;
  /**
   * On the first auto-change, pick only among images after the cover
   * (indices 1…n-1) when possible.
   */
  restAfterCover?: boolean;
};

function randomDelay(minMs: number, maxMs: number) {
  return minMs + Math.random() * (maxMs - minMs);
}

function randomOtherIndex(length: number, current: number) {
  if (length < 2) return 0;
  let next = Math.floor(Math.random() * length);
  if (next === current) next = (current + 1) % length;
  return next;
}

function randomRestIndex(length: number) {
  if (length < 2) return 0;
  return 1 + Math.floor(Math.random() * (length - 1));
}

/** Cycles through images at staggered random intervals. */
export function useRandomImageCycle(images: string[], options: Options = {}) {
  const {
    minMs = 4200,
    maxMs = 7800,
    paused = false,
    initialIndex,
    firstHoldMs,
    restAfterCover = false,
  } = options;
  const total = images.length;

  const [index, setIndex] = useState(() => {
    if (total === 0) return 0;
    if (typeof initialIndex === "number") {
      return Math.min(Math.max(0, initialIndex), total - 1);
    }
    return Math.floor(Math.random() * total);
  });

  useEffect(() => {
    if (total === 0) {
      setIndex(0);
      return;
    }
    if (typeof initialIndex === "number") {
      setIndex(Math.min(Math.max(0, initialIndex), total - 1));
      return;
    }
    setIndex((current) => (current < total ? current : 0));
  }, [total, initialIndex]);

  useEffect(() => {
    if (paused || total < 2) return;

    let timeoutId = 0;
    let isFirst = true;

    const schedule = () => {
      const delay =
        isFirst && typeof firstHoldMs === "number"
          ? firstHoldMs
          : randomDelay(minMs, maxMs);

      timeoutId = window.setTimeout(() => {
        setIndex((current) => {
          if (isFirst && restAfterCover && current === 0) {
            return randomRestIndex(total);
          }
          return randomOtherIndex(total, current);
        });
        isFirst = false;
        schedule();
      }, delay);
    };

    schedule();
    return () => window.clearTimeout(timeoutId);
  }, [total, minMs, maxMs, paused, firstHoldMs, restAfterCover]);

  return {
    index,
    src: images[index] ?? images[0] ?? "",
    setIndex,
  };
}
