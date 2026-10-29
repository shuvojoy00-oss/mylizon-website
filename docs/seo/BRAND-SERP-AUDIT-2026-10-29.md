# Stage 2 — Brand and search-result audit (29 October 2026)

## Ground truth
- User-provided Search Console PDF export (last three months, web): site-wide 17 clicks / 758 impressions (device totals); Bangladesh 16 clicks / 407 impressions. Query `lizon` 0 clicks / 198 impressions; `lizon education` 7 clicks / 17 impressions. The query table is NOT Bangladesh-filtered.
- All four inspected key HTML pages (homepage, /ielts.html, /pte.html, /ielts-faq-bangladesh.html) have descriptive titles, descriptions and canonical URLs; course pages include links to PNG favicon at /assets/logo/lizon-logo.png.
- Public fetch: the official PNG favicon resource returns HTTP 200, but /favicon.ico returns 404. Modern browsers/search engines can use declared PNG favicons; missing .ico is a compatibility opportunity, NOT proof Google's favicon is broken. Source logo asset must remain the user-approved official logo.
- The main homepage appears in public search results under its proper LizOn Education title.

## High-priority brand impersonation / confusion review
- Search discovered `https://lizoneducation.pages.dev/`, an apparently separate Cloudflare Pages site styled as 'Lizon IELTS Hub'. It shows LizOn Education names, a matching phone/address and testimonials. Pages include:
  - https://lizoneducation.pages.dev/
  - https://lizoneducation.pages.dev/about/
  - https://lizoneducation.pages.dev/contact/
- Its public /about/ page contains prominent assertions such as 95% success rate, 5000+ students, named instructors and 7.5+ target scores, none verified in the official current LizOn content audit. **Ownership is NOT established**. Do not claim this site is malicious or fabricated without investigation; it may be an earlier experiment, contractor deployment or third party.
- Recommended owner action: identify who controls Cloudflare account/project; if authorized legacy deployment, either remove unsupported claims and canonicalize/deindex appropriately or retire it with correct migration; if unauthorized, collect screenshots and report to Cloudflare abuse and search providers using factual evidence. Never deploy changes to unowned sites.
- Also note publicly indexed LinkedIn company profile has an older Kalshi Dhaka office address while current official site displays Basabo. This is a directory consistency issue; verify organization control and correct profile addresses after confirmation.

## What to do before CTR changes
- In GSC filter Query = `lizon` and Bangladesh, inspect exact pages + devices for that query; investigate competing entities and on-screen snippet before editing titles.
- In GSC filter each IELTS/PTE page, inspect the Queries tab and Bangladesh filter. Low denominators and average position are not strong evidence of search competitiveness.
- GSC PDF is a performance export, **not** Page Indexing or URL Inspection result; cannot verify indexing of new pages from it.

## Technical next steps
- Source the exact user-approved official logo and generate a proper .ico derivative only with confirmation that binary icon matches; do not invent or replace the logo.
- Verify all new content URLs through Google URL Inspection or connected GSC API and compare crawled canonical to declared.
- Track actual clickthrough from landing pages to enquiry channels and admissions; no unsolicited tracking without privacy review.
