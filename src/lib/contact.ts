export const CONTACT_LIMITS = {
  maxFiles: 5,
  maxFileBytes: 4 * 1024 * 1024,
  /** Cloudflare Email Sending limit is 5 MiB total message size. */
  maxTotalBytes: 4.5 * 1024 * 1024,
  /** Humans need a few seconds; instant POSTs are almost always bots. */
  minFillMs: 3000,
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

function allowedOrigins(siteUrl: string): Set<string> {
  const origins = new Set<string>();
  try {
    origins.add(new URL(siteUrl).origin);
  } catch {
    // ignore invalid site URL; other origins below may still apply
  }
  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }
  return origins;
}

/** Reject cross-origin POSTs that are not from this site. */
export function isAllowedContactOrigin(request: Request, siteUrl: string): boolean {
  const allowed = allowedOrigins(siteUrl);
  const origin = request.headers.get("origin");
  if (origin) return allowed.has(origin);

  // Same-origin navigations / some clients omit Origin; require a matching Referer instead.
  const referer = request.headers.get("referer");
  if (!referer) return false;
  try {
    return allowed.has(new URL(referer).origin);
  } catch {
    return false;
  }
}

const SPAM_PATTERNS = [
  /\b(viagra|cialis|casino|crypto\s*invest|seo\s*service|guest\s*post|backlink)\b/i,
  /\b(earn\s+\$?\d+|make\s+money\s+fast|click\s+here\s+now)\b/i,
];

/** Soft content filter for obvious bulk spam in free-text fields. */
export function looksLikeSpamText(...parts: string[]): boolean {
  const text = parts.filter(Boolean).join("\n");
  if (!text) return false;
  const urls = text.match(/https?:\/\/|www\./gi) ?? [];
  if (urls.length >= 3) return true;
  return SPAM_PATTERNS.some((pattern) => pattern.test(text));
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
