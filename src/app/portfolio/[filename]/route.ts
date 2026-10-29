import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PDF_FILENAME = "santiago-architecture-selected-works-2026.pdf";

function pdfHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  headers.set("Content-Type", "application/pdf");
  headers.set(
    "Content-Disposition",
    `inline; filename="${siteConfig.portfolio.filename}"`,
  );
  headers.set("Cache-Control", "public, max-age=86400");
  return headers;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params;
  if (filename !== PDF_FILENAME) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const object = await env.PORTFOLIO_BUCKET?.get(PDF_FILENAME);
    if (object?.body) {
      const headers = pdfHeaders();
      if (object.size) headers.set("Content-Length", String(object.size));
      if (object.httpEtag) headers.set("ETag", object.httpEtag);
      return new Response(object.body, { headers });
    }
  } catch {
    // Local `next dev` / `next start` fall through to the file on disk.
  }

  const filePath = path.join(process.cwd(), "public", "portfolio", PDF_FILENAME);
  try {
    const fileStat = await stat(filePath);
    const headers = pdfHeaders({
      "Content-Length": String(fileStat.size),
    });
    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
    return new Response(stream, { headers });
  } catch {
    return new Response("Portfolio PDF is not available.", { status: 404 });
  }
}
