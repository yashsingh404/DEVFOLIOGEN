# DevFolioGen

DevFolioGen builds a developer portfolio from GitHub data. Enter a GitHub username and the app assembles a portfolio page from profile data, repositories, languages, contribution history, and optionally AI-generated summaries.

## What works today

- Portfolio pages generated from public GitHub profiles
- Featured project ranking from repository data
- Language breakdowns and contribution visualizations
- Optional AI-generated about/SEO content with Groq
- Optional custom URLs, persistent cache, and GitHub sign-in when Postgres is configured
- Production build with `npm run build`

## Runtime modes

The app now supports two practical modes:

### 1. Lightweight mode

Use this when your goal is to fetch GitHub data and generate portfolio pages quickly.

- No database required
- No AI key required
- Public GitHub profiles still work
- Cache/custom URL data is kept in memory only
- GitHub OAuth is disabled

### 2. Full mode

Use this when you want the complete product behavior.

- Postgres-backed cache
- Persistent custom URLs
- GitHub OAuth
- Groq-generated summaries and SEO content
- Better GitHub API limits with `GITHUB_TOKEN`

## Quick start

### Prerequisites

- Node.js 20+
- npm
- Optional: PostgreSQL
- Optional: Groq API key
- Optional: GitHub personal access token

### Install

```bash
npm install
npm run bootstrap
npm run check:setup
```

`npm run bootstrap` creates `.env.local` from `.env.example` if it does not already exist.

### Minimal local run

This is enough for public GitHub portfolio generation:

```env
DEBUG=true
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GITHUB_REPO_URL=https://github.com/nishantmishra/devfoliogen
```

Then start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and try a GitHub username such as `octocat` or your own.

## Environment variables

### Core

- `DEBUG`
  - Set `true` for local development if you do not want API key enforcement.
- `NEXT_PUBLIC_SITE_URL`
  - Public site URL used for metadata.
- `NEXT_PUBLIC_API_URL`
  - Base API URL for server/client requests.
- `NEXT_PUBLIC_GITHUB_REPO_URL`
  - Repository link shown in the landing page and used for star count.

### GitHub data

- `GITHUB_TOKEN`
  - Optional but recommended.
  - Increases rate limits and unlocks richer GitHub GraphQL data.

### AI

- `GROQ_API_KEY`
  - Optional.
  - Enables AI-generated About and SEO content.
  - Without it, the app falls back to deterministic summaries.

### Database and auth

- `DATABASE_URL`
  - Optional for lightweight mode.
  - Required for persistent cache, custom URLs, and OAuth-backed auth.
- `GITHUB_CLIENT_ID`
  - Required only if GitHub sign-in is enabled.
- `GITHUB_CLIENT_SECRET`
  - Required only if GitHub sign-in is enabled.

### Other

- `CACHE_ENABLED`
  - Default `true`
- `DEFAULT_CACHE_TTL`
  - Default `3600`
- `SCREENSHOT_API_URL`
  - Optional screenshot service for project previews

See [.env.example](/Users/nishantmishra/Documents/devfoliogen/.env.example).

## Useful commands

```bash
npm run bootstrap
npm run check:setup
npm run dev
npm run lint
npm run build
```

## Deployment

### Minimal deployment

Use this if the main goal is public GitHub portfolio generation.

1. Set `DEBUG=false`
2. Set `NEXT_PUBLIC_SITE_URL`
3. Set `NEXT_PUBLIC_API_URL`
4. Set `NEXT_PUBLIC_GITHUB_REPO_URL`
5. Optionally set `GITHUB_TOKEN`
6. Deploy with:

```bash
npm run build
npm start
```

### Full deployment

Use this for the full product.

1. Provision PostgreSQL
2. Set `DATABASE_URL`
3. Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
4. Set `GROQ_API_KEY`
5. Set `GITHUB_TOKEN`
6. Run:

```bash
npx prisma migrate deploy
npm run build
npm start
```

## Architecture summary

- [app/page.tsx](/Users/nishantmishra/Documents/devfoliogen/app/page.tsx): landing page and username entry
- [app/(portfolio)/[username]/page.tsx](/Users/nishantmishra/Documents/devfoliogen/app/(portfolio)/[username]/page.tsx): portfolio page renderer
- [lib/modules/github/fetcher.ts](/Users/nishantmishra/Documents/devfoliogen/lib/modules/github/fetcher.ts): GitHub profile and social-link data
- [lib/modules/github/projects.ts](/Users/nishantmishra/Documents/devfoliogen/lib/modules/github/projects.ts): featured project ranking
- [lib/services/profile.ts](/Users/nishantmishra/Documents/devfoliogen/lib/services/profile.ts): profile enrichment with AI/fallback content
- [lib/utils/db.ts](/Users/nishantmishra/Documents/devfoliogen/lib/utils/db.ts): Prisma or in-memory fallback persistence

## Verification

Current workspace checks:

- `npm run lint`
- `npm run build`

Both pass.
