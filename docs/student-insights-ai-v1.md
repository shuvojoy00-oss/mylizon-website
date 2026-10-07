# Student Insights AI v1

## What this branch adds

- Mobile first Student Insights feed
- Categories: Study Abroad, IELTS, PTE
- Bangla primary articles with optional English version
- Browser text to speech Listen control
- Search, Featured, automatic NEW treatment
- Protected content admin with rich text editing
- Draft, Needs Review, Published, Archived workflow
- AI news runner with web search
- Duplicate source protection
- Server side official source trust gate
- Daily Vercel Cron at 12:30 UTC (18:30 Bangladesh time, subject to plan scheduling precision)

## Existing environment variables reused

- DATABASE_URL or another supported Postgres variable already used by api/_db.js
- ADMIN_PASSWORD
- ADMIN_TOKEN

## New environment variables

- OPENAI_API_KEY
- CRON_SECRET
- OPENAI_NEWS_MODEL (optional, defaults to gpt-6-luna)

The AI news runner does not run without OPENAI_API_KEY. This is intentional so a deployment cannot accidentally create usage charges.

Vercel Cron sends CRON_SECRET as a Bearer authorization header when the project has CRON_SECRET configured.

## URLs after deployment

- /insights.html
- /article.html?slug=...
- /admin-insights.html
- /api/content
- /api/content-admin
- /api/news-run

## Auto publish rules

An AI story publishes automatically only when all of these are true:

1. The research result marks the primary source verified.
2. Confidence is at least 0.94.
3. The source URL passes the server side official source or academic domain gate.

Otherwise it is stored as Needs Review.

## Database

The public.content_posts table and indexes are created idempotently on first API use. No manual SQL migration is required for the initial version.

## Launch note

Do not add the public navigation link until the API deployment is confirmed with the production database and environment variables. This keeps the current site unaffected while the new content platform is tested.
