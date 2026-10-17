# LizOn Assistant: message-first pilot

## How to preview
Open the preview deployment for branch `lizon-os-mvp-20261017`; click **Ask LizOn** in the bottom right. Preview deployments may ask for Vercel team sign-in. The live site is unchanged.

## Available controls
- Messenger-style floating launcher and LizOn brand header.
- Free-text questions in Bangla, English and Banglish, with basic typo-tolerant retrieval.
- Suggested questions for IELTS, PTE, Study Abroad, and teachers, without restricting what users can type.
- Website snippets with directly clickable page links; working links are allowlisted to the LizOn public site and official wa.me numbers.
- Follow-up conversation context and tab-local history (no student profiles recorded).
- Clear history, typing indicator, send on Enter / newline on Shift+Enter.
- User-initiated contact with a human team member, without automated WhatsApp messages.
- Mobile chat panel.

## Information sources
The assistant uses `/data/lizon-knowledge.json`, a public-only document index bundled with each deployment. For this **preview**, it contains starter excerpts from 12 important site pages, including IELTS/PTE, Joy Sir, study abroad and selected countries.

The GitHub Action at `.github/workflows/lizon-knowledge.yml` is intended to refresh the index automatically when a public HTML page or supported editorial JSON is changed on `main`. It must be enabled and **verified after merge**; it hasn't run on `main` yet. New teacher profiles written in *public HTML* become searchable after index regeneration and redeployment. Pages generated only at runtime, files in private portals, or dynamic DB data are **not** indexed by this version.

## AI distinction and cost
The preview currently uses **grounded retrieval**, not an active generative AI model. It can route questions, handle some misspellings and quote content with links, but not reliably answer every Banglish question or carry out open-ended reasoning. Backend optional Gemini support exists but is **off** because there is no `GEMINI_API_KEY` in the website's Vercel environment and `LIZON_ASSISTANT_AI` is not enabled. This is deliberate to avoid unexpected paid API usage. We should only activate a verified free-tier model with spending safeguards after approval.

## Manual verification checklist before production
- Test desktop and Android/iPhone layouts.
- Test Bangla (including combining marks), Banglish spelling variations, English and short follow-ups.
- Test unknown names: the assistant must admit when it cannot verify a fact.
- Validate `/api/lizon-assistant` with 404/429 errors, 12 real example queries and security cases. The API handler has been exercised with mocked requests; a full production-like browser session has not yet been tested.
- Review accessibility, safe link handling, public/private content boundaries and uptime.
- Confirm knowledge workflow indexes a newly added public teacher page after main deployment.
- Check Vercel/hosting eligibility for business use.

No paid API, CRM database migration, or production website merge has been performed.
