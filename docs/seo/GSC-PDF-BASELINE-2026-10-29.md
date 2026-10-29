# Google Search Console baseline — MyLizOn.com — PDF export dated 2026-10-29

## Source and interpretation
User-provided: **mylizon.com-Performance-on-Search-2026-10-29.pdf**, 10 pages, Google Search Console *Performance on Search* export. Filter: **Web search, Last 3 months**. The PDF does not provide a precise start date, individual-day performance for the entire period, a page-by-query cross-tab, indexed/excluded URL list, or search-volume estimates. The visible Date table only shows 24–27 October and must not be interpreted as a full daily trend.

## Site-wide baseline
- Device table: Mobile 8 clicks / 452 impressions / CTR 1.77% / avg position 6.46; Desktop 8 / 294 / 2.72% / 17.79; Tablet 1 / 12 / 8.33% / 4.75.
- Therefore **17 total clicks / 758 impressions / 2.24% calculated aggregate CTR**.
- Country Bangladesh: **16 clicks / 407 impressions / 3.93% CTR / average position 11.36**. This country row is not a Bangladesh filter on other tables; do not assume all top query/page rows refer to Bangladesh.
- Brand query `lizon education`: 7 clicks / 17 impressions / 41.18% CTR / average position 1.06.
- Brand query `lizon`: **0 clicks / 198 impressions / 0% CTR / avg position 5.53**. Verify query meaning, competing brand intent and exact result appearance before changing titles.
- Bengali-script query visible: `লিজন` (PDF text encoding sometimes renders as `িলজন`): 0 clicks / 3 impressions / avg position 4.33.
- `ielts`: 0 clicks / 1 impression / avg position 4, too little to draw category demand conclusions.
- `write from`: 0 clicks / 1 impression / avg position 10, ambiguous. Do not label as confirmed 'Write From Dictation' traffic without the untruncated original query.

## Page-level IELTS and PTE observations (all-country, top pages table)
| Page | Clicks | Impressions | CTR | Avg position |
|---|---:|---:|---:|---:|
| /ielts-faq-bangladesh.html | 0 | 32 | 0% | 3.88 |
| /ielts-reading.html | 0 | 30 | 0% | 3.10 |
| /pte.html | 0 | 24 | 0% | 1.71 |
| /ielts.html | 0 | 13 | 0% | 1.23 |
| /ielts-listening.html | 0 | 2 | 0% | 7.5 |
| /pteclass.html?class=10 | 0 | 3 | 0% | 1 |
| /pteclass.html?class=3 | 0 | 2 | 0% | 1 |
| /ieltsclass.html?video=ytbbfnndo0c | 0 | 2 | 0% | 8 |
| /ieltsclass.html?video=Cx-4qHh3FvE | 0 | 1 | 0% | 9 |

The four principal IELTS/PTE pages above collectively have **99 impressions and 0 clicks**, but the data is sparse and overall average positions are not topic-keyword ranking claims. Several newly published guide URLs are absent from the displayed top-pages list. **Absent from top-pages PDF ≠ not indexed**.

Other observed rows: Home page 11 clicks / 256 impressions; Study Abroad country pages account for most other displayed clicked URLs. Query table visible 7+1+1 known clicks; not all clicks are attributed to listed queries due to reporting and privacy thresholds. Do not force totals to match.

## What this evidence supports
1. LizOn is appearing in Google Search, including Bangladesh.
2. Search visibility is still small and concentrated in branded or study-abroad-related terms; nonbrand IELTS/PTE acquisition is unproven by this export.
3. IELTS/PTE commercial and evergreen pages are appearing, but recorded engagement for their displayed rows is zero. A small denominator limits inference.
4. There is a potentially important brand query issue (`lizon`: 198 impressions, 0 clicks), requiring SERP inspection by device/country and query meaning.
5. Google has shown parameterized classroom URLs; inspect canonical/duplicate behavior in GSC, not only in HTML.

## Action plan in order
**A. Request proper GSC data slices**: Export separate CSV / Google Sheet from Search results with Country = Bangladesh; 3-month Queries, Pages, Devices, and filtered Queries containing IELTS / PTE / lizon (case-insensitive); also Page indexing report + URL inspection for the newly published priority URLs. Do not claim this PDF provides a Bangladesh-specific query-to-page mapping.

**B. Diagnose brand result**: Inspect exact SERP and GSC query `lizon` filtered by country, device, search appearance; verify site title, favicon, organization markup, snippet and any similarly named brands. Start with observation, no unsupported CTR promises.

**C. Diagnose potential low CTR on core pages**: /ielts.html, /pte.html, /ielts-faq-bangladesh.html, /ielts-reading.html. Query/page filter and country necessary before editing headings; averages near position 1–4 can reflect unusual query mixes.

**D. Inspect indexing** for /ielts-preparation-from-zero.html, /ielts-question-types.html, /pte-question-types.html, /ielts-vs-pte-bangladesh.html, recent worked guides. Publication and sitemap presence are not indexing.

**E. Separate query-demand discovery**: GSC is site-observed performance and insufficient for population-level historical Bangladesh keyword volume. Combine with properly dated Trends CSVs, external keyword tools and authentic discussions; label inference.

**F. Add analytics conversion attribution** from organic landing page to WhatsApp consultation and enrollment, with consent/privacy-appropriate measurement.

## Completion gate
This phase is **PDF baseline analyzed**, not a fully verified GSC indexing audit or comprehensive historical keyword-volume study. Completion requires authenticated GSC page indexing status and segmented query/page data.
