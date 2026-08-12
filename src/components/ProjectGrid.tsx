"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  getImagePool,
  getLocalized,
  formatPlace,
  type GridTileShape,
  type LocaleCode,
  type Project,
} from "@/data/projects";
import { useRandomImageCycle } from "@/hooks/useRandomImageCycle";
import { usePushFromPointer } from "@/hooks/usePushFromPointer";
import { IMAGE_QUALITY, IMAGE_UNOPTIMIZED } from "@/lib/images";
import { useReveal } from "@/hooks/useReveal";
import styles from "./ProjectGrid.module.css";

/** Always rendered large in the collage. */
const FEATURED_SLUGS = [
  "casa-sisal",
  "jungle-house-tulum",
  "cabin-tulum",
  "casa-manglar",
  "villa-nosara",
] as const;

/** Balanced tiles for the remaining projects — no ultra-wide banners. */
const TILE_CYCLE = [
  { className: "tileA", shape: "landscape" },
  { className: "tileB", shape: "square" },
  { className: "tileC", shape: "portrait" },
  { className: "tileD", shape: "landscape" },
  { className: "tileE", shape: "square" },
  { className: "tileF", shape: "portrait" },
  { className: "tileG", shape: "landscape" },
  { className: "tileH", shape: "square" },
] as const satisfies ReadonlyArray<{
  className: keyof typeof styles;
  shape: GridTileShape;
}>;

type Props = {
  projects: Project[];
};

type CollageItem = {
  project: Project;
  className: keyof typeof styles;
  shape: GridTileShape;
};

function isPortraitSlot(index: number) {
  return TILE_CYCLE[index % TILE_CYCLE.length].shape === "portrait";
}

function orderRestForCollage(projects: Project[]): Project[] {
  const ordered = [...projects];
  for (let slot = 0; slot < ordered.length; slot++) {
    if (!isPortraitSlot(slot)) continue;
    if (ordered[slot]?.portraitImages?.length) continue;
    const swapWith = ordered.findIndex(
      (project, index) =>
        index > slot &&
        Boolean(project.portraitImages?.length) &&
        !isPortraitSlot(index),
    );
    if (swapWith === -1) continue;
    const temp = ordered[slot];
    ordered[slot] = ordered[swapWith];
    ordered[swapWith] = temp;
  }
  return ordered;
}

function buildCollage(projects: Project[]): CollageItem[] {
  const featured = FEATURED_SLUGS.map((slug) =>
    projects.find((project) => project.slug === slug),
  ).filter((project): project is Project => Boolean(project));

  const featuredSet = new Set<string>(FEATURED_SLUGS);
  const rest = orderRestForCollage(
    projects.filter((project) => !featuredSet.has(project.slug)),
  );

  const items: CollageItem[] = featured.map((project) => ({
    project,
    className: "tileFeatured",
    shape: "landscape",
  }));

  rest.forEach((project, index) => {
    const tile = TILE_CYCLE[index % TILE_CYCLE.length];
    items.push({
      project,
      className: tile.className,
      shape: tile.shape,
    });
  });

  return items;
}

type TileProps = {
  project: Project;
  className: keyof typeof styles;
  shape: GridTileShape;
  locale: LocaleCode;
  priority: boolean;
};

function ProjectTile({
  project,
  className,
  shape,
  locale,
  priority,
}: TileProps) {
  const pool = getImagePool(project, shape);
  const name = getLocalized(project.name, locale);
  const { style: pushStyle, handlers: pushHandlers } = usePushFromPointer({
    maxTilt: 12,
  });
  const { src } = useRandomImageCycle(pool, {
    initialIndex: 0,
    firstHoldMs: 5200,
    restAfterCover: true,
  });
  const { ref, visible } = useReveal<HTMLLIElement>({
    rootMargin: "0px 0px -6% 0px",
    threshold: 0.08,
  });
  const focus =
    shape === "portrait"
      ? (project.coverFocus ?? "50% 42%")
      : (project.coverFocus ?? "50% 45%");

  return (
    <li
      ref={ref}
      className={`${styles[className]} revealImage ${visible ? "revealVisible" : ""}`}
    >
      <Link
        href={`/projects/${project.slug}`}
        className={styles.item}
        {...pushHandlers}
      >
        {src ? (
          <div className={styles.imageFrame} style={pushStyle}>
            <Image
              key={src}
              src={src}
              alt={name}
              fill
              sizes="100vw"
              quality={IMAGE_QUALITY}
              unoptimized={IMAGE_UNOPTIMIZED}
              className={styles.image}
              style={{ objectPosition: focus }}
              priority={priority}
            />
          </div>
        ) : null}
        <div className={styles.meta}>
          <h2>{name}</h2>
          <p>{formatPlace(project, locale)}</p>
        </div>
      </Link>
    </li>
  );
}

export function ProjectGrid({ projects }: Props) {
  const t = useTranslations("Projects");
  const locale = useLocale() as LocaleCode;
  const items = buildCollage(projects);

  if (items.length === 0) {
    return <p className={styles.empty}>{t("empty")}</p>;
  }

  return (
    <ul className={styles.collage}>
      {items.map(({ project, className, shape }, index) => (
        <ProjectTile
          key={project.slug}
          project={project}
          className={className}
          shape={shape}
          locale={locale}
          priority={index < 6}
        />
      ))}
    </ul>
  );
}
