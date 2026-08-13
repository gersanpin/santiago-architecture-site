export const CONTACT_LIMITS = {
  maxFiles: 5,
  maxFileBytes: 4 * 1024 * 1024,
  /** Cloudflare Email Sending limit is 5 MiB total message size. */
  maxTotalBytes: 4.5 * 1024 * 1024,
  allowedMime: new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "application/pdf",
    "application/zip",
    "application/x-zip-compressed",
  ]),
} as const;

const rateBucket = new Map<string, { count: number; resetAt: number }>();

export function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

/** Simple per-isolate rate limit — 5 submissions / hour / IP. */
export function allowContactSubmit(ip: string, limit = 5, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  const entry = rateBucket.get(ip);
  if (!entry || entry.resetAt <= now) {
    rateBucket.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export function isAllowedAttachment(file: File): boolean {
  if (CONTACT_LIMITS.allowedMime.has(file.type)) return true;
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".pdf") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp") ||
    name.endsWith(".heic") ||
    name.endsWith(".zip")
  );
}
