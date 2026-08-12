"use client";

import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

type Options = {
  /** Max rotation in degrees. */
  maxTilt?: number;
};

type PushHandlers = {
  onPointerEnter: () => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerLeave: () => void;
};

/**
 * Pushes the hovered corner back in 3D perspective
 * (no slide — the surface dips away under the cursor).
 */
export function usePushFromPointer(options: Options = {}): {
  style: CSSProperties;
  handlers: PushHandlers;
  hovering: boolean;
} {
  const maxTilt = options.maxTilt ?? 11;
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(!media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const onPointerEnter = useCallback(() => {
    setHovering(true);
  }, []);

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      setHovering(true);
      setTilt({
        x: (0.5 - y) * 2 * maxTilt,
        y: (x - 0.5) * 2 * maxTilt,
      });
    },
    [enabled, maxTilt],
  );

  const onPointerLeave = useCallback(() => {
    setHovering(false);
    setTilt({ x: 0, y: 0 });
  }, []);

  return {
    hovering,
    style: {
      transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
      transition: hovering
        ? "transform 0.14s ease-out"
        : "transform 0.55s var(--ease)",
      transformStyle: "preserve-3d" as const,
      willChange: "transform",
      backfaceVisibility: "hidden" as const,
      WebkitBackfaceVisibility: "hidden" as const,
      boxShadow: "none",
      filter: "none",
      outline: "none",
    },
    handlers: {
      onPointerEnter,
      onPointerMove,
      onPointerLeave,
    },
  };
}
