import {
  getProjectCategories,
  type Category,
  type Project,
} from "@/data/projects";

export const PROJECT_FILTERS = [
  { id: "all", slug: "all", match: null },
  { id: "residential", slug: "residential", match: ["residential"] },
  { id: "hospitality", slug: "hospitality", match: ["hospitality"] },
  {
    id: "masterplan",
    slug: "masterplan",
    match: ["masterplan"],
  },
  {
    id: "commercial",
    slug: "commercial",
    match: ["workplace", "pavilion", "interior"],
  },
  { id: "tinyLiving", slug: "tiny-living", match: ["tinyLiving"] },
] as const;

export type ProjectFilterId = (typeof PROJECT_FILTERS)[number]["id"];

export function parseProjectFilter(
  value?: string | string[] | null,
): ProjectFilterId {
  const slug = Array.isArray(value) ? value[0] : value;
  if (!slug) return "all";
  const match = PROJECT_FILTERS.find(
    (filter) => filter.slug === slug || filter.id === slug,
  );
  return match?.id ?? "all";
}

export function getProjectFilterSlug(id: ProjectFilterId): string | null {
  if (id === "all") return null;
  return PROJECT_FILTERS.find((filter) => filter.id === id)?.slug ?? null;
}

export function filterProjectsByGroup(
  items: Project[],
  filterId: ProjectFilterId,
): Project[] {
  const filter = PROJECT_FILTERS.find((entry) => entry.id === filterId);
  if (!filter || filter.match == null) return items;
  const match = filter.match as readonly Category[];
  return items.filter((project) =>
    getProjectCategories(project).some((category) => match.includes(category)),
  );
}
