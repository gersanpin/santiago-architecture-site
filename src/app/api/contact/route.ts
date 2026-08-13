import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  CONTACT_LIMITS,
  allowContactSubmit,
  clientIp,
  isAllowedAttachment,
} from "@/lib/contact";

export const runtime = "nodejs";

type Kind = "inquiry" | "meeting";

function bad(message: string, status = 400, code?: string) {
  return Response.json(
    { ok: false, error: message, ...(code ? { code } : {}) },
    { status },
  );
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!allowContactSubmit(ip)) {
    return bad("Too many requests. Please try again later.", 429);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return bad("Invalid form payload.");
  }

  // Honeypot — bots fill hidden fields.
  const honeypot = String(form.get("website") ?? "").trim();
  if (honeypot) {
    return Response.json({ ok: true });
  }

  const startedAt = Number(form.get("formStartedAt") ?? 0);
  if (!startedAt || Date.now() - startedAt < 1200) {
    return bad("Please take a moment before submitting.");
  }

  const kind = String(form.get("kind") ?? "") as Kind;
  if (kind !== "inquiry" && kind !== "meeting") {
    return bad("Unknown form type.");
  }

  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const whatsapp = String(form.get("whatsapp") ?? "").trim();
  if (!name || !email) {
    return bad("Name and email are required.");
  }
  if (
    name.length > 120 ||
    email.length > 200 ||
    whatsapp.length > 50
  ) {
    return bad("Input is too long.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return bad("Enter a valid email address.");
  }

  const files = form
    .getAll("attachments")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length > CONTACT_LIMITS.maxFiles) {
    return bad(`Maximum ${CONTACT_LIMITS.maxFiles} attachments.`);
  }

  let totalBytes = 0;
  for (const file of files) {
    totalBytes += file.size;
    if (file.size > CONTACT_LIMITS.maxFileBytes) {
      return bad(`Each file must be under ${CONTACT_LIMITS.maxFileBytes / (1024 * 1024)} MB.`);
    }
    if (!isAllowedAttachment(file)) {
      return bad(`File type not allowed: ${file.name}`);
    }
  }
  if (totalBytes > CONTACT_LIMITS.maxTotalBytes) {
    return bad("Total attachments exceed the size limit.");
  }

  let subject = "";
  let text = "";
  const replyTo = email;

  if (kind === "inquiry") {
    const location = String(form.get("location") ?? "").trim();
    const projectType = String(form.get("projectType") ?? "").trim();
    const area = String(form.get("area") ?? "").trim();
    const hasSite = String(form.get("hasSite") ?? "").trim();
    const stage = String(form.get("stage") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    if (!location || !message) {
      return bad("Location and message are required.");
    }
    subject = `Project inquiry — ${name}`;
    text = [
      "New project inquiry from the website.",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      whatsapp ? `WhatsApp: ${whatsapp}` : null,
      `Location: ${location}`,
      `Project type: ${projectType}`,
      area ? `Area: ${area}` : null,
      `Has site: ${hasSite}`,
      `Stage: ${stage}`,
      "",
      "Message:",
      message,
      files.length
        ? `\nAttachments: ${files.map((file) => file.name).join(", ")}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");
  } else {
    const date = String(form.get("date") ?? "").trim();
    const time = String(form.get("time") ?? "").trim();
    const timezone = String(form.get("timezone") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();
    const reason = String(form.get("reason") ?? "").trim();
    const fromInquiry = String(form.get("fromInquiry") ?? "") === "1";
    if (!date || !time || !timezone) {
      return bad("Meeting date, time, and timezone are required.");
    }
    if (timezone.length > 100) {
      return bad("Timezone is too long.");
    }
    subject = `Meeting request — ${name}`;
    text = [
      fromInquiry
        ? "Meeting request following a project inquiry."
        : "Meeting request from the website.",
      "",
      reason ? `Reason: ${reason}` : null,
      `Name: ${name}`,
      `Email: ${email}`,
      whatsapp ? `WhatsApp: ${whatsapp}` : null,
      `Date: ${date}`,
      `Time: ${time}`,
      `Timezone: ${timezone}`,
      notes ? `\nNotes:\n${notes}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    const to = env.CONTACT_TO_EMAIL?.trim();
    const from = env.CONTACT_FROM_EMAIL?.trim();

    if (!env.EMAIL || !to || !from) {
      return bad(
        "Email service is not configured yet. Add the Cloudflare Email binding to continue.",
        503,
      );
    }

    const attachments = await Promise.all(
      files.map(async (file) => ({
        filename: file.name.replace(/[^\w.\- ()[\]]+/g, "_").slice(0, 120),
        content: await file.arrayBuffer(),
        type: file.type || "application/octet-stream",
        disposition: "attachment" as const,
      })),
    );

    await env.EMAIL.send({
      to,
      from,
      subject,
      text,
      replyTo,
      attachments: attachments.length ? attachments : undefined,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Contact email failed", error);
    if (
      files.length > 0 &&
      error instanceof Error &&
      error.message.includes("Cannot serialize value: [object ArrayBuffer]")
    ) {
      return bad(
        "Binary attachments cannot be sent by the local Cloudflare simulator.",
        422,
        "LOCAL_ATTACHMENT_UNSUPPORTED",
      );
    }
    return bad("Unable to send the message right now.", 502);
  }
}
