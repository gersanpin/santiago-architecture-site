"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { IMAGE_QUALITY, IMAGE_UNOPTIMIZED } from "@/lib/images";
import styles from "./ProjectLightbox.module.css";

type ExpandProps = {
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  /** `ghost`: icon-only, no pill — for list view overlays. */
  variant?: "default" | "ghost";
};

/** Top-right control to open the fullscreen gallery. */
export function ExpandImageButton({
  onClick,
  className,
  variant = "default",
}: ExpandProps) {
  const t = useTranslations("Projects");
  const base =
    variant === "ghost"
      ? `${styles.expand} ${styles.expandGhost}`
      : styles.expand;

  return (
    <button
      type="button"
      className={className ? `${base} ${className}` : base}
      aria-label={t("expand")}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick(event);
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
    >
      <svg
        className={styles.expandIcon}
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="square"
        />
      </svg>
    </button>
  );
}

type LightboxProps = {
  images: string[];
  alt: string;
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
};

function clampIndex(index: number, total: number) {
  if (total <= 0) return 0;
  return ((index % total) + total) % total;
}

/** Fullscreen (near-fullscreen) gallery overlay for a project's images. */
export function ProjectLightbox({
  images,
  alt,
  initialIndex = 0,
  open,
  onClose,
}: LightboxProps) {
  const t = useTranslations("Projects");
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const total = images.length;
  const [index, setIndex] = useState(() => clampIndex(initialIndex, total));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setIndex(clampIndex(initialIndex, total));
  }, [open, initialIndex, total]);

  const goTo = useCallback(
    (next: number) => {
      if (total < 2) return;
      setIndex(clampIndex(next, total));
    },
    [total],
  );

  const previous = useCallback(() => {
    setIndex((current) => clampIndex(current - 1, total));
  }, [total]);

  const next = useCallback(() => {
    setIndex((current) => clampIndex(current + 1, total));
  }, [total]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }
      if (total < 2) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        event.stopPropagation();
        setIndex((current) => clampIndex(current - 1, total));
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        event.stopPropagation();
        setIndex((current) => clampIndex(current + 1, total));
      }
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, onClose, total]);

  if (!mounted || !open || total === 0) return null;

  const src = images[index] ?? images[0];

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className={styles.srOnly}>
          {alt}
        </h2>

        <button
          ref={closeRef}
          type="button"
          className={styles.close}
          aria-label={t("close")}
          onClick={onClose}
        >
          ×
        </button>

        <div className={styles.stage}>
          {src ? (
            <Image
              key={src}
              src={src}
              alt={`${alt} — ${index + 1}`}
              width={1920}
              height={1080}
              quality={IMAGE_QUALITY}
              unoptimized={IMAGE_UNOPTIMIZED}
              sizes="100vw"
              className={styles.image}
              priority
            />
          ) : null}

          {total > 1 ? (
            <>
              <button
                type="button"
                className={`${styles.nav} ${styles.navPrev}`}
                onClick={previous}
                aria-label={t("previousImage")}
              >
                ←
              </button>
              <button
                type="button"
                className={`${styles.nav} ${styles.navNext}`}
                onClick={next}
                aria-label={t("nextImage")}
              >
                →
              </button>
            </>
          ) : null}
        </div>

        {total > 1 ? (
          <div className={styles.footer}>
            <p className={styles.counter}>
              {index + 1} / {total}
            </p>
            <div
              className={styles.dots}
              role="tablist"
              aria-label={t("gallery")}
            >
              {images.map((image, i) => (
                <button
                  key={image}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  className={i === index ? styles.dotActive : undefined}
                  onClick={() => goTo(i)}
                  aria-label={`${t("image")} ${i + 1}`}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

type TriggerProps = {
  images: string[];
  alt: string;
  /** Index within `images` when opening (falls back via currentSrc). */
  currentIndex?: number;
  /** Prefer matching this src in `images` when opening. */
  currentSrc?: string;
  expandClassName?: string;
  children?: ReactNode;
};

/** Expand button + lightbox; keeps local open state for one project gallery. */
export function ProjectLightboxTrigger({
  images,
  alt,
  currentIndex,
  currentSrc,
  expandClassName,
  children,
}: TriggerProps) {
  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  if (images.length === 0) return children ?? null;

  const resolveStart = () => {
    if (typeof currentIndex === "number") {
      return clampIndex(currentIndex, images.length);
    }
    if (currentSrc) {
      const found = images.indexOf(currentSrc);
      if (found >= 0) return found;
    }
    return 0;
  };

  return (
    <>
      {children}
      <ExpandImageButton
        className={expandClassName}
        onClick={() => {
          setStartIndex(resolveStart());
          setOpen(true);
        }}
      />
      <ProjectLightbox
        images={images}
        alt={alt}
        initialIndex={startIndex}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

/** Resolve opening index from a cycling pool src against full project images. */
export function lightboxIndexForSrc(images: string[], src: string) {
  const found = images.indexOf(src);
  return found >= 0 ? found : 0;
}
