# LizOn IELTS Reading Practice

Development branch only. Not approved for production.

## Current implementation
- Responsive split-screen passage and questions
- Timed 60-minute demo with deadline persisted across refresh
- Untimed practice mode
- Answer entry and local progress recovery
- Question navigation and review flags
- Passage highlighting (currently limited to selections within one paragraph)
- Notes and basic answer checking

## Known limitations / release blockers
- Demo has only three original questions, not a full IELTS test.
- Cambridge 1–21 questions and answer keys are NOT included. Reproduction requires appropriate rights.
- Current demo does not implement all IELTS question types.
- Highlighting does not persist across reload.
- Review flags persist locally; notes persist locally.
- The practice/exam timer needs browser-based validation including expiry, sleep, refresh and multiple tabs.
- Scoring is demonstration-only, not an official IELTS band estimate.
- Need keyboard and screen reader audit, responsive layout testing, and exam behaviour comparison against official IELTS familiarisation.
- No production deployment or live testing has been performed.

## Release criteria
1. Authorised 40-question sample covering required question types.
2. All answers, flags, notes and highlights reliably persist and restore.
3. Correct timer, auto-submit and score mapping, tested in browsers.
4. Responsive and accessible computer-delivered interface.
5. Explicit content provenance and licence for every published test.
6. Preview QA, then deliberate production deployment.

## Content model
Store each authorised test as structured JSON with book/test identifier, three passages, questions, answer keys and source/licence metadata. Do not publish empty Cambridge tests as available.

## Branch
ielts-reading-practice
