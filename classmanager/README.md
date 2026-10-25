# LizOn Class Manager (pilot)

A **mobile first, installable Progressive Web App (PWA)** at /classmanager/ for LizOn Education internal institute operations.

## In the initial pilot

- Student directory with enrollments, course fees, and deadlines.
- Recurring weekly and one-time classes, instructor overlap warnings, and per-day attendance.
- Course progress per student and course.
- Payment ledger, outstanding dues, print-friendly payment receipts.
- Monthly reports and CSV, JSON backup and import.
- Fictional demo data on demand, never populated automatically.
- Home Screen installation via HTTPS, offline app shell.

## SECURITY IMPORTANT

**This is a LOCAL DEVICE ONLY PILOT. Do not use actual student or payment information until backend authentication, role-based authorization, encrypted transport, audit trails, backup strategy and synchronized database are implemented and tested.** The public website repo contains only program code and fictional demo data, not private records. Browser localStorage is not a multi-user secured data store and can be cleared by browser settings. There is **no login** and **no shared staff sync** yet.

### For full internal production use

1. Add cloud database with per-organization/role access rules (e.g. Firebase Auth + Firestore free-tier subject to usage and policy).
2. Create Admin, Counselor, Teacher, Accounts permissions.
3. Add server-authoritative audit logs and backup/recovery.
4. Test privacy, PWA icon resolution, sync and permissions on Android/iOS.
5. Deploy to a protected dedicated staff subdomain after review.

To install on a mobile phone, open the hosted page in Chrome (Android) or Safari (iOS), and choose Add to Home Screen/Install.

No changes were made to existing public website pages.