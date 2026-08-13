"use client";

import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  getLocalized,
  formatPlace,
  type LocaleCode,
  type Project,
} from "@/data/projects";
import { useRandomImageCycle } from "@/hooks/useRandomImageCycle";
import { usePushFromPointer } from "@/hooks/usePushFromPointer";
import { IMAGE_QUALITY, IMAGE_UNOPTIMIZED } from "@/lib/images";
import {
  ExpandImageButton,
  ProjectLightbox,
  lightboxIndexForSrc,
} from "./ProjectLightbox";
import styles from "./ProjectList.module.css";

type Props = {
  projects: Project[];
};

type EntryProps = {
  project: Project;
  locale: LocaleCode;
  priority: boolean;
};

function ProjectListEntry({ project, locale, priority }: EntryProps) {
  const t = useTranslations("Projects");
  const images = project.images;
  const total = images.length;
  const name = getLocalized(project.name, locale);
  const place = formatPlace(project, locale);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { style: pushStyle, handlers: pushHandlers } = usePushFromPointer({
    maxTilt: 8,
  });
  const { index, src, setIndex } = useRandomImageCycle(images, {
    initialIndex: 0,
    firstHoldMs: 5200,
    restAfterCover: true,
  });

  return (
    <li className={styles.entry}>
      <div className={styles.block}>
        <div className={styles.stage}>
          <div className={styles.media} {...pushHandlers}>
            {src ? (
              <div className={styles.imageShell}>
                <Link
                  href={`/projects/${project.slug}`}
                  className={styles.imageLink}
                  aria-label={name}
                >
                  <div className={styles.pushFrame} style={pushStyle}>
                    <Image
                      key={src}
                      src={src}
                      alt={
                        place
                          ? `${name} — ${place} — ${index + 1}`
                          : `${name} — ${index + 1}`
                      }
                      width={1920}
                      height={1080}
                      priority={priority}
                      quality={IMAGE_QUALITY}
                      unoptimized={IMAGE_UNOPTIMIZED}
                      sizes="100vw"
                      className={styles.image}
                    />
                  </div>
                </Link>
                <ExpandImageButton
                  variant="ghost"
                  onClick={() => {
                    setLightboxIndex(lightboxIndexForSrc(images, src));
                    setLightboxOpen(true);
                  }}
                />
              </div>
            ) : null}

            {total > 1 ? (
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
                    onClick={() => setIndex(i)}
                    aria-label={`${t("image")} ${i + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className={styles.meta}>
            <div className={styles.index}>
              <span className={`${styles.indexItem} ${styles.indexProject}`}>
                <span className={styles.indexLabel}>{t("labels.project")}</span>
                <Link
                  href={`/projects/${project.slug}`}
                  className={styles.indexValueLink}
                >
                  {name}
                </Link>
              </span>
              {place ? (
                <span className={styles.indexItem}>
                  <span className={styles.indexLabel}>{t("labels.location")}</span>
                  <span className={styles.indexValue}>{place}</span>
                </span>
              ) : null}
              <span className={styles.indexItem}>
                <span className={styles.indexLabel}>{t("labels.typology")}</span>
                <span className={styles.indexValue}>
                  {t(`filters.${project.category}`)}
                </span>
              </span>
              <span className={styles.indexItem}>
                <span className={styles.indexLabel}>{t("labels.year")}</span>
                <span className={styles.indexValue}>{project.year}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <ProjectLightbox
        images={images}
        alt={place ? `${name} — ${place}` : name}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </li>
  );
}

export function ProjectList({ projects }: Props) {
  const t = useTranslations("Projects");
  const locale = useLocale() as LocaleCode;

  if (projects.length === 0) {
    return <p className={styles.empty}>{t("empty")}</p>;
  }

  return (
    <ul className={styles.list}>
      {projects.map((project, index) => (
        <ProjectListEntry
          key={project.slug}
          project={project}
          locale={locale}
          priority={index < 2}
        />
      ))}
    </ul>
  );
}
