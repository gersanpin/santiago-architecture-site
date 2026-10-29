# Santiago Architecture

Bilingual architecture studio website (English / Español) built with Next.js App Router and `next-intl`.

## Stack

- Next.js 15 (App Router) + TypeScript
- `next-intl` locale routes: `/en`, `/es`
- Project data in TypeScript (`src/data/projects.ts`)
- 3D globe view with React Three Fiber

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The default locale is English (`/en`).

## Locales

- `/en/...` English (default)
- `/es/...` Español

The `EN / ES` switcher keeps the current path and query string (view mode, filters, selected globe project).

## Content

- UI copy: `messages/en.json`, `messages/es.json`
- Projects: `src/data/projects.ts` — shared technical fields (`slug`, `year`, coords, images) with bilingual text fields (`name`, `location`, `description`, SEO)

## SEO

- Per-page titles, descriptions, Open Graph
- `hreflang` via `alternates.languages` (`en`, `es`, `x-default`)
- `sitemap.xml` and `robots.txt`

Set the public site URL when deploying:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Contact attribution and Meta

Project inquiries include the locale, landing page, referrer, and standard UTM
parameters in the email sent by `/api/contact`.

Meta tracking is disabled by default. The public Pixel ID is configured, but
the server credential is never committed:

```bash
NEXT_PUBLIC_AD_TRACKING_ENABLED=false
NEXT_PUBLIC_META_PIXEL_ID=2065053147542702
META_CAPI_ENABLED=false
META_PIXEL_ID=2065053147542702
META_CAPI_ACCESS_TOKEN=TODO_META_CAPI_ACCESS_TOKEN
```

`META_CAPI_ACCESS_TOKEN` is server-only and must be stored as a Cloudflare
secret. The browser Pixel and Conversions API must use the same Pixel/dataset
ID so the shared inquiry `event_id` can deduplicate the Lead event.

The bilingual consent interface stores a versioned preference under
`localStorage["santiago-ad-consent"]`. Meta remains blocked unless marketing
consent is explicitly enabled. Rejecting or revoking marketing consent calls
Meta's consent revoke command and prevents subsequent PageView, CTA, and Lead
events. Lead is emitted only after the contact email provider confirms a
successful submission.

### Production activation

1. Review and approve the privacy/cookie copy and consent interface.
2. Set `NEXT_PUBLIC_META_PIXEL_ID=2065053147542702`.
3. Set `NEXT_PUBLIC_AD_TRACKING_ENABLED=true` in the environment used by
   `opennextjs-cloudflare build`. `NEXT_PUBLIC_*` values are build-time values;
   setting only a Worker runtime variable after the build is not sufficient.
4. Keep `META_CAPI_ENABLED=false` unless Conversions API is separately
   approved and its server-only token is stored with `wrangler secret`.
5. Build, test consent states, and deploy only after approval.

### Meta Test Events verification

1. In Meta Events Manager, select Pixel `2065053147542702`, then open
   **Test Events**.
2. In an approved test environment, enable `NEXT_PUBLIC_AD_TRACKING_ENABLED`
   and grant marketing consent through the consent manager.
3. Open an English page, navigate client-side to a Spanish page, and confirm
   one `PageView` for each URL.
4. Open the contact form without submitting and confirm that no `Lead` appears.
5. Submit one valid inquiry and wait for the success response; confirm exactly
   one browser `Lead`.
6. If Conversions API is enabled later, confirm the browser/server events share
   one event ID and are shown as deduplicated rather than two Leads.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — ESLint
