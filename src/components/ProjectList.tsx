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
        <div className={styles.media} {...pushHandlers}>
          {src ? (
            <div className={styles.imageShell}>
              <div className={styles.pushFrame} style={pushStyle}>
                <Image
                  key={src}
                  src={src}
                  alt={`${name} — ${index + 1}`}
                  width={1920}
                  height={1080}
                  priority={priority}
                  quality={IMAGE_QUALITY}
                  unoptimized={IMAGE_UNOPTIMIZED}
                  sizes="100vw"
                  className={styles.image}
                />
              </div>
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
          <div className={styles.copy}>
            <p className={styles.kicker}>{t(`filters.${project.category}`)}</p>
            <h2 className={styles.name}>
              <Link href={`/projects/${project.slug}`}>{name}</Link>
            </h2>
            <p className={styles.detail}>{formatPlace(project, locale)}</p>
            <p className={styles.summary}>
              {getLocalized(project.description, locale)}
            </p>
          </div>
          <Link href={`/projects/${project.slug}`} className={styles.cta}>
            {t("viewProject")}
          </Link>
        </div>
      </div>
      <ProjectLightbox
        images={images}
        alt={name}
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
