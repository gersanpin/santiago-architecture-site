import { createHash } from "node:crypto";

type MetaLeadInput = {
  env: CloudflareEnv;
  eventId: string;
  eventSourceUrl: string;
  email: string;
  name: string;
  projectType: string;
  locale: string;
  source: string;
  clientIp: string;
  userAgent: string;
};

function sha256(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export async function sendMetaLead({
  env,
  eventId,
  eventSourceUrl,
  email,
  name,
  projectType,
  locale,
  source,
  clientIp,
  userAgent,
}: MetaLeadInput): Promise<boolean> {
  const pixelId = env.META_PIXEL_ID?.trim();
  const accessToken = env.META_CAPI_ACCESS_TOKEN?.trim();
  if (
    env.META_CAPI_ENABLED !== "true" ||
    !pixelId ||
    !/^\d+$/.test(pixelId) ||
    !accessToken
  ) {
    return false;
  }

  const [firstName = "", ...lastNameParts] = name.trim().split(/\s+/);
  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: eventSourceUrl,
        user_data: {
          em: [sha256(email)],
          ...(firstName ? { fn: [sha256(firstName)] } : {}),
          ...(lastNameParts.length
            ? { ln: [sha256(lastNameParts.join(" "))] }
            : {}),
          ...(clientIp && clientIp !== "unknown"
            ? { client_ip_address: clientIp }
            : {}),
          ...(userAgent ? { client_user_agent: userAgent } : {}),
        },
        custom_data: {
          content_category: projectType,
          content_name: "Project inquiry",
          lead_language: locale,
          lead_source: source,
        },
      },
    ],
    access_token: accessToken,
    ...(env.META_TEST_EVENT_CODE?.trim()
      ? { test_event_code: env.META_TEST_EVENT_CODE.trim() }
      : {}),
  };

  try {
    const version = env.META_GRAPH_API_VERSION?.trim() || "v22.0";
    const response = await fetch(
      `https://graph.facebook.com/${version}/${pixelId}/events`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3000),
      },
    );
    if (!response.ok) {
      console.error("Meta CAPI Lead event failed", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Meta CAPI Lead event failed", error);
    return false;
  }
}
