const BLOCKED_STARTER_ASSETS = new Set([
  "/vercel.svg",
  "/window.svg",
  "/globe.svg",
  "/next.svg",
  "/file.svg",
]);

/** Internal notes and leftover starter files that must not be served. */
export function isBlockedPublicPath(pathname: string): boolean {
  const path = decodeURIComponent(pathname).replace(/\/+$/, "") || "/";
  if (BLOCKED_STARTER_ASSETS.has(path.toLowerCase())) {
    return true;
  }
  return /\.md$/i.test(path);
}
