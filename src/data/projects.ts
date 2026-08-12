export const categories = [
  "residential",
  "hospitality",
  "masterplan",
  "commercial",
  "interior",
  "concept",
] as const;

export type Category = (typeof categories)[number];
export type LocaleCode = "en" | "es";

export type LocalizedString = Record<LocaleCode, string>;

export type Project = {
  slug: string;
  year: number;
  latitude: number;
  longitude: number;
  area: string;
  category: Category;
  images: string[];
  /** Portrait/vertical frames preferred for tall collage tiles. */
  portraitImages?: string[];
  /** CSS object-position for the grid cover — keep the building centered. */
  coverFocus?: string;
  name: LocalizedString;
  city: LocalizedString;
  country: LocalizedString;
  description: LocalizedString;
  seoTitle: LocalizedString;
  seoDescription: LocalizedString;
};

export type GridTileShape = "square" | "landscape" | "portrait";

/** Pick a frame that fits the collage tile shape. */
export function getGridImage(
  project: Project,
  shape: GridTileShape,
): string {
  return getImagePool(project, shape)[0] ?? project.images[0];
}

/** Images suited to a tile shape — used for random cover cycling. */
export function getImagePool(
  project: Project,
  shape: GridTileShape = "landscape",
): string[] {
  const portraits = project.portraitImages ?? [];
  if (shape === "portrait" && portraits.length > 0) {
    return portraits;
  }
  if (shape !== "portrait" && portraits.length > 0) {
    const portraitSet = new Set(portraits);
    const landscape = project.images.filter((image) => !portraitSet.has(image));
    if (landscape.length > 0) return landscape;
  }
  return project.images;
}

const projectsData: Project[] = [
  {
    slug: "tiny-home-costa-rica",
    year: 2025,
    latitude: 10.471,
    longitude: -84.645,
    area: "85 m²",
    category: "residential",
    images: [
      "/projects/tiny-home-costa-rica/04.png",
      "/projects/tiny-home-costa-rica/01.png",
      "/projects/tiny-home-costa-rica/02.png",
      "/projects/tiny-home-costa-rica/03.png",
      "/projects/tiny-home-costa-rica/05.png",
      "/projects/tiny-home-costa-rica/06.png",
      "/projects/tiny-home-costa-rica/07.png",
      "/projects/tiny-home-costa-rica/08.png",
      "/projects/tiny-home-costa-rica/09.png",
      "/projects/tiny-home-costa-rica/10.png",
    ],
    coverFocus: "50% 46%",
    name: {
      en: "Tiny Home Costa Rica",
      es: "Tiny Home Costa Rica",
    },
    city: {
      en: "",
      es: "",
    },
    country: {
      en: "Costa Rica",
      es: "Costa Rica",
    },
    description: {
      en: "A prefabricated two-level retreat with curved roofs and warm wood — designed to be replicated and transported fully assembled.",
      es: "Refugio prefabricado de dos niveles con cubiertas curvas y madera cálida — pensado para replicarse y transportarse ya armado.",
    },
    seoTitle: {
      en: "Tiny Home Costa Rica | Architecture Portfolio",
      es: "Tiny Home Costa Rica | Portafolio de arquitectura",
    },
    seoDescription: {
      en: "Prefabricated Tiny Home Costa Rica — replicable and transportable fully assembled.",
      es: "Tiny Home Costa Rica prefabricada — replicable y transportable ya armada.",
    },
  },
  {
    slug: "tiny-home-1-bedroom",
    year: 2025,
    latitude: 10.6342,
    longitude: -85.4377,
    area: "42 m²",
    category: "residential",
    images: [
      "/projects/tiny-home-1-bedroom/01.png",
      "/projects/tiny-home-1-bedroom/02.png",
      "/projects/tiny-home-1-bedroom/03.png",
      "/projects/tiny-home-1-bedroom/04.png",
      "/projects/tiny-home-1-bedroom/05.png",
      "/projects/tiny-home-1-bedroom/06.png",
      "/projects/tiny-home-1-bedroom/07.png",
      "/projects/tiny-home-1-bedroom/08.png",
      "/projects/tiny-home-1-bedroom/09.png",
    ],
    coverFocus: "50% 48%",
    name: {
      en: "Tiny Home 1 Bedroom",
      es: "Tiny Home 1 Recámara",
    },
    city: {
      en: "",
      es: "",
    },
    country: {
      en: "Costa Rica",
      es: "Costa Rica",
    },
    description: {
      en: "A prefabricated one-bedroom tropical cabin with a curved timber roof — built to be replicated and moved already assembled.",
      es: "Cabaña tropical prefabricada de una recámara con cubierta de madera curva — hecha para replicarse y moverse ya armada.",
    },
    seoTitle: {
      en: "Tiny Home 1 Bedroom | Architecture Portfolio",
      es: "Tiny Home 1 Recámara | Portafolio de arquitectura",
    },
    seoDescription: {
      en: "Prefabricated Tiny Home 1 Bedroom — replicable and transportable fully assembled.",
      es: "Tiny Home 1 Recámara prefabricada — replicable y transportable ya armada.",
    },
  },
  {
    slug: "tiny-house-costa-rica",
    year: 2025,
    latitude: 9.9765,
    longitude: -84.8384,
    area: "28 m²",
    category: "residential",
    images: [
      "/projects/tiny-house-costa-rica/01.png",
      "/projects/tiny-house-costa-rica/02.png",
      "/projects/tiny-house-costa-rica/03.png",
    ],
    coverFocus: "50% 48%",
    name: {
      en: "Tiny House Costa Rica",
      es: "Tiny House Costa Rica",
    },
    city: {
      en: "",
      es: "",
    },
    country: {
      en: "Costa Rica",
      es: "Costa Rica",
    },
    description: {
      en: "A prefabricated jungle studio with a curved timber roof — compact, replicable, and transportable fully assembled.",
      es: "Estudio prefabricado en la selva con cubierta de madera curva — compacto, replicable y transportable ya armado.",
    },
    seoTitle: {
      en: "Tiny House Costa Rica | Architecture Portfolio",
      es: "Tiny House Costa Rica | Portafolio de arquitectura",
    },
    seoDescription: {
      en: "Prefabricated Tiny House Costa Rica — replicable and transportable fully assembled.",
      es: "Tiny House Costa Rica prefabricada — replicable y transportable ya armada.",
    },
  },
  {
    slug: "casa-manglar",
    year: 2025,
    latitude: 21.1619,
    longitude: -86.8515,
    area: "550 m²",
    category: "residential",
    images: [
      "/projects/casa-manglar/01.png",
      "/projects/casa-manglar/02.png",
      "/projects/casa-manglar/03.png",
      "/projects/casa-manglar/04.png",
      "/projects/casa-manglar/05.png",
      "/projects/casa-manglar/06.png",
    ],
    portraitImages: [
      "/projects/casa-manglar/03.png",
      "/projects/casa-manglar/05.png",
      "/projects/casa-manglar/06.png",
    ],
    coverFocus: "42% 40%",
    name: {
      en: "Casa Manglar",
      es: "Casa Manglar",
    },
    city: {
      en: "Cancún",
      es: "Cancún",
    },
    country: {
      en: "Mexico",
      es: "México",
    },
    description: {
      en: "Currently under construction in Cancún — pre-sale. Project by Carlo Ávila; façade by Santiago Architecture.",
      es: "En construcción en Cancún — preventa. Proyecto de Carlo Ávila; fachada por Santiago Architecture.",
    },
    seoTitle: {
      en: "Casa Manglar | Architecture Portfolio",
      es: "Casa Manglar | Portafolio de arquitectura",
    },
    seoDescription: {
      en: "Casa Manglar in Cancún — under construction, pre-sale. Project by Carlo Ávila; façade by Santiago Architecture.",
      es: "Casa Manglar en Cancún — en construcción, preventa. Proyecto de Carlo Ávila; fachada por Santiago Architecture.",
    },
  },
  {
    slug: "el-eden-tulum",
    year: 2025,
    latitude: 20.2119,
    longitude: -87.4653,
    area: "12 ha",
    category: "masterplan",
    images: [
      "/projects/el-eden-tulum/01.png",
      "/projects/el-eden-tulum/02.png",
      "/projects/el-eden-tulum/03.png",
      "/projects/el-eden-tulum/04.png",
      "/projects/el-eden-tulum/05.png",
      "/projects/el-eden-tulum/06.png",
      "/projects/el-eden-tulum/07.png",
      "/projects/el-eden-tulum/08.png",
      "/projects/el-eden-tulum/09.png",
    ],
    coverFocus: "50% 42%",
    name: {
      en: "El Eden Tulum",
      es: "El Edén en Tulum",
    },
    city: {
      en: "Tulum",
      es: "Tulum",
    },
    country: {
      en: "Mexico",
      es: "México",
    },
    description: {
      en: "A jungle gateway and site framework of curved canopies, stone walls, and water woven into the forest.",
      es: "Acceso y marco de sitio en la selva con cubiertas curvas, muros de piedra y agua integrada al bosque.",
    },
    seoTitle: {
      en: "El Eden Tulum | Architecture Portfolio",
      es: "El Edén en Tulum | Portafolio de arquitectura",
    },
    seoDescription: {
      en: "El Eden Tulum — masterplan and entrance architecture in the jungle.",
      es: "El Edén en Tulum — plan maestro y acceso en la selva.",
    },
  },
  {
    slug: "aldea-uh-may",
    year: 2025,
    latitude: 20.3647,
    longitude: -87.5903,
    area: "8 ha",
    category: "masterplan",
    images: ["/projects/aldea-uh-may/01.png"],
    coverFocus: "42% 48%",
    name: {
      en: "Aldea Uh May",
      es: "Aldea Uh May",
    },
    city: {
      en: "Uh May",
      es: "Uh May",
    },
    country: {
      en: "Mexico",
      es: "México",
    },
    description: {
      en: "A jungle masterplan of white organic volumes and green roofs woven through retained forest canopy.",
      es: "Plan maestro en la selva con volúmenes orgánicos blancos y cubiertas verdes entre el dosel forestal existente.",
    },
    seoTitle: {
      en: "Aldea Uh May Masterplan | Architecture Portfolio",
      es: "Plan Maestro Aldea Uh May | Portafolio de arquitectura",
    },
    seoDescription: {
      en: "Aldea Uh May — masterplan concept in Tulum’s jungle.",
      es: "Aldea Uh May — concepto de plan maestro en la selva de Tulum.",
    },
  },
  {
    slug: "casa-sisal",
    year: 2024,
    latitude: 21.1658,
    longitude: -90.0315,
    area: "420 m²",
    category: "residential",
    images: [
      "/projects/casa-sisal/01.png",
      "/projects/casa-sisal/02.png",
      "/projects/casa-sisal/03.png",
      "/projects/casa-sisal/04.png",
      "/projects/casa-sisal/05.png",
      "/projects/casa-sisal/06.png",
      "/projects/casa-sisal/07.png",
      "/projects/casa-sisal/08.png",
      "/projects/casa-sisal/09.png",
      "/projects/casa-sisal/10.png",
      "/projects/casa-sisal/11.png",
    ],
    coverFocus: "50% 48%",
    name: {
      en: "Sisal House",
      es: "Casa Sisal",
    },
    city: {
      en: "Sisal",
      es: "Sisal",
    },
    country: {
      en: "Mexico",
      es: "México",
    },
    description: {
      en: "A coastal residence of organic white volumes, sunken living, and indoor-outdoor rooms open to sea breeze.",
      es: "Residencia costera de volúmenes orgánicos blancos, estar hundido y espacios interior-exterior abiertos a la brisa.",
    },
    seoTitle: {
      en: "Sisal House | Architecture Portfolio",
      es: "Casa Sisal | Portafolio de arquitectura",
    },
    seoDescription: {
      en: "Casa Sisal — coastal residential architecture in Yucatán.",
      es: "Casa Sisal — arquitectura residencial costera en Yucatán.",
    },
  },
  {
    slug: "hexodome-cancun",
    year: 2025,
    latitude: 21.079,
    longitude: -86.851,
    area: "65 m²",
    category: "concept",
    images: [
      "/projects/hexodome-cancun/01.png",
      "/projects/hexodome-cancun/02.png",
      "/projects/hexodome-cancun/03.png",
      "/projects/hexodome-cancun/04.png",
      "/projects/hexodome-cancun/05.png",
    ],
    coverFocus: "50% 52%",
    name: {
      en: "Hexodome Cancun",
      es: "Hexodome Cancún",
    },
    city: {
      en: "Cancún",
      es: "Cancún",
    },
    country: {
      en: "Mexico",
      es: "México",
    },
    description: {
      en: "A biomorphic pavilion with a white cellular shell and timber screens, woven into the jungle canopy.",
      es: "Pabellón biomórfico con cascarón celular blanco y celosías de madera, integrado al dosel de la selva.",
    },
    seoTitle: {
      en: "Hexodome Cancun | Architecture Portfolio",
      es: "Hexodome Cancún | Portafolio de arquitectura",
    },
    seoDescription: {
      en: "Hexodome Cancun — organic pavilion concept in the jungle.",
      es: "Hexodome Cancún — concepto de pabellón orgánico en la selva.",
    },
  },
  {
    slug: "tiny-home-spain",
    year: 2025,
    latitude: 36.7213,
    longitude: -4.4214,
    area: "32 m²",
    category: "residential",
    images: [
      "/projects/tiny-home-spain/01.png",
      "/projects/tiny-home-spain/02.png",
      "/projects/tiny-home-spain/03.png",
      "/projects/tiny-home-spain/04.png",
      "/projects/tiny-home-spain/05.png",
      "/projects/tiny-home-spain/06.png",
    ],
    coverFocus: "50% 48%",
    name: {
      en: "Tiny Home Spain",
      es: "Tiny Home España",
    },
    city: {
      en: "",
      es: "",
    },
    country: {
      en: "Spain",
      es: "España",
    },
    description: {
      en: "A prefabricated coastal tiny home with a curved white shell — designed to be replicated and transported fully assembled.",
      es: "Tiny home costera prefabricada con cascarón blanco curvo — pensada para replicarse y transportarse ya armada.",
    },
    seoTitle: {
      en: "Tiny Home Spain | Architecture Portfolio",
      es: "Tiny Home España | Portafolio de arquitectura",
    },
    seoDescription: {
      en: "Prefabricated Tiny Home Spain — replicable and transportable fully assembled.",
      es: "Tiny Home España prefabricada — replicable y transportable ya armada.",
    },
  },
  {
    slug: "casa-nosara",
    year: 2025,
    latitude: 9.974,
    longitude: -85.649,
    area: "180 m²",
    category: "residential",
    images: [
      "/projects/casa-nosara/01.png",
      "/projects/casa-nosara/02.png",
    ],
    coverFocus: "50% 48%",
    name: {
      en: "Nosara House",
      es: "Casa Nosara",
    },
    city: {
      en: "Nosara",
      es: "Nosara",
    },
    country: {
      en: "Costa Rica",
      es: "Costa Rica",
    },
    description: {
      en: "A jungle residence with earthen walls, a thatched roof, and a raised timber walkway woven into the forest.",
      es: "Residencia en la selva con muros de tierra, techo de palapa y pasarela de madera elevada entre el bosque.",
    },
    seoTitle: {
      en: "Nosara House | Architecture Portfolio",
      es: "Casa Nosara | Portafolio de arquitectura",
    },
    seoDescription: {
      en: "Casa Nosara — tropical residential architecture in Costa Rica.",
      es: "Casa Nosara — arquitectura residencial tropical en Costa Rica.",
    },
  },
  {
    slug: "restaurante-nosara",
    year: 2025,
    latitude: 9.981,
    longitude: -85.661,
    area: "320 m²",
    category: "hospitality",
    images: ["/projects/restaurante-nosara/01.png"],
    portraitImages: ["/projects/restaurante-nosara/01.png"],
    coverFocus: "50% 48%",
    name: {
      en: "Nosara Restaurant",
      es: "Restaurante Nosara",
    },
    city: {
      en: "Nosara",
      es: "Nosara",
    },
    country: {
      en: "Costa Rica",
      es: "Costa Rica",
    },
    description: {
      en: "An organic hospitality pavilion of curved shells and timber screens woven into the jungle.",
      es: "Pabellón hospitality orgánico de cascarones curvos y celosías de madera integrado a la selva.",
    },
    seoTitle: {
      en: "Nosara Restaurant | Architecture Portfolio",
      es: "Restaurante Nosara | Portafolio de arquitectura",
    },
    seoDescription: {
      en: "Restaurante Nosara — organic hospitality architecture in Costa Rica.",
      es: "Restaurante Nosara — arquitectura hospitality orgánica en Costa Rica.",
    },
  },
  {
    slug: "villa-nosara",
    year: 2025,
    latitude: 9.986,
    longitude: -85.654,
    area: "260 m²",
    category: "residential",
    images: [
      "/projects/villa-nosara/01.png",
      "/projects/villa-nosara/02.png",
      "/projects/villa-nosara/03.png",
      "/projects/villa-nosara/04.png",
      "/projects/villa-nosara/05.png",
    ],
    portraitImages: [
      "/projects/villa-nosara/01.png",
      "/projects/villa-nosara/04.png",
    ],
    coverFocus: "50% 48%",
    name: {
      en: "Villa Nosara",
      es: "Villa Nosara",
    },
    city: {
      en: "Nosara",
      es: "Nosara",
    },
    country: {
      en: "Costa Rica",
      es: "Costa Rica",
    },
    description: {
      en: "A biomorphic jungle villa of sculpted earth volumes, with living trees rising through the structure.",
      es: "Villa biomórfica en la selva de volúmenes de tierra esculpidos, con árboles vivos atravesando la estructura.",
    },
    seoTitle: {
      en: "Villa Nosara | Architecture Portfolio",
      es: "Villa Nosara | Portafolio de arquitectura",
    },
    seoDescription: {
      en: "Villa Nosara — organic residential architecture in Costa Rica.",
      es: "Villa Nosara — arquitectura residencial orgánica en Costa Rica.",
    },
  },
  {
    slug: "oficinas-mountain-nazca",
    year: 2023,
    latitude: 19.4326,
    longitude: -99.1332,
    area: "480 m²",
    category: "commercial",
    images: [
      "/projects/oficinas-mountain-nazca/01.png",
      "/projects/oficinas-mountain-nazca/02.png",
      "/projects/oficinas-mountain-nazca/03.png",
      "/projects/oficinas-mountain-nazca/04.png",
      "/projects/oficinas-mountain-nazca/05.png",
      "/projects/oficinas-mountain-nazca/06.png",
      "/projects/oficinas-mountain-nazca/07.png",
      "/projects/oficinas-mountain-nazca/08.png",
      "/projects/oficinas-mountain-nazca/09.png",
      "/projects/oficinas-mountain-nazca/10.png",
      "/projects/oficinas-mountain-nazca/11.png",
      "/projects/oficinas-mountain-nazca/12.png",
      "/projects/oficinas-mountain-nazca/13.png",
    ],
    coverFocus: "50% 48%",
    name: {
      en: "Mountain Nazca Offices",
      es: "Oficinas Mountain Nazca",
    },
    city: {
      en: "Mexico City",
      es: "Ciudad de México",
    },
    country: {
      en: "Mexico",
      es: "México",
    },
    description: {
      en: "An open-plan workplace of plywood, concrete, and parametric timber screens — in collaboration with Esteban Sepúlveda and Rodolfo Anaya.",
      es: "Oficina abierta de plywood, concreto y celosías paramétricas de madera — en colaboración con Esteban Sepúlveda y Rodolfo Anaya.",
    },
    seoTitle: {
      en: "Mountain Nazca Offices | Architecture Portfolio",
      es: "Oficinas Mountain Nazca | Portafolio de arquitectura",
    },
    seoDescription: {
      en: "Mountain Nazca offices in Mexico City — commercial interior architecture with Esteban Sepúlveda and Rodolfo Anaya.",
      es: "Oficinas Mountain Nazca en Ciudad de México — arquitectura de interiores comerciales con Esteban Sepúlveda y Rodolfo Anaya.",
    },
  },
  {
    slug: "cabin-tulum",
    year: 2025,
    latitude: 20.178,
    longitude: -87.455,
    area: "95 m²",
    category: "residential",
    images: [
      "/projects/cabin-tulum/01.png",
      "/projects/cabin-tulum/02.png",
      "/projects/cabin-tulum/03.png",
    ],
    portraitImages: [
      "/projects/cabin-tulum/01.png",
      "/projects/cabin-tulum/02.png",
      "/projects/cabin-tulum/03.png",
    ],
    coverFocus: "50% 48%",
    name: {
      en: "Cabin Tulum",
      es: "Cabin Tulum",
    },
    city: {
      en: "Tulum",
      es: "Tulum",
    },
    country: {
      en: "Mexico",
      es: "México",
    },
    description: {
      en: "A thatched jungle cabin of woven timber, stone, and glass — organic volumes woven into the tropical canopy.",
      es: "Cabaña de paja en la selva con madera tejida, piedra y vidrio — volúmenes orgánicos integrados al dosel tropical.",
    },
    seoTitle: {
      en: "Cabin Tulum | Architecture Portfolio",
      es: "Cabin Tulum | Portafolio de arquitectura",
    },
    seoDescription: {
      en: "Cabin Tulum — organic thatched residential architecture in the jungle.",
      es: "Cabin Tulum — arquitectura residencial orgánica de paja en la selva.",
    },
  },
  {
    slug: "bali-resort",
    year: 2026,
    latitude: -8.5069,
    longitude: 115.2625,
    area: "—",
    category: "hospitality",
    images: [
      "/projects/bali-resort/01.png",
      "/projects/bali-resort/02.png",
      "/projects/bali-resort/03.png",
      "/projects/bali-resort/04.png",
      "/projects/bali-resort/05.png",
    ],
    portraitImages: [
      "/projects/bali-resort/04.png",
      "/projects/bali-resort/05.png",
    ],
    coverFocus: "48% 42%",
    name: {
      en: "Bali Resort",
      es: "Resort Bali",
    },
    city: {
      en: "Bali",
      es: "Bali",
    },
    country: {
      en: "Indonesia",
      es: "Indonesia",
    },
    description: {
      en: "A bamboo eco-resort of elevated pods, woven canopies, and terraced pools woven into the Balinese jungle.",
      es: "Eco-resort de bambú con pods elevados, cubiertas tejidas y piscinas terrazadas integradas a la selva de Bali.",
    },
    seoTitle: {
      en: "Bali Resort | Architecture Portfolio",
      es: "Resort Bali | Portafolio de arquitectura",
    },
    seoDescription: {
      en: "Bali Resort — bamboo eco-resort hospitality architecture in Indonesia.",
      es: "Resort Bali — arquitectura hospitality de eco-resort en bambú en Indonesia.",
    },
  },
  {
    slug: "jungle-house-tulum",
    year: 2026,
    latitude: 20.195,
    longitude: -87.448,
    area: "380 m²",
    category: "residential",
    images: [
      "/projects/jungle-house-tulum/01.png",
      "/projects/jungle-house-tulum/02.png",
      "/projects/jungle-house-tulum/03.png",
      "/projects/jungle-house-tulum/04.png",
      "/projects/jungle-house-tulum/05.png",
      "/projects/jungle-house-tulum/06.png",
      "/projects/jungle-house-tulum/07.png",
      "/projects/jungle-house-tulum/08.png",
      "/projects/jungle-house-tulum/09.png",
      "/projects/jungle-house-tulum/10.png",
    ],
    portraitImages: [
      "/projects/jungle-house-tulum/01.png",
      "/projects/jungle-house-tulum/02.png",
      "/projects/jungle-house-tulum/03.png",
      "/projects/jungle-house-tulum/04.png",
      "/projects/jungle-house-tulum/05.png",
      "/projects/jungle-house-tulum/06.png",
      "/projects/jungle-house-tulum/07.png",
      "/projects/jungle-house-tulum/08.png",
      "/projects/jungle-house-tulum/09.png",
      "/projects/jungle-house-tulum/10.png",
    ],
    coverFocus: "50% 42%",
    name: {
      en: "Jungle House Tulum",
      es: "Jungle House Tulum",
    },
    city: {
      en: "Tulum",
      es: "Tulum",
    },
    country: {
      en: "Mexico",
      es: "México",
    },
    description: {
      en: "An organic sculptural residence in the Tulum jungle — sand and stone forms, soft curves, and vegetation woven through the architecture.",
      es: "Residencia escultórica orgánica en la selva de Tulum — formas de arena y piedra, curvas suaves y vegetación integrada a la arquitectura.",
    },
    seoTitle: {
      en: "Jungle House Tulum | Architecture Portfolio",
      es: "Jungle House Tulum | Portafolio de arquitectura",
    },
    seoDescription: {
      en: "Jungle House Tulum — organic sculptural residential architecture in the jungle.",
      es: "Jungle House Tulum — arquitectura residencial escultórica orgánica en la selva.",
    },
  },
];

/** Most visually striking projects first (list, hero, next-project flow). */
const ATTRACTIVENESS_ORDER = [
  "casa-sisal",
  "jungle-house-tulum",
  "cabin-tulum",
  "casa-manglar",
  "villa-nosara",
  "oficinas-mountain-nazca",
  "el-eden-tulum",
  "hexodome-cancun",
  "bali-resort",
  "restaurante-nosara",
  "casa-nosara",
  "aldea-uh-may",
  "tiny-home-costa-rica",
  "tiny-home-spain",
  "tiny-home-1-bedroom",
  "tiny-house-costa-rica",
] as const;

export const projects: Project[] = (() => {
  const bySlug = new Map(projectsData.map((project) => [project.slug, project]));
  const ordered: Project[] = [];
  for (const slug of ATTRACTIVENESS_ORDER) {
    const project = bySlug.get(slug);
    if (project) {
      ordered.push(project);
      bySlug.delete(slug);
    }
  }
  for (const project of bySlug.values()) ordered.push(project);
  return ordered;
})();

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getLocalized(
  value: LocalizedString,
  locale: LocaleCode,
): string {
  return value[locale] ?? value.en;
}

/** Display as "country, city". */
export function formatPlace(project: Project, locale: LocaleCode): string {
  const country = getLocalized(project.country, locale).trim();
  const city = getLocalized(project.city, locale).trim();
  if (!city) return country;
  if (!country) return city;
  return `${country}, ${city}`;
}

export function getNextProject(slug: string): Project | undefined {
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1) return undefined;
  return projects[(index + 1) % projects.length];
}

export function filterProjects(category?: string | null): Project[] {
  if (!category || category === "all") return projects;
  return projects.filter((project) => project.category === category);
}
