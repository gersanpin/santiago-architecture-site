"use client";

import { useCallback, lazy, Suspense } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import type { Project } from "@/data/projects";
import {
  filterProjectsByGroup,
  getProjectFilterSlug,
  parseProjectFilter,
  PROJECT_FILTERS,
  type ProjectFilterId,
} from "@/lib/project-filters";
import { ProjectGrid } from "./ProjectGrid";
import { ProjectList } from "./ProjectList";
import styles from "./ProjectsExplorer.module.css";

const ProjectGlobe = lazy(() =>
  import("./ProjectGlobe").then((mod) => ({ default: mod.ProjectGlobe })),
);

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
  const filterId = parseProjectFilter(searchParams.get("category"));
  const visibleProjects = filterProjectsByGroup(projects, filterId);
  const filterLead =
    filterId === "tinyLiving" ? t("filterLeads.tinyLiving") : null;
  const globeSelectedSlug = visibleProjects.some(
    (project) => project.slug === selectedSlug,
  )
    ? selectedSlug
    : null;

  const updateParams = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([key, value]) => {
        if (
          value == null ||
          value === "" ||
          (key === "view" && value === "grid") ||
          (key === "category" && value === "all")
        ) {
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

  function selectFilter(id: ProjectFilterId) {
    updateParams({ category: getProjectFilterSlug(id) });
  }

  return (
    <div className={styles.explorer}>
      <div className={styles.toolbar}>
        <div
          className={styles.filters}
          role="radiogroup"
          aria-label={t("categories")}
        >
          {PROJECT_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              role="radio"
              aria-checked={filterId === filter.id}
              className={filterId === filter.id ? styles.active : undefined}
              onClick={() => selectFilter(filter.id)}
            >
              {t(`filters.${filter.id}`)}
            </button>
          ))}
        </div>
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

      {filterLead ? <p className={styles.filterLead}>{filterLead}</p> : null}

      {view === "grid" ? (
        <section className={styles.bleed} aria-label={t("title")}>
          <ProjectGrid projects={visibleProjects} />
        </section>
      ) : null}

      {view === "list" ? (
        <section className={styles.bleed} aria-label={t("listView")}>
          <ProjectList projects={visibleProjects} />
        </section>
      ) : null}

      {view === "globe" ? (
        <div className={styles.globeWrap}>
          <Suspense fallback={<p className={styles.globeLoading}>{t("globeLoading")}</p>}>
            <ProjectGlobe
              projects={visibleProjects}
              selectedSlug={globeSelectedSlug}
              onSelect={(slug) => updateParams({ project: slug })}
            />
          </Suspense>
        </div>
      ) : null}
    </div>
  );
}
