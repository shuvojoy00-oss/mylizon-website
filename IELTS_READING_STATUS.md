# LizOn IELTS Reading Development Status

Branch: ielts-reading-practice. Production website unchanged.

## Implemented in development branch
- Three passage tabs in bottom navigation, each loading its corresponding passage and questions
- Independently scrolling reading passage and question panels on desktop
- Exam mode with a 60 minute wall clock deadline and automatic submission
- Practice mode with elapsed timer and no automatic time limit
- Question navigation, answer persistence, review flags and per passage notes
- Highlight selections within a single passage paragraph; highlights saved per passage
- Answer checking with multiple selection support
- Original 40 question demonstration dataset (13, 13, 14)
- Cambridge 1 through 21 library catalogue with 84 unpopulated slots

## Validation completed
- JSON parsed successfully
- Three passages, exactly 40 unique sequential question numbers
- All questions have prompts and answer keys
- Multiple selection answer keys correspond to their available choices
- Required HTML controls present

## Remaining before production
- Browser based runtime tests, accessibility and device QA
- Full length realistic passages and all official IELTS Academic Reading item layouts, including multi blank tables, diagrams, flow charts and linked matching tasks
- Refined answer review and band estimates based on verified conversion references
- Test session reset, cross tab conflict handling, detailed user progress and submission edge cases
- Production deployment verification

## Licensing
The 40 question sample is original demonstration content with intentionally short passages. It is not a genuine IELTS test and cannot predict an IELTS band.
Cambridge books 1 through 21 are NOT imported or licensed by this implementation. Catalogue entries are placeholders and must not be represented as available tests.

## Release gate
Do not merge to main or deploy until browser tests and content review pass.
