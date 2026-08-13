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
  }
}

export {};
