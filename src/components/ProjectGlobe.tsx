"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import Image from "next/image";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
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
import styles from "./ProjectGlobe.module.css";

const GLOBE_RADIUS = 1.6;
/** Fixed framing: full sphere + atmosphere with generous margin. */
const CAMERA_DISTANCE = 5.35;
const CAMERA_FOV = 38;
const SEGMENTS = 256;
/** Group pins closer than this (degrees) so they can be fanned apart. */
const CLUSTER_DEG = 0.35;
/**
 * Geographic fan radius (degrees). Large enough that clustered pins are
 * visually distinct on the globe, but capped so coastal fans stay on land
 * (Nosara → Nicoya/mainland CR; Cancún/Tulum → Yucatán west).
 * Yucatán gets a larger radius — more inland room than Nicoya.
 */
const FAN_RADIUS_MIN_DEG = 0.88;
const FAN_RADIUS_MAX_DEG = 1.25;
const FAN_RADIUS_YUCATAN_MIN_DEG = 1.25;
const FAN_RADIUS_YUCATAN_MAX_DEG = 1.9;
/** Radial lift between stacked cluster mates (globe-normal, world units). */
const PIN_LIFT_STEP = 0.048;
/** Compact hit spheres so nearby land pins stay separately clickable. */
const PIN_HIT_RADIUS = 0.008;

type GlobeProject = Project & { globeLift?: number };

function latLngToPosition(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function lngDelta(a: number, b: number) {
  let d = b - a;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

function geoDistanceDeg(a: Project, b: Project) {
  return Math.hypot(
    b.latitude - a.latitude,
    lngDelta(a.longitude, b.longitude),
  );
}

function isYucatanCluster(lat: number, lng: number) {
  return lng > -92 && lng < -86 && lat > 17 && lat < 23;
}

function isPacificCentralAmerica(lat: number, lng: number) {
  return lng > -92 && lng < -82 && lat > 7 && lat < 17;
}

function fanRadiusForGroup(size: number, lat: number, lng: number) {
  const yucatan = isYucatanCluster(lat, lng);
  const min = yucatan ? FAN_RADIUS_YUCATAN_MIN_DEG : FAN_RADIUS_MIN_DEG;
  const max = yucatan ? FAN_RADIUS_YUCATAN_MAX_DEG : FAN_RADIUS_MAX_DEG;
  if (size <= 2) return min;
  if (size >= 5) return max;
  const t = (size - 2) / 3;
  return min + (max - min) * t;
}

/**
 * Prefer offsets toward continental interior so coastal fans do not
 * drop pins into the ocean. Bearing in degrees: 0° north, 90° east.
 */
function inlandBearingDeg(lat: number, lng: number) {
  // Yucatán / Caribbean Mexico — ocean to the east, inland west.
  if (isYucatanCluster(lat, lng)) return 270;
  // Central America Pacific (e.g. Nosara) — ocean west, inland east.
  if (isPacificCentralAmerica(lat, lng)) return 90;
  // Bali / southern Indonesia — ocean south, inland north.
  if (lng > 110 && lng < 120 && lat > -10 && lat < -7) return 0;
  // Iberian Mediterranean — ocean south, inland north.
  if (lng > -10 && lng < 0 && lat > 35 && lat < 40) return 0;
  return 90;
}

/** Arc center may bias off pure inland to keep fans on land. */
function fanArcCenterRad(lat: number, lng: number) {
  const inland = (inlandBearingDeg(lat, lng) * Math.PI) / 180;
  // Nicoya: bias north so the south arm stays on land (not past Cabo Blanco).
  if (isPacificCentralAmerica(lat, lng)) return inland - 0.62;
  return inland;
}

/** Spread nearby pins just enough to click separately while staying on land. */
function withVisiblePinOffsets(projects: Project[]): GlobeProject[] {
  const remaining = [...projects];
  const groups: Project[][] = [];

  while (remaining.length > 0) {
    const seed = remaining.shift()!;
    const group = [seed];
    let grew = true;
    while (grew) {
      grew = false;
      for (let i = remaining.length - 1; i >= 0; i -= 1) {
        const candidate = remaining[i];
        if (
          group.some(
            (member) => geoDistanceDeg(member, candidate) < CLUSTER_DEG,
          )
        ) {
          group.push(candidate);
          remaining.splice(i, 1);
          grew = true;
        }
      }
    }
    groups.push(group);
  }

  const adjusted: GlobeProject[] = [];
  for (const group of groups) {
    if (group.length === 1) {
      adjusted.push({ ...group[0], globeLift: 0 });
      continue;
    }

    const centroidLat =
      group.reduce((sum, project) => sum + project.latitude, 0) / group.length;
    const centroidLng =
      group.reduce((sum, project) => sum + project.longitude, 0) / group.length;
    const radius = fanRadiusForGroup(group.length, centroidLat, centroidLng);
    const inland = (inlandBearingDeg(centroidLat, centroidLng) * Math.PI) / 180;
    const arcCenter = fanArcCenterRad(centroidLat, centroidLng);
    // Nudge the whole fan inland so the seaward edge stays on land.
    const inlandPush = radius * 0.52;
    const baseLat = centroidLat + Math.cos(inland) * inlandPush;
    const baseLng = centroidLng + Math.sin(inland) * inlandPush;
    // Inland-facing wedge (not a full circle into the sea).
    const pacific = isPacificCentralAmerica(centroidLat, centroidLng);
    const arcSpan =
      Math.PI *
      ((pacific ? 0.4 : 0.48) + (pacific ? 0.06 : 0.08) * Math.min(group.length, 4));

    group.forEach((project, index) => {
      const t =
        group.length === 1 ? 0.5 : index / Math.max(group.length - 1, 1);
      const angle = arcCenter - arcSpan / 2 + t * arcSpan;
      const globeLift = (index - (group.length - 1) / 2) * PIN_LIFT_STEP;
      adjusted.push({
        ...project,
        latitude: baseLat + Math.cos(angle) * radius,
        longitude: baseLng + Math.sin(angle) * radius,
        globeLift,
      });
    });
  }

  return adjusted;
}

type ArrowDir = "up" | "down" | "left" | "right";

function arrowFromKey(key: string): ArrowDir | null {
  if (key === "ArrowUp") return "up";
  if (key === "ArrowDown") return "down";
  if (key === "ArrowLeft") return "left";
  if (key === "ArrowRight") return "right";
  return null;
}

/** Pick the nearest project roughly in the arrow direction from `from`. */
function findNeighborInDirection(
  from: Project,
  projects: Project[],
  dir: ArrowDir,
): Project | null {
  let best: Project | null = null;
  let bestScore = Infinity;

  for (const project of projects) {
    if (project.slug === from.slug) continue;

    const dLat = project.latitude - from.latitude;
    const dLng = lngDelta(from.longitude, project.longitude);
    const dist = Math.hypot(dLat, dLng);
    if (dist < 1e-6) continue;

    const uLat = dLat / dist;
    const uLng = dLng / dist;
    const vLat = dir === "up" ? 1 : dir === "down" ? -1 : 0;
    const vLng = dir === "right" ? 1 : dir === "left" ? -1 : 0;
    const alignment = uLat * vLat + uLng * vLng;
    if (alignment < 0.2) continue;

    const score = dist / (alignment * alignment);
    if (score < bestScore) {
      bestScore = score;
      best = project;
    }
  }

  return best;
}

function ConfigureRenderer() {
  const { gl } = useThree();

  useEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.15;
    gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
  }, [gl]);

  return null;
}

function configureColorMap(texture: THREE.Texture, anisotropy: number) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
}

function configureDataMap(texture: THREE.Texture, anisotropy: number) {
  texture.colorSpace = THREE.NoColorSpace;
  texture.anisotropy = anisotropy;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
}

function AppleEarth() {
  const { gl } = useThree();
  const cloudsRef = useRef<THREE.Mesh>(null);
  const [dayMap, normalMap, specularMap, cloudsMap] = useTexture([
    "/textures/earth-day-4k.jpg",
    "/textures/earth-normal.jpg",
    "/textures/earth-specular.jpg",
    "/textures/earth-clouds.png",
  ]);

  useEffect(() => {
    const anisotropy = Math.min(16, gl.capabilities.getMaxAnisotropy());
    configureColorMap(dayMap, anisotropy);
    configureDataMap(normalMap, anisotropy);
    configureDataMap(specularMap, anisotropy);
    configureColorMap(cloudsMap, anisotropy);
  }, [cloudsMap, dayMap, gl, normalMap, specularMap]);

  useFrame((_, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.012;
    }
  });

  return (
    <group>
      {/* Soft fill + key light — warm limestone daylight */}
      <ambientLight intensity={0.48} color="#f6f1e8" />
      <hemisphereLight args={["#e8efe2", "#ebe4d8", 0.52]} />
      <directionalLight
        position={[4.5, 2.2, 3.2]}
        intensity={2.2}
        color="#fff4e5"
      />
      <directionalLight
        position={[-3.5, -1.2, -2.5]}
        intensity={0.4}
        color="#8a9a82"
      />

      {/* Planet */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, SEGMENTS, SEGMENTS]} />
        <meshPhongMaterial
          map={dayMap}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.9, 0.9)}
          specularMap={specularMap}
          specular={new THREE.Color("#3a3a3a")}
          shininess={22}
        />
      </mesh>

      {/* Cloud veil */}
      <mesh ref={cloudsRef} scale={1.008}>
        <sphereGeometry args={[GLOBE_RADIUS, 192, 192]} />
        <meshPhongMaterial
          map={cloudsMap}
          transparent
          opacity={0.4}
          depthWrite={false}
          specular={new THREE.Color("#111111")}
          shininess={4}
        />
      </mesh>
    </group>
  );
}

function MapPinMesh({ selected }: { selected: boolean }) {
  const scale = selected ? 1.28 : 1;
  const core = selected ? "#faf7f2" : "#efe9df";
  const glow = selected ? "#5e6b57" : "#a8b39e";

  return (
    <group scale={scale}>
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        {/* Compact rings so fanned neighbors read as separate dots */}
        <ringGeometry args={[0.016, 0.026, 48]} />
        <meshBasicMaterial
          color={glow}
          transparent
          opacity={selected ? 0.85 : 0.45}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0.01, 0]} raycast={() => null}>
        <sphereGeometry args={[0.012, 32, 32]} />
        <meshBasicMaterial color={core} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.01, 0]} raycast={() => null}>
        <sphereGeometry args={[0.019, 32, 32]} />
        <meshBasicMaterial
          color={glow}
          transparent
          opacity={selected ? 0.35 : 0.18}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function ProjectPin({
  project,
  selected,
  onSelect,
}: {
  project: GlobeProject;
  selected: boolean;
  onSelect: (slug: string) => void;
}) {
  const { position, quaternion } = useMemo(() => {
    const lift = project.globeLift ?? 0;
    const pos = latLngToPosition(
      project.latitude,
      project.longitude,
      GLOBE_RADIUS + 0.012 + lift,
    );
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      pos.clone().normalize(),
    );
    return { position: pos, quaternion: q };
  }, [project.globeLift, project.latitude, project.longitude]);

  return (
    <group position={position} quaternion={quaternion}>
      <mesh
        position={[0, 0.04, 0]}
        onPointerDown={(event) => {
          event.stopPropagation();
          onSelect(project.slug);
        }}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(project.slug);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[PIN_HIT_RADIUS, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <MapPinMesh selected={selected} />
    </group>
  );
}

/** Keep the camera locked so the full sphere stays in frame. */
function LockGlobeDistance({
  controlsRef,
}: {
  controlsRef: MutableRefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();

  useEffect(() => {
    const persp = camera as THREE.PerspectiveCamera;
    persp.fov = CAMERA_FOV;
    persp.near = 0.1;
    persp.far = 100;
    persp.clearViewOffset();
    persp.position.set(0, 0.15, CAMERA_DISTANCE);
    persp.lookAt(0, 0, 0);
    persp.updateProjectionMatrix();
  }, [camera]);

  useFrame(() => {
    const persp = camera as THREE.PerspectiveCamera;
    const dir = camera.position.clone();
    if (dir.lengthSq() < 1e-6) dir.set(0, 0.15, 1);
    dir.normalize();
    if (Math.abs(camera.position.length() - CAMERA_DISTANCE) > 0.02) {
      camera.position.copy(dir.multiplyScalar(CAMERA_DISTANCE));
    }
    if (Math.abs(persp.fov - CAMERA_FOV) > 0.01) {
      persp.fov = CAMERA_FOV;
      persp.updateProjectionMatrix();
    }
    const controls = controlsRef.current;
    if (controls) {
      controls.minDistance = CAMERA_DISTANCE;
      controls.maxDistance = CAMERA_DISTANCE;
      controls.target.set(0, 0, 0);
    }
  });

  return null;
}

function CameraFocus({
  project,
  controlsRef,
}: {
  project: Project | null;
  controlsRef: MutableRefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();
  const animation = useRef<{
    from: THREE.Vector3;
    to: THREE.Vector3;
    progress: number;
  } | null>(null);
  const focusKey = project
    ? `${project.slug}:${project.latitude}:${project.longitude}`
    : null;

  useEffect(() => {
    if (!project || !focusKey) {
      animation.current = null;
      return;
    }

    const direction = latLngToPosition(
      project.latitude,
      project.longitude,
      1,
    ).normalize();
    const to = direction.multiplyScalar(CAMERA_DISTANCE);

    animation.current = {
      from: camera.position.clone(),
      to,
      progress: 0,
    };
  }, [camera, focusKey, project]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    const current = animation.current;
    if (!current) return;

    current.progress = Math.min(1, current.progress + delta * 1.35);
    const eased = 1 - (1 - current.progress) ** 3;
    camera.position.lerpVectors(current.from, current.to, eased);
    camera.position.setLength(CAMERA_DISTANCE);
    camera.lookAt(0, 0, 0);

    if (controls) {
      controls.target.set(0, 0, 0);
      controls.update();
    }

    if (current.progress >= 1) {
      animation.current = null;
    }
  });

  return null;
}

type Props = {
  projects: Project[];
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
};

function GlobePreview({
  project,
  locale,
}: {
  project: Project;
  locale: LocaleCode;
}) {
  const name = getLocalized(project.name, locale);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { style: pushStyle, handlers: pushHandlers } = usePushFromPointer({
    maxTilt: 11,
  });
  const { src } = useRandomImageCycle(project.images, {
    initialIndex: 0,
    firstHoldMs: 5200,
    restAfterCover: true,
  });
  if (!src) return null;

  return (
    <>
      <Link
        href={`/projects/${project.slug}`}
        className={styles.preview}
        {...pushHandlers}
      >
        <Image
          key={src}
          src={src}
          alt={name}
          fill
          quality={IMAGE_QUALITY}
          unoptimized={IMAGE_UNOPTIMIZED}
          sizes="100vw"
          className={styles.previewImage}
          style={pushStyle}
        />
        <ExpandImageButton
          onClick={() => {
            setLightboxIndex(lightboxIndexForSrc(project.images, src));
            setLightboxOpen(true);
          }}
        />
      </Link>
      <ProjectLightbox
        images={project.images}
        alt={name}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}

export function ProjectGlobe({ projects, selectedSlug, onSelect }: Props) {
  const t = useTranslations("Projects");
  const locale = useLocale() as LocaleCode;
  const selected =
    projects.find((project) => project.slug === selectedSlug) ?? null;
  const pinProjects = useMemo(
    () => withVisiblePinOffsets(projects),
    [projects],
  );
  const selectedPin =
    pinProjects.find((project) => project.slug === selectedSlug) ?? selected;
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const dir = arrowFromKey(event.key);
      if (!dir) return;

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();

      if (!selectedSlug) {
        const first = projects[0];
        if (first) onSelect(first.slug);
        return;
      }

      const current =
        pinProjects.find((project) => project.slug === selectedSlug) ?? null;
      if (!current) return;

      const next = findNeighborInDirection(current, pinProjects, dir);
      if (next) onSelect(next.slug);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onSelect, pinProjects, projects, selectedSlug]);

  return (
    <div className={styles.wrap}>
      <div className={styles.canvas}>
        <Canvas
          camera={{ position: [0, 0.15, CAMERA_DISTANCE], fov: CAMERA_FOV }}
          dpr={[1, 2.5]}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
            stencil: false,
            depth: true,
          }}
          style={{ background: "transparent" }}
          onPointerMissed={() => onSelect(null)}
        >
          <Suspense fallback={null}>
            <ConfigureRenderer />
            <LockGlobeDistance controlsRef={controlsRef} />
            <AppleEarth />
            {pinProjects.map((project) => (
              <ProjectPin
                key={project.slug}
                project={project}
                selected={project.slug === selectedSlug}
                onSelect={onSelect}
              />
            ))}
            <CameraFocus project={selectedPin} controlsRef={controlsRef} />
            <OrbitControls
              ref={controlsRef}
              makeDefault
              enablePan={false}
              enableZoom={false}
              minDistance={CAMERA_DISTANCE}
              maxDistance={CAMERA_DISTANCE}
              rotateSpeed={0.35}
              autoRotate={!selectedSlug}
              autoRotateSpeed={0.18}
            />
          </Suspense>
        </Canvas>
      </div>

      <aside className={styles.panel}>
        {selected ? (
          <>
            <GlobePreview key={selected.slug} project={selected} locale={locale} />
            <p className={styles.kicker}>{t(`filters.${selected.category}`)}</p>
            <h2>{getLocalized(selected.name, locale)}</h2>
            <dl className={styles.details}>
              <div>
                <dt>{t("labels.location")}</dt>
                <dd>{formatPlace(selected, locale)}</dd>
              </div>
              <div>
                <dt>{t("labels.typology")}</dt>
                <dd>{t(`filters.${selected.category}`)}</dd>
              </div>
            </dl>
            <Link
              href={`/projects/${selected.slug}`}
              className="btn btn-primary"
            >
              {t("viewProject")}
            </Link>
          </>
        ) : (
          <>
            <p className={styles.placeholder}>{t("selected")}</p>
            <ul className={styles.quickList}>
              {projects.map((project) => (
                <li key={project.slug}>
                  <button
                    type="button"
                    onClick={() => onSelect(project.slug)}
                  >
                    {getLocalized(project.name, locale)}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>
    </div>
  );
}
