# UDS Events Mobile PWA — Setup checklist

- [x] Clarify project requirements: installable iPhone PWA; reuse the production UDS Events backend; include public event discovery, signup, registration self-service, and admin workflows.
- [x] Scaffold standalone Next.js + TypeScript + Tailwind app in this directory.
- [x] Customize for UDS: mobile-first UI, PWA manifest/offline shell, and a same-origin API proxy for https://events.ukrainedefensesupport.org.
- [x] Install required project dependencies (scaffold defaults only; no additional packages).
- [x] Build and resolve diagnostics (production build and lint pass).
- [x] No extra VS Code task needed; npm scripts cover development/build/lint.
- [ ] Launch only after confirming with the user.
- [x] Update README and finalize this checklist.

## Integration constraints verified in the existing UDS app

- Public event list/detail and signup routes exist. Signup is JSON; token-based registration management supports GET/PATCH/DELETE.
- Volunteer accounts use host-only HttpOnly session cookies; there is no REST endpoint to list a user's registrations.
- Admin APIs use a host-only HttpOnly admin cookie. The existing site has no CORS support; the PWA uses a same-origin server-side proxy rather than direct cross-origin calls.
- Keep API base URL configurable. Do not write to, migrate, or seed production data during app setup. Admin writes are only performed on explicit user actions in the app.
- Production public event detail lookup does not enforce published status, while the community listing does; only navigate to event IDs supplied by that public listing.
