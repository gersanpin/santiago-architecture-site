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

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — ESLint

## Contact spam protection

The contact API uses:

1. Cloudflare **Turnstile** (required in production)
2. A honeypot field
3. Minimum fill time
4. Same-origin checks
5. Per-IP rate limiting

Create a Turnstile widget for `santiago-architecture.com` in the Cloudflare dashboard, then set:

```bash
# Public site key (also add under wrangler `vars` or Workers env)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x...

# Secret key — never commit; set as a Worker secret:
npx wrangler secret put TURNSTILE_SECRET_KEY
```

Redeploy after setting both keys.
