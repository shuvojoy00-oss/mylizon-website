# IELTS/PTE route classification and sitemap decision (2026-10-27)

Scope: existing root-level IELTS/PTE routes. This is an editorial/technical classification, **not proof of Google indexing or search traffic**. Live production checks in the preceding audit found HTTP 200 and www canonicals for the six pages added to sitemap.

## A. Public index candidates (evergreen, now newly in sitemap)
| URL | Why index | Action |
|---|---|---|
| /ielts-listening.html | Substantial evergreen listening strategy | Included |
| /ielts-speaking.html | Substantial evergreen speaking skill resource | Included |
| /ielts-writing.html | Substantial evergreen writing resource | Included |
| /ielts-grammar.html | Substantial grammar guidance | Included |
| /ielts-band-improvement.html | Common band-improvement intent | Included |
| /best-ielts-coaching-bangladesh.html | Search-relevant course comparison intent; verify marketing statements | Included; content review required |

Existing sitemap contains main IELTS/PTE course and classroom hubs, task-type directories and question guides, FAQ, IELTS reading, and beginner plan.

## B. Review before index/redirect (do not change automatically)
| URL | Risk/reason | Next gate |
|---|---|---|
| /ielts-roadmap.html | Historic ZERO/HOPE/STEP-UP/DESPERATE framing; overlaps new beginner guide | Review GSC/backlinks, revise or consolidate |
| /ielts-choose-level.html | Legacy package ladder | Verify live offerings before editing |
| /ielts-writing-on-paper-bangladesh.html | Time-sensitive policy and missing canonical | Validate official current policy, update date and metadata |
| /not-started-ielts.html | Mixed Study Abroad/IELTS positioning; no canonical | Review purpose and conversion before indexing |
| /ptetonight.html | Old campaign page, no canonical | Check campaign status |
| /ielts-reading-test-01.html and /ielts-reading-test-1-passage-1.html | Practice UX pages; possible duplication/intellectual property issues | Check original/licensed material and canonical hierarchy |
| /ieltsspeakingtest.html, /ask-cambridge-ielts.html | Tool content; potential thin/dynamic pages | Technical/UI audit before index |
| /ielts-placement.html | Assessment flow; likely not SEO landing page | Ensure user-facing testing works; keep out of sitemap |
| /pteportal.html | Student portal/product UI | Keep out of marketing sitemap pending review |

## C. Non-marketing application/admin routes
/ielts-admin.html, /ielts-placement-admin.html, /pte-admin.html: exclude from sitemap. Do not treat omission from sitemap as an access-control mechanism. Authentication and authorization are separate security questions.

## D. Remaining work and caveats
- This list classifies IELTS/PTE-named root HTML files identified through repository tree. It does not cover every unlabelled page, API or dynamically generated route.
- A sitemap is a discovery signal, not an indexing guarantee. Pages need to be accurate, sufficiently helpful, self-canonical and reachable via internal navigation.
- Verify the six newly included pages' outbound internal links, outdated claims and factual accuracy. Check that robots.txt does not block them.
- Search Console country Bangladesh query/page performance and page indexing should drive all consolidation/redirect decisions.
- Do not delete legacy pages merely to inflate crawl metrics; preserve working student pathways.
