# LizOn IELTS/PTE SEO audit and execution order
Date: 2026-10-27 | Scope: IELTS/PTE only | Status: baseline public technical audit **completed**, private analytics/AI benchmark **not accessible yet**

## Audit evidence
Direct production HTTP checks (Vercel public web fetch):
- 20 sampled URLs returned HTTP 200, including /ielts.html, /pte.html, both class interfaces, both question-type directories, /ielts-preparation-from-zero.html, /ielts-roadmap.html, selected learning guides, /ielts-faq-bangladesh.html, /ielts-reading.html, /robots.txt and /sitemap.xml.
- Course pages, classes, question-type directories, selected lesson guides, the FAQ and reading page expose self canonical URLs.
- **Confirmed defect**: /ielts-roadmap.html missing canonical. Fixed with a self-referencing canonical on this branch, pending production deployment.
- **Content governance conflict**: Old /ielts-roadmap.html advertises ZERO/HOPE/STEP-UP/DESPERATE, whereas the new /ielts-preparation-from-zero.html is a general preparation plan and current program strategy uses simple batches. **No redirect or deletion until reviewing possible backlinks/traffic and deciding whether roadmap is still valid**.
- **Indexability of client-rendered classes**: /ieltsclass.html and /pteclass.html show static section headings, while individual lesson titles/notes are filled by browser JS via /api/ielts-content and /api/pte-content. Crawlers may render JS; do not assume Google cannot crawl. Best path: indexable, detailed companion resources for high-value lessons; do not create thin pages for all 82.
- Sitemap currently enumerates 33 URLs (count from repository at initial audit); an incomplete list does not mean all other pages are non-indexable. Audit active routes/legacy files before including them.
- Bengali and Banglish support exists on the learning pages, but full demand mapping and query-volume validation remain incomplete.
- Public web index showed a cached version of /pteclass.html and a separate old /ielts-roadmap.html, demonstrating external search snippets can lag production changes; live HTTP data takes precedence for deployment correctness.
- Site availability and markup do not establish Google indexing. The Google Search Console API requires OAuth2 authorized to the property; GitHub/Vercel connection does not grant that automatically. Source: https://developers.google.com/webmaster-tools/v1/how-tos/authorizing

## Priority sequence — execute in order with acceptance gates
| Order | Workstream | Acceptance gate | Status |
|---|---|---|---|
| 1 | Public technical SEO inventory and critical integrity fixes | Audit active IELTS/PTE routes and fix 404s, canonical conflicts, duplicate/retired program URLs, sitemap and basic metadata; verify production | Initial sampled audit done; full route inventory pending |
| 2 | Private Google Search Console performance & index coverage | Authenticated last 3/12/16 months (as available): country Bangladesh, query, page, device, impressions, clicks, position; inspect indexing for key URLs; compare pre/post publish | Blocked on live GSC OAuth connection or export |
| 3 | Historical Bangladesh keyword demand validation | English/Bengali/Banglish intent clusters; source, date, method and measured-versus-inferred labels; priority based on credible volume/real questions | Partial public student evidence only; volume not verified |
| 4 | Content and lesson quality | Audit 63 IELTS and 19 PTE lessons and public guides for factual errors, depth, question-specific examples, references, exact video links, overlaps | Partial |
| 5 | Helpful information architecture | One authoritative resource per intent; internally linked IELTS/PTE directories; carefully consolidate overlaps, maintain existing design | Partial |
| 6 | Expertise, trust and conversion | Verify Shuvo Sarker Joy credentials and visible authorship, real testimonials with permission, course details, contact/WhatsApp measurement | Not audited end-to-end |
| 7 | Repeatable ChatGPT/Gemini/Google AI citation benchmark | Standardized 30–50 prompts, dates, engines, actual output URLs/citations, accuracy and competitive mentions; no invented AI visibility numbers | Not measured |
| 8 | Continuous reporting & maintenance | Successful weekly health job, regular GSC snapshots, updates when official exam formats change, monthly enquiries/admissions review | Health workflow configured; first successful run unverified |

## Rules
- IELTS/PTE only until acceptance gates 1–7 have evidence, except critical security or broken functionality fixes elsewhere.
- Do not use hidden keyword blocks, automatically mass-publish thin pages, or assert keyword search-volume from Reddit discussions.
- Review old product offers before surfacing: legacy roadmap includes obsolete ZERO/HOPE/STEP-UP/DESPERATE segmentation.
- Do not claim #1 rankings or AI citations based on publishing; measure.
- Weekly reports must identify DONE / IN PROGRESS / NEEDS ACCESS and link supporting audit evidence.

## Immediate next action
Complete active IELTS/PTE route-by-route inventory, then obtain an OAuth-authorized GSC connector or property export to measure actual Bangladesh Google queries, index status and clicks. Use those measurements to choose which existing high-value pages to improve first, and only then broaden content coverage.
