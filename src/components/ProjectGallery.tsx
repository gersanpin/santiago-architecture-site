"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import { IMAGE_QUALITY, IMAGE_UNOPTIMIZED } from "@/lib/images";
import { usePushFromPointer } from "@/hooks/usePushFromPointer";
import { ExpandImageButton, ProjectLightbox } from "./ProjectLightbox";
import styles from "./ProjectGallery.module.css";

type Props = {
  images: string[];
  alt: string;
  children?: ReactNode;
};

export function ProjectGallery({ images, alt, children }: Props) {
  const t = useTranslations("Projects");
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const total = images.length;
  const src = images[index] ?? images[0];

  const goTo = useCallback(
    (next: number) => {
      if (total === 0) return;
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  const previous = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const { style: pushStyle, handlers: pushHandlers } = usePushFromPointer({
    maxTilt: 10,
  });

  useEffect(() => {
    if (lightboxOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, previous, lightboxOpen]);

  if (total === 0) return null;

  return (
    <div className={styles.gallery}>
      <div className={styles.column}>
        <div className={styles.media} {...pushHandlers}>
          {src ? (
            <Image
              key={src}
              src={src}
              alt={`${alt} — ${index + 1}`}
              width={1920}
              height={1080}
              priority
              quality={IMAGE_QUALITY}
              unoptimized={IMAGE_UNOPTIMIZED}
              sizes="100vw"
              className={styles.image}
              style={{ width: "auto", height: "auto", ...pushStyle }}
            />
          ) : null}

          <ExpandImageButton
            onClick={() => {
              setLightboxOpen(true);
            }}
          />

          {total > 1 ? (
            <>
              <button
                type="button"
                className={`${styles.hit} ${styles.hitPrev}`}
                onClick={previous}
                aria-label={t("previousImage")}
              >
                <span className={styles.arrow} aria-hidden="true">
                  ←
                </span>
              </button>
              <button
                type="button"
                className={`${styles.hit} ${styles.hitNext}`}
                onClick={next}
                aria-label={t("nextImage")}
              >
                <span className={styles.arrow} aria-hidden="true">
                  →
                </span>
              </button>
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
            </>
          ) : null}
        </div>

        {children ? <div className={styles.caption}>{children}</div> : null}
      </div>

      <ProjectLightbox
        images={images}
        alt={alt}
        initialIndex={index}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
