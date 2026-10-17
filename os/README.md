# LizOn OS pilot

A no-new-subscription admissions CRM prototype in the existing MyLizOn repository, with a privacy friendly FAQ guide.

## What is implemented

- /os/ staff only, authenticated through the existing Supabase /portal login.
- Lead creation for IELTS, PTE, Study Abroad, Spoken English, and other inquiries.
- Lead list with name/phone/country/course search; pipeline status and priority.
- Assigned counselor (manager role), next follow up date, activity notes.
- Enrolment status and basic fee totals/payments (managers only).
- Filter due follow ups, count leads and aggregate recorded payments, export currently visible leads to CSV.
- No automatic outreach, no WhatsApp API, no paid generative AI.
- A clearly labelled deterministic Quick Guide on the homepage and the IELTS, PTE and Study Abroad pages using approved links. It stores or transmits no question data.

## Required setup before the CRM can be used

1. Review `os/schema.sql` and apply it using the **existing** Supabase project's SQL Editor. This has **NOT been run**. No tables or permissions were changed on your live database by the GitHub PR.
2. Confirm the existing `profiles` table has `id` matching Supabase Auth user UUID, an active `status`, and a supported `role` (admin, super_admin, manager, admissions, admission, or counselor). Staff must not share accounts. A role mismatch will deny access.
3. Verify the database policies using an admin test account, a counselor test account, a student account, and an unauthenticated browser before adding actual student contact details.
4. In the branch preview, visit `/os/`. Use the portal login at `/portal/login.html` first. New leads are manually entered during the pilot.
5. Review mobile layouts, save/update/activity/CSV behaviors, and only then merge or deploy.

## Explicitly NOT complete

- Existing `assessment.html` still posts to its Google Apps Script flow. It has NOT been connected to CRM because public submissions need a secure server side endpoint, anti spam controls, consent and deduplication. Do not put a service role key in public JavaScript.
- The Quick Guide is **not** an LLM. It handles common questions without an AI API. Human counselors confirm current prices, country requirements, eligibility and visas.
- Facebook, Instagram, and WhatsApp inbound/outbound integrations are deferred.
- No recurring background reminders or push notifications. Due dates appear only when staff open the dashboard.
- No real invoice ledger or reconciliation. Reported recorded payment values are simple per lead fields, not a verified accounting system.
- This pilot lists the 500 most recent **authorized visible** leads, not a full report for a large organization.
- This is a code proposal on an isolated branch, **not a live production release**.

## Security notes

Student PII remains in Supabase only, behind authentication, database row level policies and staff role verification. The public FAQ does not request names or phone numbers. CRM CSV exports are sensitive and must be shared securely. Staff accounts should use MFA if available.

Review policies whenever existing profile roles, status values or Supabase policies change. No service role keys or private API keys belong in source control.

## Release plan

1. Test schema against existing portal roles.
2. Test CRM with dummy records and remove those records through an admin only database maintenance procedure.
3. Validate HTTPS hosting policy and applicable vendor usage terms for commercial use.
4. Deploy the branch after approval.
5. Only afterwards, separately design secure ingestion from website assessment and consider metered third party channels.
