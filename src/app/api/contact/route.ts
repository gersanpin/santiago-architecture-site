import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  CONTACT_LIMITS,
  allowContactSubmit,
  clientIp,
  isAllowedAttachment,
} from "@/lib/contact";
import { sendMetaLead } from "@/lib/meta-capi";

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
    return Response.json({ ok: true, accepted: false });
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
  if (/[\r\n]/.test(name) || /[\r\n]/.test(email)) {
    return bad("Invalid contact details.");
  }

  const language = String(form.get("language") ?? "").trim();
  const landingPage = String(form.get("landingPage") ?? "").trim();
  const utmSource = String(form.get("utm_source") ?? "").trim();
  const utmMedium = String(form.get("utm_medium") ?? "").trim();
  const utmCampaign = String(form.get("utm_campaign") ?? "").trim();
  const utmContent = String(form.get("utm_content") ?? "").trim();
  const utmTerm = String(form.get("utm_term") ?? "").trim();
  const referrer = String(form.get("referrer") ?? "").trim();
  const source = String(form.get("source") ?? "direct").trim() || "direct";
  const contextValues = [
    language,
    landingPage,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    referrer,
    source,
  ];
  if (contextValues.some((value) => value.length > 1000)) {
    return bad("Attribution data is too long.");
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
    const stage = String(form.get("stage") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const projectTypes = new Set([
      "residence",
      "hospitality",
      "development",
      "masterplan",
      "other",
    ]);
    const stages = new Set([
      "",
      "exploring",
      "siteAcquired",
      "concept",
      "designInProgress",
      "constructionPlanning",
    ]);
    if (!location || !projectType) {
      return bad("Location and project type are required.");
    }
    if (!projectTypes.has(projectType) || !stages.has(stage)) {
      return bad("Select a valid project type and stage.");
    }
    if (
      location.length > 240 ||
      message.length > 5000 ||
      stage.length > 40
    ) {
      return bad("Input is too long.");
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
      stage ? `Stage: ${stage}` : null,
      message ? `\nMessage:\n${message}` : null,
      "",
      `Language: ${language || "unknown"}`,
      `Landing page: ${landingPage || "unknown"}`,
      `Source: ${source}`,
      utmSource ? `utm_source: ${utmSource}` : null,
      utmMedium ? `utm_medium: ${utmMedium}` : null,
      utmCampaign ? `utm_campaign: ${utmCampaign}` : null,
      utmContent ? `utm_content: ${utmContent}` : null,
      utmTerm ? `utm_term: ${utmTerm}` : null,
      referrer ? `Referrer: ${referrer}` : null,
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
    const today = new Date().toISOString().slice(0, 10);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !/^\d{2}:\d{2}$/.test(time) ||
      date < today
    ) {
      return bad("Select a valid future meeting date and time.");
    }
    if (
      timezone.length > 100 ||
      notes.length > 5000 ||
      reason.length > 240
    ) {
      return bad("Input is too long.");
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
      "",
      `Language: ${language || "unknown"}`,
      `Landing page: ${landingPage || "unknown"}`,
      `Source: ${source}`,
      utmSource ? `utm_source: ${utmSource}` : null,
      utmMedium ? `utm_medium: ${utmMedium}` : null,
      utmCampaign ? `utm_campaign: ${utmCampaign}` : null,
      referrer ? `Referrer: ${referrer}` : null,
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

    if (
      kind === "inquiry" &&
      String(form.get("advertisingConsent") ?? "") === "granted"
    ) {
      const eventId = String(form.get("eventId") ?? "").trim();
      const projectType = String(form.get("projectType") ?? "").trim();
      if (/^[a-zA-Z0-9-]{12,100}$/.test(eventId)) {
        await sendMetaLead({
          env,
          eventId,
          eventSourceUrl: /^https?:\/\//.test(landingPage)
            ? landingPage
            : "https://santiago-architecture.com",
          email,
          name,
          projectType,
          locale: language || "unknown",
          source,
          clientIp: ip,
          userAgent: request.headers.get("user-agent") ?? "",
        });
      }
    }

    return Response.json({ ok: true, accepted: true });
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
