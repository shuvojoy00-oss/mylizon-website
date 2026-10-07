# Student Insights AI v1 — Zero Cost Mode

## Cost rule
No paid AI API is used. There is no OPENAI_API_KEY requirement and no paid model call from the website.

## Architecture
- Manual posts: existing Postgres database + protected admin editor.
- Automatic AI posts: ChatGPT scheduled task researches current official sources and writes structured content to `data/insights-auto.json` through the connected GitHub repository.
- Student feed merges database posts and the static automated JSON feed.
- Vercel deploys the GitHub update normally.
- Listen uses browser SpeechSynthesis, so no text-to-speech API cost.

## Content
Categories: Study Abroad, IELTS, PTE.
Bangla is primary. English is included when generated.
Search, Featured, NEW labels and bilingual article reading are supported.

## Automatic publishing safety
The scheduled task must:
1. Prefer official government, immigration, university and official IELTS/PTE provider sources.
2. Verify the material claim against the primary source.
3. Reject rumors, social posts, agent blogs and unverified claims.
4. Avoid duplicates already present in the JSON file.
5. Write for Bangladeshi students and preserve the official source URL.
6. Keep at most the latest 100 automated posts in the JSON file.

## Existing environment variables
Only the variables already used by the current site are needed for manual publishing:
- DATABASE_URL (or an already supported Postgres alias)
- ADMIN_PASSWORD
- ADMIN_TOKEN

## URLs
- /insights.html
- /article.html?slug=...
- /admin-insights.html

## Note
This zero-cost mode relies on the user's existing ChatGPT scheduled-task access and connected GitHub account rather than a separately billed API.
