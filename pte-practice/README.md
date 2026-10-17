# LizOn PTE Intelligence Preview

This directory is the first controlled prototype for an independent PTE Academic preparation platform. It is NOT a production mock test, Pearson product, or calibrated AI scoring system.

## Preview
Use a local static file server from the repository root, for example:
  python3 -m http.server 8000
Then visit http://localhost:8000/pte-practice/

Browser ES modules will not work reliably with file:// URLs. Microphone capture requires a secure origin or localhost and explicit user permission.

## Implemented
- Current Pearson 22-question type registry with skill contributions and content-review flags, aligned to the current official guide.
- Branded responsive library navigation and nine original sample experiences: Read Aloud, Repeat Sentence, Summarize Written Text, Write Essay, Reading dropdown blanks, Reading multiple-choice multiple answers, Reading multiple-choice single answer, Reorder Paragraph and Write from Dictation.
- Per-answer objective raw marks and marking explanations for available reading samples and Write from Dictation.
- Paragraph adjacent-pair scoring, multi-choice negative scoring with zero floor, gap scoring and sentence alignment.
- Essay word-count form bands with zero rules, and word-count guidance for SWT. NO fabricated Content or official skill score.
- Browser voice recording preview for RA/RS. Audio is retained in memory only; not uploaded.
- Synthetic browser audio for demo RS/WFD. This is not calibrated exam audio.
- Live sample navigation, filter groups, keyboard-accessible buttons, appropriate focus indicators and responsive layout.
- 17 committed scoring contract tests, run by Node.js built-in test runner.

## Tests
  node --test pte-practice/tests/scoring.test.mjs

## Explicitly NOT built
Student enrolment check; paid entitlements; persistent attempts; server authentication; 22 functional response renderers; full-length mock tests; real question audios; teacher/content admin; AI speech/audio assessment; AI writing/content assessment; calibrated 10–90 performance bands; privacy/retention workflows; background scoring and retry queues; load testing.

Do not market or merge this to production as a complete PTE portal.

## Next technical milestone
1. Add secure Supabase Auth integration and proper role-based student route.
2. Implement typed question schema validation, content persistence and legally licensed media.
3. Add private audio storage with consent and a background assessment job queue.
4. Run a blind provider benchmark of speech transcription, acoustic pronunciation and writing content grading against teacher ratings.
5. Build 22 real task renderers and full exam simulation after task-level tests.
6. Calibrate estimated score reporting before releasing it to students.

Research document: /docs/pte-intelligence-platform-2026.md
Official current Pearson scoring reference: https://www.pearsonpte.com/content/dam/ELL/pte/pearsonpte/resources/PTE-Academic-Test-Taker-Score-Guide.pdf
