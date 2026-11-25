# The Margin

A small publication about attention, craft, and the web. Readers browse essays and leave notes in the margin; writers publish with Markdown, covers, and tags.

Built as a portfolio-sized full-stack app: Next.js App Router, Supabase Postgres and Auth, a REST API, and a test suite.

## Stack

- Next.js 16 (App Router, Cache Components) and React 19
- TypeScript strict mode, Tailwind CSS 4
- Supabase: Postgres, email/password auth, public storage bucket for covers
- Zod validation, react-markdown + remark-gfm, Vitest

## Features

- Email/password sign-up and sign-in, password reset, session refresh in the proxy
- Post CRUD with drafts, publish dates, tags, Markdown preview, and cover uploads
- Comments ("notes") with deletion by the commenter, post author, or an admin
- Public REST API under `/api` with a consistent error envelope and per-user rate limits
- Admin moderation page for recent posts and comments
- Light/dark theme, responsive editorial design, accessible forms

## Local setup

Requirements: Node 22+, npm, a free Supabase project.

1. Create a project at [supabase.com](https://supabase.com/dashboard).
2. Authentication → Sign In / Providers → Email: turn **off** "Confirm email" for instant sign-up.
3. SQL Editor → paste `supabase/migrations/0001_init.sql` → Run. This creates the tables, triggers, deny-all RLS policies, and the public `covers` bucket.
4. Copy `.env.example` to `.env.local` and fill in the values from Project Settings → API:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SEED_PASSWORD=<a password for the demo accounts>
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it to the browser or commit it.

5. Install, seed, and run:

```bash
npm install
npm run seed
npm run dev
```

The seed creates three demo accounts (`ada@demo.blog`, `marcus@demo.blog`, `june@demo.blog`) with six published essays and a handful of comments. It is idempotent: existing users and posts are left alone. The first account is an admin.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Vitest unit tests |
| `npm run seed` | Idempotent demo data seed |
| `npm run smoke` | Checks a running server; authenticated CRUD when `SMOKE_EMAIL`/`SMOKE_PASSWORD` are set |

## API

All mutations require a session cookie or `Authorization: Bearer <access token>`. Errors use:

```json
{ "error": { "code": "validation_failed", "message": "Some fields need attention.", "fields": { "title": "..." } } }
```

| Method | Route | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/api/health` | — | Queries Postgres; used by the Vercel cron |
| GET | `/api/posts?page=&tag=` | — | Published feed, 6 per page |
| POST | `/api/posts` | user | Create draft/published; 3 per minute |
| GET | `/api/posts/:slug` | optional | Drafts only for author/admin |
| PATCH | `/api/posts/:slug` | author/admin | Partial update |
| DELETE | `/api/posts/:slug` | author/admin | Deletes comments and cover |
| GET | `/api/posts/:slug/comments` | optional | Oldest first |
| POST | `/api/posts/:slug/comments` | user | 5 per minute |
| DELETE | `/api/comments/:id` | commenter/post author/admin | |
| POST | `/api/uploads` | user | Multipart `file`, ≤2 MB, JPEG/PNG/WebP by magic bytes |
| PATCH | `/api/profile` | user | Username, display name, bio |

## Deploy

1. Push the repository to GitHub.
2. In Vercel: New Project → import the repo (framework preset: Next.js). Hobby plan is enough.
3. Add the four environment variables from `.env.local`; set `NEXT_PUBLIC_SITE_URL` to `https://<project>.vercel.app`.
4. Deploy, then run the seed locally against the same Supabase project.
5. In Supabase → Authentication → URL Configuration, set the Site URL to the Vercel URL and add `https://<project>.vercel.app/auth/callback` as a redirect URL.
6. Optional: set `SMOKE_EMAIL`/`SMOKE_PASSWORD` and run `BASE_URL=https://<project>.vercel.app npm run smoke` against production.

`vercel.json` schedules a daily `/api/health` request so the free Supabase project does not pause after a week of inactivity.

## Known limits (deliberate)

- Password-reset emails only reach the project owner until a custom SMTP domain is verified; sign-up and sign-in work for everyone.
- Rate limits are counted from recent database rows, so two simultaneous requests can both pass.
- No threaded replies, likes, search, avatars, or user administration. Flat notes, oldest first.
- The free Supabase tier is a demo environment: 500 MB database, 1 GB storage, two projects.
