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

## Gemini real-time preview connection (October 17)
- Real-time response streaming was implemented using Gemini's `streamGenerateContent?alt=sse` and server-mediated SSE to the browser. Words can appear progressively, while source links arrive after the response.
- The Vercel project now has branch-scoped encrypted preview variables `LIZON_ASSISTANT_AI=enabled` and `LIZON_ASSISTANT_MODEL=gemini-3.1-flash-lite`.
- **Outstanding**: `GEMINI_API_KEY` is **not** configured in Vercel. The news automation's key exists as a GitHub Actions secret, which GitHub correctly does not let us read or transfer automatically through the available connector. The preview therefore continues using its local conversation guide, and is **not** yet connected to a Gemini API.
- One authorized account owner must add an API key in Vercel Project Settings → Environment Variables. Name: `GEMINI_API_KEY`, type: Sensitive or Encrypted, target: Preview, branch: `lizon-os-mvp-20261017`. Then redeploy the branch and test.
- To honor no-new-costs, confirm the Google AI project is **Free** and not linked to paid billing before using the key; a model with a free tier can still be billed when a paid-tier project key is used. A separate free-tier Google AI Studio project is safer than sharing the news workflow's quota.
- Gemini free-tier prompts may be used by Google to improve products. The browser displays a warning not to share private data, and the server blocks common contact numbers, email addresses and identification/banking indicators from being sent to Gemini. These filters are not an absolute guarantee, so do not request private records in this phase.
- Serverless in-memory rate limits are only best effort. Before public production, add an account-level rate-limit budget or durable quota guard and confirm cost controls.

### Verification performed
- Both JavaScript modules pass syntax checks.
- A mocked Gemini SSE response produced multiple streamed delta events and a completed message on the server.
- Public preview deployed successfully. Real Gemini API end-to-end verification is **not possible until the Vercel key is configured**.
