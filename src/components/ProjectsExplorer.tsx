"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import type { Project } from "@/data/projects";
import { ProjectGrid } from "./ProjectGrid";
import { ProjectGlobe } from "./ProjectGlobe";
import { ProjectList } from "./ProjectList";
import styles from "./ProjectsExplorer.module.css";

type ViewMode = "grid" | "list" | "globe";

type Props = {
  projects: Project[];
};

function parseView(value: string | null): ViewMode {
  if (value === "globe" || value === "list") return value;
  return "grid";
}

export function ProjectsExplorer({ projects }: Props) {
  const t = useTranslations("Projects");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const view = parseView(searchParams.get("view"));
  const selectedSlug = searchParams.get("project");

  const updateParams = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("category");
      Object.entries(patch).forEach(([key, value]) => {
        if (value == null || value === "" || (key === "view" && value === "grid")) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      if (patch.view && patch.view !== "globe") {
        params.delete("project");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  return (
    <div className={styles.explorer}>
      <div className={styles.toolbar}>
        <div className={styles.views} role="tablist" aria-label="View mode">
          <button
            type="button"
            role="tab"
            aria-selected={view === "grid"}
            className={view === "grid" ? styles.active : undefined}
            onClick={() => updateParams({ view: "grid" })}
          >
            {t("gridView")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "list"}
            className={view === "list" ? styles.active : undefined}
            onClick={() => updateParams({ view: "list" })}
          >
            {t("listView")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "globe"}
            className={view === "globe" ? styles.active : undefined}
            onClick={() => updateParams({ view: "globe" })}
          >
            {t("globeView")}
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <section className={styles.bleed} aria-label={t("title")}>
          <ProjectGrid projects={projects} />
        </section>
      ) : null}

      {view === "list" ? (
        <section className={styles.bleed} aria-label={t("listView")}>
          <ProjectList projects={projects} />
        </section>
      ) : null}

      {view === "globe" ? (
        <div className={styles.globeWrap}>
          <ProjectGlobe
            projects={projects}
            selectedSlug={selectedSlug}
            onSelect={(slug) => updateParams({ project: slug })}
          />
        </div>
      ) : null}
    </div>
  );
}
