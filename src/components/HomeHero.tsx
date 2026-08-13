"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IMAGE_QUALITY_HERO, IMAGE_UNOPTIMIZED } from "@/lib/images";
import styles from "./HomeHero.module.css";

const INTERVAL_MS = 6500;

export type HomeSlide = {
  src: string;
  name: string;
  place: string;
  href: string;
};

type Props = {
  slides: HomeSlide[];
};

export function HomeHero({ slides }: Props) {
  const t = useTranslations("Home");
  const items =
    slides.length > 0
      ? slides
      : [
          {
            src: "/projects/casa-sisal/01.png",
            name: "Casa Sisal",
            place: "Sisal, Mexico",
            href: "/projects/casa-sisal",
          },
        ];
  const [active, setActive] = useState(0);
  const current = items[active] ?? items[0];

  useEffect(() => {
    if (items.length < 2) return;
    const id = window.setInterval(() => {
      setActive((value) => (value + 1) % items.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [items.length]);

  return (
    <section className={styles.hero}>
      <div className={styles.slides} aria-hidden="true">
        {items.map((slide, index) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt=""
            fill
            priority={index === 0}
            quality={IMAGE_QUALITY_HERO}
            unoptimized={IMAGE_UNOPTIMIZED}
            className={`${styles.heroImage} ${
              index === active ? styles.heroImageActive : ""
            }`}
            sizes="100vw"
          />
        ))}
      </div>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <div className={`${styles.copy} fade-up`}>
          <p className={styles.brand}>{t("brand")}</p>
          <h1 className={`${styles.headline} fade-up fade-up-delay`}>
            {t("headline")}
          </h1>
          <p className={`${styles.support} fade-up fade-up-delay-2`}>
            {t("support")}
          </p>
        </div>
        <div className={`${styles.actions} fade-up fade-up-delay-2`}>
          <Link href="/projects" className="btn btn-primary">
            {t("exploreProjects")}
          </Link>
          <Link href="/contact?start=1" className="btn btn-ghost">
            {t("startProject")}
          </Link>
        </div>
      </div>
      {current ? (
        <Link href={current.href} className={styles.credit}>
          <span className={styles.creditName}>{current.name}</span>
          {current.place ? (
            <span className={styles.creditPlace}>{current.place}</span>
          ) : null}
        </Link>
      ) : null}
    </section>
  );
}
