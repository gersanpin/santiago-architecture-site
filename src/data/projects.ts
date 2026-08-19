export const categories = [
  "residential",
  "hospitality",
  "masterplan",
  "workplace",
  "pavilion",
  "interior",
] as const;

export type Category = (typeof categories)[number];
export type LocaleCode = "en" | "es";

export type LocalizedString = Record<LocaleCode, string>;

export type ProjectCaseStudy = {
  context?: LocalizedString;
  site?: LocalizedString;
  designApproach?: LocalizedString;
  materials?: LocalizedString;
  landscapeStrategy?: LocalizedString;
  sustainability?: LocalizedString;
  construction?: LocalizedString;
  scope?: LocalizedString;
};

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
  /** Optional credit / collaboration line shown after the description. */
  credit?: LocalizedString;
  /** Optional status (e.g. under construction) — only when real. */
  status?: LocalizedString;
  /** Optional scope when the studio contributed only part of the work. */
  scope?: LocalizedString;
  /** Optional editorial sections for future, fact-checked case studies. */
  caseStudy?: ProjectCaseStudy;
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
    year: 2024,
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
      en: "A two-level prefabricated retreat of 85 m² with curved roofs and warm wood, transported as separate upper and lower modules and assembled on site.",
      es: "Un refugio prefabricado de dos niveles y 85 m² con cubiertas curvas y madera cálida, transportado en dos módulos —superior e inferior— y ensamblado en sitio.",
    },
    seoTitle: {
      en: "Tiny Home Costa Rica",
      es: "Tiny Home Costa Rica",
    },
    seoDescription: {
      en: "Tiny Home Costa Rica — a two-level prefabricated retreat transported in two modules and assembled on site.",
      es: "Tiny Home Costa Rica — refugio prefabricado de dos niveles transportado en dos módulos y ensamblado en sitio.",
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
      es: "Tiny Home 1 Bedroom",
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
      en: "A compact one-bedroom home of 42 m² under a curved timber roof, designed as a modular system that can grow over time by adding more rooms.",
      es: "Una vivienda compacta de una recámara y 42 m² bajo una cubierta de madera curva, diseñada como un sistema modular que puede crecer con el tiempo al añadir más habitaciones.",
    },
    seoTitle: {
      en: "Tiny Home 1 Bedroom",
      es: "Tiny Home 1 Bedroom",
    },
    seoDescription: {
      en: "Tiny Home 1 Bedroom — a compact modular home designed to grow by adding rooms over time.",
      es: "Tiny Home 1 Bedroom — vivienda modular compacta diseñada para crecer al añadir habitaciones con el tiempo.",
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
      en: "A 28 m² prefabricated studio with a curved timber roof — the most compact unit in the series, sized for essential living.",
      es: "Un estudio prefabricado de 28 m² con cubierta de madera curva — la unidad más compacta de la serie, dimensionada para lo esencial.",
    },
    seoTitle: {
      en: "Tiny House Costa Rica",
      es: "Tiny House Costa Rica",
    },
    seoDescription: {
      en: "Tiny House Costa Rica — a compact 28 m² prefabricated studio with a curved timber roof.",
      es: "Tiny House Costa Rica — estudio prefabricado compacto de 28 m² con cubierta de madera curva.",
    },
  },
  {
    slug: "casa-manglar",
    year: 2026,
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
      en: "Façade design for a residential project in Cancún, conceived as a continuous architectural skin of curved balconies, vegetation and horizontal layers.",
      es: "Diseño de fachada para un proyecto residencial en Cancún, concebida como una envolvente continua de balcones curvos, vegetación y capas horizontales.",
    },
    credit: {
      en: "Project by Carlo Ávila; façade by Santiago Architecture.",
      es: "Proyecto de Carlo Ávila; fachada por Santiago Architecture.",
    },
    scope: {
      en: "Façade design",
      es: "Diseño de fachada",
    },
    seoTitle: {
      en: "Casa Manglar",
      es: "Casa Manglar",
    },
    seoDescription: {
      en: "Casa Manglar in Cancún — façade design by Santiago Architecture; project by Carlo Ávila.",
      es: "Casa Manglar en Cancún — diseño de fachada por Santiago Architecture; proyecto de Carlo Ávila.",
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
      en: "El Edén Tulum",
      es: "El Edén Tulum",
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
      en: "Remodeling of the entrance sequence to a residential development in Tulum, shaped by curved canopies, stone walls and water as the threshold between the road and the site.",
      es: "Remodelación del acceso a un fraccionamiento en Tulum, definida por cubiertas curvas, muros de piedra y agua como umbral entre la vialidad y el predio.",
    },
    scope: {
      en: "Access remodeling",
      es: "Remodelación de acceso",
    },
    seoTitle: {
      en: "El Edén Tulum",
      es: "El Edén Tulum",
    },
    seoDescription: {
      en: "El Edén Tulum — remodeling of the access to a residential development in Tulum.",
      es: "El Edén Tulum — remodelación del acceso a un fraccionamiento en Tulum.",
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
      en: "Collaboration on the conceptualization of an eight-hectare masterplan in Uh May, arranged as white volumes with green roofs within retained jungle canopy.",
      es: "Colaboración en la conceptualización de un plan maestro de ocho hectáreas en Uh May, organizado como volúmenes blancos con cubiertas verdes dentro del dosel de la selva conservado.",
    },
    credit: {
      en: "In collaboration with Rodrigo Lepez Vela and other architects.",
      es: "En colaboración con Rodrigo Lepez Vela y otros arquitectos.",
    },
    scope: {
      en: "Masterplan conceptualization",
      es: "Conceptualización del plan maestro",
    },
    seoTitle: {
      en: "Aldea Uh May",
      es: "Aldea Uh May",
    },
    seoDescription: {
      en: "Aldea Uh May — collaborative conceptualization of an eight-hectare masterplan within retained jungle canopy.",
      es: "Aldea Uh May — colaboración en la conceptualización de un plan maestro de ocho hectáreas dentro del dosel de la selva conservado.",
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
      en: "Casa Sisal",
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
      en: "A beachfront residence shaped by sculpted white volumes, curved walls and a sunken living area, with indoor-outdoor rooms open to sea breeze and a continuous relationship to the Yucatán coast.",
      es: "Una residencia frente al mar definida por volúmenes blancos esculpidos, muros curvos y una sala hundida, con espacios interior-exterior abiertos a la brisa y una relación continua con la costa de Yucatán.",
    },
    seoTitle: {
      en: "Casa Sisal",
      es: "Casa Sisal",
    },
    seoDescription: {
      en: "Casa Sisal — beachfront residential architecture on the Yucatán coast.",
      es: "Casa Sisal — arquitectura residencial frente al mar en la costa de Yucatán.",
    },
  },
  {
    slug: "hexodome-cancun",
    year: 2024,
    latitude: 21.079,
    longitude: -86.851,
    area: "65 m²",
    category: "pavilion",
    images: [
      "/projects/hexodome-cancun/01.png",
      "/projects/hexodome-cancun/02.png",
      "/projects/hexodome-cancun/03.png",
      "/projects/hexodome-cancun/04.png",
      "/projects/hexodome-cancun/05.png",
    ],
    coverFocus: "50% 52%",
    name: {
      en: "Hexodome Cancún",
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
      en: "A pavilion defined by a white cellular shell, curved geometry and timber screens that filter light while creating a distinctive spatial enclosure.",
      es: "Un pabellón definido por una envolvente celular blanca, geometrías curvas y celosías de madera que filtran la luz y construyen un recinto espacial distintivo.",
    },
    seoTitle: {
      en: "Hexodome Cancún",
      es: "Hexodome Cancún",
    },
    seoDescription: {
      en: "Hexodome Cancún — pavilion with a cellular shell and timber screens.",
      es: "Hexodome Cancún — pabellón con envolvente celular y celosías de madera.",
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
      es: "Tiny Home Spain",
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
      en: "A 32 m² tiny home defined by a curved white shell, designed to be towed by car and relocated to a new site.",
      es: "Una tiny home de 32 m² definida por un cascarón blanco curvo, diseñada para ser remolcada por un automóvil y trasladada a otro lugar.",
    },
    seoTitle: {
      en: "Tiny Home Spain",
      es: "Tiny Home Spain",
    },
    seoDescription: {
      en: "Tiny Home Spain — a towable 32 m² dwelling with a curved white shell.",
      es: "Tiny Home Spain — vivienda móvil de 32 m² con cascarón blanco curvo.",
    },
  },
  {
    slug: "casa-nosara",
    year: 2024,
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
      en: "Casa Nosara",
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
      en: "A sustainable tropical residence built with locally sourced stone, adobe, palm thatch and wood, with elevated walkways connecting its living spaces through the site.",
      es: "Una residencia tropical sostenible construida con materiales locales —piedra, adobe, paja de palma y madera—, con pasarelas elevadas que conectan sus espacios habitables a través del sitio.",
    },
    seoTitle: {
      en: "Casa Nosara",
      es: "Casa Nosara",
    },
    seoDescription: {
      en: "Casa Nosara — sustainable tropical residence built with local stone, adobe, palm thatch and wood.",
      es: "Casa Nosara — residencia tropical sostenible construida con piedra, adobe, paja de palma y madera locales.",
    },
  },
  {
    slug: "restaurante-nosara",
    year: 2024,
    latitude: 9.981,
    longitude: -85.661,
    area: "320 m²",
    category: "hospitality",
    images: ["/projects/restaurante-nosara/01.png"],
    portraitImages: ["/projects/restaurante-nosara/01.png"],
    coverFocus: "50% 48%",
    name: {
      en: "Restaurante Nosara",
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
      en: "A restaurant pavilion defined by curved geometry, timber screens and open-air spaces responding to Nosara's tropical climate.",
      es: "Un pabellón para restaurante definido por geometrías curvas, celosías de madera y espacios abiertos que responden al clima tropical de Nosara.",
    },
    seoTitle: {
      en: "Restaurante Nosara",
      es: "Restaurante Nosara",
    },
    seoDescription: {
      en: "Restaurante Nosara — restaurant pavilion with curved geometry in Costa Rica.",
      es: "Restaurante Nosara — pabellón para restaurante con geometrías curvas en Costa Rica.",
    },
  },
  {
    slug: "villa-nosara",
    year: 2024,
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
      en: "A jungle villa composed of sculpted earth-toned volumes, open living spaces and existing trees that rise through the architecture.",
      es: "Una villa en la selva compuesta por volúmenes esculpidos en tonos tierra, espacios abiertos y árboles existentes que atraviesan la arquitectura.",
    },
    seoTitle: {
      en: "Villa Nosara",
      es: "Villa Nosara",
    },
    seoDescription: {
      en: "Villa Nosara — jungle villa with sculpted earth-toned volumes in Costa Rica.",
      es: "Villa Nosara — villa en la selva con volúmenes esculpidos en tonos tierra en Costa Rica.",
    },
  },
  {
    slug: "oficinas-mountain-nazca",
    year: 2017,
    latitude: 19.4326,
    longitude: -99.1332,
    area: "480 m²",
    category: "workplace",
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
      es: "Mountain Nazca Offices",
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
      en: "Santiago Architecture designed and oversaw the fabrication of the prefabricated furniture for this workplace. Each plywood piece was produced off site and assembled through joinery alone, without screws or glue.",
      es: "Santiago Architecture diseñó y supervisó la fabricación del mobiliario prefabricado para este espacio de trabajo. Cada pieza de madera contrachapada se produjo fuera de sitio y se armó únicamente mediante ensambles, sin tornillos ni pegamento.",
    },
    scope: {
      en: "Furniture design and fabrication",
      es: "Diseño y fabricación de mobiliario",
    },
    credit: {
      en: "In collaboration with Esteban Sepúlveda and Rodolfo Anaya.",
      es: "En colaboración con Esteban Sepúlveda y Rodolfo Anaya.",
    },
    seoTitle: {
      en: "Mountain Nazca Offices",
      es: "Mountain Nazca Offices",
    },
    seoDescription: {
      en: "Mountain Nazca Offices — prefabricated furniture designed for assembly without screws or glue.",
      es: "Mountain Nazca Offices — mobiliario prefabricado diseñado para armarse sin tornillos ni pegamento.",
    },
  },
  {
    slug: "veleta-tulum",
    year: 2025,
    latitude: 20.2048,
    longitude: -87.4574,
    area: "—",
    category: "residential",
    images: [
      "/projects/veleta-tulum/01.png",
      "/projects/veleta-tulum/02.png",
    ],
    coverFocus: "50% 40%",
    name: {
      en: "Veleta Tulum",
      es: "Veleta Tulum",
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
      en: "A residential building in Tulum defined by sculpted earth-toned volumes, curved balconies, a central spiral staircase and a sweeping bamboo roof canopy, integrated with tropical vegetation at every level.",
      es: "Un edificio residencial en Tulum definido por volúmenes esculpidos en tonos tierra, balcones curvos, una escalera espiral central y una cubierta ondulante de bambú, integrado con vegetación tropical en cada nivel.",
    },
    seoTitle: {
      en: "Veleta Tulum",
      es: "Veleta Tulum",
    },
    seoDescription: {
      en: "Veleta Tulum — residential building with sculpted earth-toned volumes and a bamboo canopy.",
      es: "Veleta Tulum — edificio residencial con volúmenes esculpidos en tonos tierra y cubierta de bambú.",
    },
  },
  {
    slug: "cabin-tulum",
    year: 2023,
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
      en: "A compact thatched retreat defined by an expressive timber framework, stone, glass and curved geometry, set in close relation to the tropical canopy.",
      es: "Un refugio compacto de cubierta de paja definido por un entramado expresivo de madera, piedra, vidrio y geometrías curvas, en relación cercana con el dosel tropical.",
    },
    seoTitle: {
      en: "Cabin Tulum",
      es: "Cabin Tulum",
    },
    seoDescription: {
      en: "Cabin Tulum — compact retreat with an expressive timber framework.",
      es: "Cabin Tulum — refugio compacto con entramado expresivo de madera.",
    },
  },
  {
    slug: "punta-cana",
    year: 2025,
    latitude: 18.582,
    longitude: -68.404,
    area: "—",
    category: "hospitality",
    images: [
      "/projects/punta-cana/01.png",
      "/projects/punta-cana/02.png",
      "/projects/punta-cana/03.png",
      "/projects/punta-cana/04.png",
      "/projects/punta-cana/05.png",
      "/projects/punta-cana/06.png",
    ],
    coverFocus: "50% 42%",
    name: {
      en: "Punta Cana",
      es: "Punta Cana",
    },
    city: {
      en: "Punta Cana",
      es: "Punta Cana",
    },
    country: {
      en: "Dominican Republic",
      es: "República Dominicana",
    },
    description: {
      en: "Collaboration on the conceptualization of the façade for a tropical resort in Punta Cana, shaped by flowing white balconies, integrated greenery and pools woven through the landscape.",
      es: "Colaboración en la conceptualización de la fachada para un resort tropical en Punta Cana, definida por balcones blancos fluidos, vegetación integrada y piscinas entretejidas en el paisaje.",
    },
    credit: {
      en: "In collaboration with Miguel Braun.",
      es: "En colaboración con Miguel Braun.",
    },
    scope: {
      en: "Façade conceptualization",
      es: "Conceptualización de fachada",
    },
    seoTitle: {
      en: "Punta Cana",
      es: "Punta Cana",
    },
    seoDescription: {
      en: "Punta Cana — collaborative façade conceptualization for a tropical resort in the Dominican Republic.",
      es: "Punta Cana — colaboración en la conceptualización de fachada para un resort tropical en República Dominicana.",
    },
  },
  {
    slug: "bali-resort",
    year: 2024,
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
      es: "Bali Resort",
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
      en: "A bamboo eco-resort composed of elevated pavilions, woven canopies and terraced pools distributed through the Balinese landscape.",
      es: "Un eco-resort de bambú compuesto por pabellones elevados, cubiertas tejidas y piscinas en terrazas distribuidas a través del paisaje balinés.",
    },
    seoTitle: {
      en: "Bali Resort",
      es: "Bali Resort",
    },
    seoDescription: {
      en: "Bali Resort — bamboo eco-resort of elevated pavilions in Indonesia.",
      es: "Bali Resort — eco-resort de bambú con pabellones elevados en Indonesia.",
    },
  },
  {
    slug: "awen-tulum",
    year: 2025,
    latitude: 20.1985,
    longitude: -87.431,
    area: "—",
    category: "residential",
    images: [
      "/projects/awen-tulum/01.png",
      "/projects/awen-tulum/02.png",
    ],
    coverFocus: "50% 42%",
    name: {
      en: "Awen Tulum",
      es: "Awen Tulum",
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
      en: "An organic residential villa in The Awen at Soy Tulum, shaped by fluid white volumes, integrated greenery and curving balconies opening to pool terraces within the jungle.",
      es: "Una villa residencial orgánica en The Awen, Soy Tulum, definida por volúmenes blancos fluidos, vegetación integrada y balcones curvos que se abren a terrazas y piscina en la selva.",
    },
    seoTitle: {
      en: "Awen Tulum",
      es: "Awen Tulum",
    },
    seoDescription: {
      en: "Awen Tulum — organic residential villa in The Awen at Soy Tulum.",
      es: "Awen Tulum — villa residencial orgánica en The Awen, Soy Tulum.",
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
      en: "A residence defined by chukum finishes and soft geometries, designed around shaded courtyards and tropical vegetation in Tulum.",
      es: "Una residencia definida por acabados de chukum y geometrías suaves, organizada alrededor de patios sombreados y vegetación tropical en Tulum.",
    },
    seoTitle: {
      en: "Jungle House Tulum",
      es: "Jungle House Tulum",
    },
    seoDescription: {
      en: "Jungle House Tulum — residence with chukum finishes and soft geometries.",
      es: "Jungle House Tulum — residencia con acabados de chukum y geometrías suaves.",
    },
  },
];

/** Most visually striking projects first (list, hero, next-project flow). */
const ATTRACTIVENESS_ORDER = [
  "casa-sisal",
  "awen-tulum",
  "jungle-house-tulum",
  "veleta-tulum",
  "cabin-tulum",
  "casa-manglar",
  "villa-nosara",
  "oficinas-mountain-nazca",
  "el-eden-tulum",
  "hexodome-cancun",
  "punta-cana",
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

/** Display as "city, country". */
export function formatPlace(project: Project, locale: LocaleCode): string {
  const country = getLocalized(project.country, locale).trim();
  const city = getLocalized(project.city, locale).trim();
  if (!city) return country;
  if (!country) return city;
  return `${city}, ${country}`;
}

/** True when area should appear in the UI (omit placeholders like "—"). */
export function hasDisplayArea(area: string): boolean {
  const value = area.trim();
  return Boolean(value) && value !== "—" && value !== "-" && value !== "–";
}

/** Location · Year · Area · Status · Scope — omits missing parts. */
export function formatProjectFacts(
  project: Project,
  locale: LocaleCode,
): string {
  const parts: string[] = [];
  const place = formatPlace(project, locale);
  if (place) parts.push(place);
  if (project.year) parts.push(String(project.year));
  if (hasDisplayArea(project.area)) parts.push(project.area.trim());
  if (project.status) parts.push(getLocalized(project.status, locale));
  if (project.scope) parts.push(getLocalized(project.scope, locale));
  return parts.join(" · ");
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
