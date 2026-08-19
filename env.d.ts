/** Cloudflare Worker bindings used by this app (extend OpenNext globals). */
declare global {
  interface CloudflareEnv {
    EMAIL?: {
      send: (message: {
        to: string | string[];
        from: string;
        subject: string;
        text?: string;
        html?: string;
        replyTo?: string | string[];
        attachments?: Array<{
          filename: string;
          content: ArrayBuffer | string;
          type: string;
          disposition: "attachment" | "inline";
          contentId?: string;
        }>;
      }) => Promise<{ messageId: string }>;
    };
    CONTACT_TO_EMAIL?: string;
    CONTACT_FROM_EMAIL?: string;
    /** Cloudflare Turnstile secret key (wrangler secret). */
    TURNSTILE_SECRET_KEY?: string;
    /** Public Turnstile site key (safe to expose; set as a Worker var). */
    NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string;
  }
}

export {};
