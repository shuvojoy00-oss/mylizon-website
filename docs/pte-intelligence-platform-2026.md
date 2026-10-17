# LizOn PTE Intelligence Platform | Research and Engineering Specification
Research date: 13 October 2026
Status: Research-verified architecture, no claim of Pearson-equivalent scoring
Track: PTE Academic and PTE Academic UKVI. PTE Core is a distinct future product.

## Confirmed environment
Vercel workspace Joy's projects: Pro plan. Linked deployment project mylizon-website. GitHub shuvojoy00-oss/mylizon-website. Existing app includes a Supabase-authenticated /portal/ and Node.js/PostgreSQL APIs. Do not create a duplicate login or modify the existing public PTE course or free class pages.

## Authoritative sources
1. Pearson current test-taker score guide, 46 pages: https://www.pearsonpte.com/content/dam/ELL/pte/pearsonpte/resources/PTE-Academic-Test-Taker-Score-Guide.pdf
2. Pearson speaking/writing test types: https://www.pearsonpte.com/pte-academic/test-format/speaking-writing/
3. Pearson reading: https://www.pearsonpte.com/pte-academic/test-format/reading/
4. Pearson listening: https://www.pearsonpte.com/pte-academic/test-format/listening/
5. Pearson 2025 revisions: https://www.pearsonpte.com/pte-updates-2025/
6. Pearson premium practice (AI feedback, not same as scored practice): https://www.pearsonpte.com/pte-academic/preparation/ai-practice/
7. Pearson official scored practice: https://www.pearsonpte.com/pte-academic/preparation/scored-practice-test/
8. Alfa public product: https://alfapte.com/
9. Alfa enterprise: https://alfapte.com/pte-for-businesses/sign-up
10. APEUni public product: https://www.apeuni.com/en
11. Research on spacing and retrieval: https://www.nature.com/articles/s44159-022-00089-1

## Scope: 22 assessed question types
Section times: Speaking and Writing 76–84 min; Reading 23–30 min; Listening 31–39 min. Each balanced examination has approximately 65–75 questions. Personal Introduction is not scored and must be in exam simulation.

The entries below show question count range, skill contributions and scoring mechanics. The source of truth for any future changes remains the Pearson Score Guide, not older prep websites.

Speaking and Writing
01 RA / Read Aloud / 6–7 / Speaking / word substitution, insertion and deletion; pronunciation 0–5; oral fluency 0–5. Needs original passage, mic recording, acoustic evaluation, token alignment.
02 RS / Repeat Sentence / 10–12 / Listening + Speaking / content 0–3 based on ordered recall; pronunciation 0–5; oral fluency 0–5. One-play audio and one response.
03 DI / Describe Image / 5–6 / Speaking / content 0–6; pronunciation 0–5; oral fluency 0–5. Image facts, graph relationships and accurate explanation; expert calibration for Content.
04 RL / Retell Lecture / 2–3 / Listening + Speaking / content 0–6; pronunciation 0–5; oral fluency 0–5. Speech-to-text with idea coverage, omissions, hallucination checks; human-review analogue.
05 ASQ / Answer Short Question / 5–6 / Listening / correct-or-incorrect semantic answer set. Automatic aliases need expert curation.
06 SGD / Summarize Group Discussion / 2–3 / Listening + Speaking / content 0–6; pronunciation 0–5; oral fluency 0–5. Original three-voice dialogue, per-speaker ideas, points of agreement and disagreement, 10 sec prep, 2 min response.
07 RTS / Respond to a Situation / 2–3 / Speaking / content 0–6; pronunciation 0–5; oral fluency 0–5. Evaluate task completion, register, context and interpersonal suitability; 10 sec prep, 40 sec response.
08 SWT / Summarize Written Text / 2 / Reading + Writing / content 0–4, form 0–1, grammar 0–2, vocabulary 0–2. One complete sentence of 5–75 words for form credit. A zero on Content or Form gates the item.
09 WE / Write Essay / 1 / Writing / content 0–6, form 0–2, development-structure-coherence 0–6, grammar 0–2, general linguistic range 0–6, vocabulary range 0–2, spelling 0–2. Form 2 for 200–300 words, 1 for 120–199 or 301–380; 0 below 120 or above 380 or other published form invalidity. Content/Form gate.

Reading
10 FIB-D / Dropdown / 5–6 / Reading / +1 correct gap.
11 MCMA-R / Multiple Choice Multiple Answers / 2–3 / Reading / +1 correct choice, -1 incorrect selected, floor 0.
12 RP / Reorder Paragraph / 2–3 / Reading / +1 each adjacent ordered pair matching correct sequence, no overall exact-only scoring.
13 FIB-DRAG / Fill in the Blanks Drag and Drop / 4–5 / Reading / +1 correct gap.
14 MCSA-R / Multiple Choice Single Answer / 2–3 / Reading / 0 or 1.

Listening
15 SST / Summarize Spoken Text / 1 / Listening + Writing / content 0–4, form 0–2, grammar 0–2, vocabulary 0–2, spelling 0–2. Form 2 for 50–70 words, 1 for 40–49 or 71–100; form 0 below 40 or above 100 or other published invalidity. Content/Form gate.
16 MCMA-L / Multiple Choice Multiple Answers / 2–3 / Listening / +1 correct selected, -1 incorrect, floor 0.
17 FIB-T / Fill in the Blanks Type In / 2–3 / Listening / +1 each precisely spelled missing word.
18 HCS / Highlight Correct Summary / 2–3 / Listening + Reading / 0 or 1.
19 MCSA-L / Multiple Choice Single Answer / 2–3 / Listening / 0 or 1.
20 SMW / Select Missing Word / 1–2 / Listening / 0 or 1.
21 HIW / Highlight Incorrect Words / 2–3 / Listening + Reading / +1 correct highlight, -1 incorrect, floor 0.
22 WFD / Write from Dictation / 3–4 / Listening + Writing / +1 correctly recalled and spelled word. Use sequence-aware alignment for informative feedback and validate equivalence with expert scoring samples.

Important: previous popular guides may claim old cross-skill mapping. Use only the current verified guide. Current RA contributes Speaking, ASQ contributes Listening, and reading dropdown contributes Reading in the published table.

## Pearson mechanisms: what is known and unknown
The published guide describes proprietary Versant-based automated speech evaluation (segments, syllables, acoustic features, statistical modeling) and an Intelligent Essay Assessor for writing using linguistic/semantic analysis. Human experts train scoring models and also review anomalies. Seven types require human review of Content in the live exam: DI, RL, RTS, SGD, SWT, WE, SST. WE also has additional human review of Development/Structure/Coherence and General Linguistic Range. If content or form is disqualifying, downstream trait grades do not rescue the response.

The published overall 10–90 is NOT the average of the four communication skills. Never make up a conversion formula. A platform can calculate rule-based item raw marks, display trait-level practice feedback and, only after calibration against official results, show clearly labelled estimated 10–90 performance ranges. Pearson's proprietary equating, weighting, acoustic calibration, question difficulty, reference corpora, and score transformation cannot be inferred from the public rubric. Do not promise exact-score equivalence.

## Comparative product research
Alfa openly lists mock variants, custom mock tests, progress analytics, large question banks and white-labelled institutional admin and student accounts. APEUni lists mobile/web sync, pronunciation/fluency AI assessment, shadowing, vocabulary, teacher mode, AI study planning and report analysis. Pearson's new Official AI Practice lists 1,000+ official questions, 15 full mocks, 20 sectional tests, trait-aligned AI estimates and AI tutor, while the separate official scored practice uses the actual scoring engine.
Observations are from public product material only. Full private/paywalled workflows and proprietary algorithms have NOT been accessed, verified or reverse-engineered. Do not scrape, reuse, or republish copyrighted rival/Pearson item banks.

## Platform design principles
1. Two modes: Learn (hints, replay where licensed, instruction, detailed feedback) vs Exam (locked sequence, single-play audio, one-take responses, real timers, no feedback until completion).
2. Every question stores a versioned JSON schema: itemId, taskType, locale, section, instructions, original asset URIs, text/audio timing and metadata, answer key, expected concepts, rubricVersion, validationState, and provenance/license.
3. Every attempt stores userId, course/enrolmentId, questionVersion, timing, client telemetry, response text/audio reference, transcript confidence, evaluation model version, trait results, evidence spans, review override and safety status.
4. Objective marking deterministic and unit-tested. Audio transcription separate from acoustic speech marking. LLM-based writing/content marking uses structured rubric and independent checks; combine with expert review for low confidence.
5. Use Supabase Auth, strict PostgreSQL row-level security for students, and role-based administrative APIs. Do not expose service credentials in the browser. Resolve existing dual database integration before adding persistent attempt tables.
6. Audio uploaded directly to private object storage using temporary URLs; background scoring jobs with idempotency, retry, rate-limit handling and result polling. Consent, retention and deletion policy for voice recordings.
7. Question bank original, teacher-reviewed and copyright-cleared. Generation must not publish automatically without review. Diverse accents, audio volumes, microphones and device compatibility.
8. Instructor console: audio/playback, original text, editable scoring, dispute triage, assignment analytics and early warning for low study engagement.
9. Feedback psychology: error-specific explanation, one actionable next-step, active retrieval practice, spaced review and score trend uncertainty. Explain why an answer is wrong and how to fix it. No fabricated precision or pressure-based gamification.
10. Future IELTS capability should come from generic response capture, rubric engine, teacher override and progress infrastructure, while PTE-specific exam schemas remain separate.

## Proposed services, pending benchmark
Web UI: typed React or similar application with separate build. Deployment and serverless APIs: existing Vercel Pro project. Identity: existing Supabase. DB: existing PostgreSQL after inventory and migration decision. Durable audio store: private object storage (Vercel Blob/R2/S3); verify region, access and consent. Acoustic pronunciation: Azure Speech pronunciation assessment as an initial candidate. ASR: compare at least two providers on Bangladeshi English; independent ASR transcripts must not be misrepresented as pronunciation scores. LLM: rubric-grade responses with bounded structured JSON, model pinning, deterministic gates, prompt-injection defence on student answers. Queue: managed job workflow or durable worker; backoff, replay protection and event audit. Provider selection is not locked before quality tests.

## Acceptance gates
A. Source-controlled 22-schema registry; original reference tests and exact scoring tests, including partial, negative floor, adjacent pairs, form zero and word matching.
B. Browser exam engine with reconnect and timer integrity; cannot revisit locked questions; mic permission checks and audio replay restrictions.
C. Acoustic calibration across diverse Bangladeshi student samples and microphones; evaluate transcription WER and pronunciation error reliability.
D. Open-response double-blind scoring with instructors, interrater agreement, disagreement thresholds, evidence-backed feedback, fail-safe when provider offline.
E. Full end-to-end security test: authenticated student permissions, admin access, no IDOR, RLS, encrypted private audio, cost/rate limits, consent and deletion.
F. Benchmark latency and per-attempt costs with real voluntary student sample; evaluate prediction error against official outcomes where available; publish performance limitations transparently.
G. Accessibility: keyboard, labels, screen readers, responsive Learn mode; genuine exam simulation emphasises desktop/headset and clear device recommendation.
H. Always allow rollback and monitor Vercel deployment health before merging to main.

## Delivery sequence
Phase 0: audited specification and versioned registry.
Phase 1: polished shell, item rendering primitives, objective scoring and contract tests, no fake AI scores.
Phase 2: working speech and writing provider integrations and persistent attempts.
Phase 3: complete exam session engine and admin content studio.
Phase 4: calibrated score estimates, teacher moderation, A/B-tested learning recommendations.
Phase 5: validated production rollout, original content scale and performance monitoring.

## IP and integrity
LizOn is an independent preparation platform, not Pearson-approved/affiliated. Avoid Pearson visual trade dress, cloned logos, copyrighted official questions, official score report lookalikes and unauthorized automated access. Attribute official scoring guidance with source links and version date. Distinguish practice feedback from official certified results.
