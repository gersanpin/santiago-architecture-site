type TurnstileVerifyResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Verify a Cloudflare Turnstile token with the siteverify API.
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
export async function verifyTurnstileToken(options: {
  token: string;
  secret: string;
  ip?: string;
}): Promise<TurnstileVerifyResult> {
  const token = options.token.trim();
  if (!token) {
    return { ok: false, reason: "missing_token" };
  }

  const body = new URLSearchParams();
  body.set("secret", options.secret);
  body.set("response", token);
  if (options.ip && options.ip !== "unknown") {
    body.set("remoteip", options.ip);
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
      },
    );
    if (!response.ok) {
      return { ok: false, reason: "verify_http_error" };
    }
    const data = (await response.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };
    if (!data.success) {
      return {
        ok: false,
        reason: data["error-codes"]?.join(",") || "verify_failed",
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "verify_network_error" };
  }
}
