# IELTS/PTE question-type search-intent production standard — pilot 2026-10-29

## Evidence hierarchy
1. **Actual LizOn GSC query** — quote only from supplied PDF/CSV. Current Oct 29 PDF does NOT demonstrate meaningful nonbrand query volume for Matching Headings. Do not invent historical Bangla/Banglish Google volumes.
2. **Documented student language / concerns** — source-linked public discussions. Example: Bangladesh-specific IELTS learner describes struggling with headings (https://www.reddit.com/r/bangladesh/comments/1vvk5s4/a_comprehensive_guide_to_ielts_from_bangladeshs/); another IELTS learner reports ambiguous heading choices and timing problems (https://www.reddit.com/r/IELTS/comments/1vshtmb/reading_didnt_go_well/). The latter is not verified Bangladesh-only.
3. **Official task definition** — IELTS.org Academic Reading format (https://www.ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading) and teacher guide (https://ielts.org/news-and-insights/how-to-prepare-learners-for-matching-headings-task-on-the-ielts-reading-test).
4. **LizOn teacher lesson notes** — live published /api/ielts-content or /api/pte-content, matched by stable lesson ID. Pilot lesson ielts-034, title 'Heading Matching - প্রায় সব হবে'. Notes emphasize concept over repeated vocabulary, skimming and elimination, and practice discipline; unsupported accuracy statistics (70%, 85–90%) are **not repeated as facts**.
5. **Editorial search-language hypotheses** — English, বাংলা script and Banglish transliterations. Not measured volume. Use natural visible prose; no hidden keyword stuffing and no duplicate page for each spelling.

## Pilot intent clusters: Matching Headings
| Intent | English phrase | Bengali script | Banglish example | Evidence |
|---|---|---|---|---|
| Method | how to solve IELTS Matching Headings | IELTS ম্যাচিং হেডিং কীভাবে করব | matching headings kivabe korbo | Official task; editorial language translations |
| Ambiguous choices | two headings look correct | দুটি heading-ই সঠিক মনে হয় | duita heading same mone hoy | Public learner examples; translations are hypotheses |
| Time management | Matching Headings takes too long | ম্যাচিং হেডিংয়ে সময় বেশি লাগে | heading matching time beshi lage | Student discussion; translations are hypotheses |
| Keyword trap | matching same word instead of idea | শুধু শব্দ মিলিয়ে heading বাছা | same word dekhe heading select | Official teaching guide and LizOn notes |

## Page requirements for all question types
- One canonical URL per official task intent; do not create English/Bangla/Banglish near-duplicates.
- Exact real homepage header + mobile navigation + footer; preserve existing page content and site CSS.
- Real instructor lesson ID and notes; mark broad/related lessons as such.
- Student question-led explanations, original examples with answer/rationale, common errors, accurate score descriptions.
- Title, description, canonical, visible links and sitemap.
- Manual QA: mobile menu/desktop links, clickable lesson, test sample, schema, SEO metadata, render, HTTP 200.
- Teacher approval if rewriting an interpretation of course notes; don't invent results or certainty.

## Pilot implementation
Existing /ielts-matching-headings.html updated in-place to reuse the homepage's HTML header, mobile menu, footer and CSS plus explicit source-aligned student questions. No new duplicative page. Further scale-out should use this reviewed shell after visual QA.

## Remaining work
- Audit all 63 IELTS + 19 PTE published lessons and task notes, confirm exact lesson mappings and whether video links load.
- Map every official task to actual evidence of Bangladeshi student questions and distinguish unmeasured translations.
- Standardize existing question-type pages and deepen legitimate teaching content, one reviewed group at a time.
- Verify mobile and desktop visual rendering before claiming design perfect; automated source review alone is insufficient.
