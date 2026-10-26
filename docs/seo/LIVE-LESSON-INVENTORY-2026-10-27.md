# Existing Free-Class Inventory and SEO Mapping — 2026-10-27

## Verified live production catalog
Read-only requests to https://www.mylizon.com/api/ielts-content and /api/pte-content returned 200, initialized catalogs.
- **IELTS: 63 published video lessons**: Pre Basic 5, Grammar 8, Listening 11, Reading 14, Writing Task 1 6, Writing Task 2 9, Speaking 6, Letter Writing 1, Bonus 3.
- **PTE: 19 published video lessons**: Speaking 7, Writing 3, Listening 4, Reading 5.
- Notes are populated in 62/63 IELTS lessons and 19/19 PTE lessons. One IELTS Grammar entry had zero note characters.
- **Important discrepancy:** /ieltsclass.html meta description says '72 free IELTS video lessons'. The public API returns 63. Correct this claim on a staging branch after confirming desired wording.
- HTML initializes blank #lesson-title and #lessons containers; js/ielts-academy.js and js/pte-academy.js fetch catalogs through client-side JavaScript. Rendering may work in Google, but dedicated crawlable HTML is a stronger and more dependable search entry point. Do not claim Google never renders JS.

## Priority real lessons and mapped search questions
| ID | Existing lesson | Student need (EN/Bangla/Banglish variants) | Next SEO asset |
|---|---|---|---|
| ielts-034 | Heading Matching | matching headings / ম্যাচিং হেডিং / heading matching kivabe korbo | Indexable lesson companion |
| ielts-032 | True False Not Given | difference between true false not given / ট্রু ফলস নট গিভেন | Indexable companion |
| ielts-036 | Matching Information | matching information / ম্যাচিং ইনফরমেশন | Indexable companion |
| ielts-041/042/043 | Reading time passages 1–3 | reading time management / রিডিং সময় | Combined hub linking three existing videos |
| ielts-021/022 | Listening maps | map labelling / ম্যাপ / map kivabe solve | Single guide with two real videos |
| ielts-056/057 | Writing idea generation | Task 2 ideas / আইডিয়া জেনারেশন | Strong text resource |
| ielts-060 | Agree/Disagree question confusion | IELTS opinion essay structure | Resource + lesson |
| ielts-061 | Writing Evaluation | why IELTS Writing 6 vs 7 / ব্যান্ড কিভাবে বাড়াবো | Sample corrections (only verified) |
| ielts-063 | Speaking cue card 3P | IELTS Part 2 / কিউ কার্ড | Lesson companion |
| ielts-064 | Speaking Part 3 | IELTS Part 3 types / স্পিকিং পার্ট ৩ | Lesson companion |
| speaking-1 | PTE Read Aloud and Repeat Sentence | repeat sentence memory / মেমোরি | Companion, label each task separately |
| speaking-5 | PTE Summarize Group Discussion | summarize group discussion examples / গ্রুপ ডিসকাশন | Updated task page |
| speaking-6 | PTE Respond to a Situation | PTE situation response examples | Updated task page |
| speaking-8/9/10 | PTE Describe Image | describe image graphs/non-graphs / ডেসক্রাইব ইমেজ | Question-type hub |
| reading-1/4 | PTE Fill in the Blanks | dropdown vs drag drop | Two examples + links |
| reading-5 | PTE Reorder Paragraphs | reorder paragraph tricks | Lesson companion |
| listening-1 | PTE Summarize Spoken Text | SST approach | Lesson companion |

## Important content gaps (verify actual need)
PTE catalog currently has no individually published video under a title for Write From Dictation, Highlight Incorrect Words, or Highlight Incorrect Words; these may be covered in combined sessions, so inspect notes and original videos before calling them missing educational coverage. No separate IELTS Speaking mock-video title, though practice lessons exist.

## Technical strategy
1. Keep /ieltsclass.html and /pteclass.html user experience unchanged.
2. Create **small, high-quality, crawlable companion resources** for real lessons that have instructor-approved notes, useful examples and a link into the exact lesson (lesson deep-link behavior must be verified).
3. Ensure each has visible useful text, not hidden keyword lists, appropriate canonical URL, clear author attribution and links to related lessons.
4. Do not auto-publish DB notes verbatim without checking claims, exam currency, privacy and copyrights.
5. Audit titles for absolute statements ('almost all', 'all in one class', score promises) before turning them into Google result snippets.
6. Validate with Google URL Inspection, structured data tests and mobile smoke tests after staging preview.

## Data limitations
Public lesson API data was read through Vercel; full instructional quality of videos and accuracy of every note have not yet been independently reviewed. Keywords listed are research hypotheses, not verified historical Google volumes.
