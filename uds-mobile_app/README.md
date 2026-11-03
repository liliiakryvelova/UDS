# UDS Events Mobile

A separate, installable iPhone-first Progressive Web App for discovering UDS volunteer events, registering for shifts, managing registration links, and using admin event tools. It uses the existing UDS Events backend; this workspace does not own or seed event data.

## Run locally

1. Install the dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` if you need to change the backend origin. The default is the production UDS Events site.
3. Start the development server with `npm run dev` and open the local URL printed by Next.js. If the original UDS app already occupies port 3000, Next.js may select another port.
4. Run `npm run lint` and `npm run build` to validate changes.

## Install on iPhone

Deploy this app to an HTTPS origin. On iPhone, open that origin in Safari, tap Share, choose **Add to Home Screen**, and confirm. The app opens in standalone mode. The install button shows the iOS steps; supported browsers may offer a native install prompt.

The web manifest, generated Apple touch icon, service worker, offline page, safe-area layout, and cached public event listing support installation and a basic offline shell. Registration and admin actions require a network connection. User registration manage tokens are stored only in the browser's local storage on that device; keep the email confirmation as a recovery path.

## Existing backend integration

The same-origin `/api/uds/*` proxy forwards an allowlist of API routes to `UDS_API_BASE_URL`. This avoids browser CORS restrictions and relays the existing `HttpOnly` admin/user session cookies through the PWA origin. Unsafe proxy requests reject foreign browser origins. Do not expose backend credentials or private environment values in `NEXT_PUBLIC_*` variables.

Local development is read-only by default, even though public event data is read from production. To test writes, point the proxy at an authorized staging backend and explicitly set `UDS_ALLOW_API_WRITES=true` in `.env.local`. On a production PWA deployment, writes are enabled and admin/signup actions update the configured backend.

The current backend supports public event listing/details, shift lookup, signup, token-based registration view/edit/cancel, admin login, event CRUD/actions, and admin registration management. Search and event-type filters run locally against the upcoming public list.

### Known backend limitations

- The volunteer account API has no endpoint to list a signed-in volunteer's registrations. **My passes** therefore tracks registrations created in this PWA using their secure manage links; it is device-local, not an account-wide list.
- Volunteer account sign-in and account-wide registration lists are not wired into this PWA. Signup-generated manage links power My passes instead; admin login is available.
- Admin login is form/redirect oriented; the proxy adapts that redirect into a response for the mobile UI while preserving the host-only session cookie.
- Create, cancel, registration list, reminder, and removal actions are available in the PWA. Detailed editing opens the existing UDS admin site (which requires a separate sign-in); this avoids a legacy update endpoint that can reset a shift date.
- The existing public event detail API does not itself enforce published status. The app only opens IDs returned by the public upcoming/published community listing.
- Event creation needs a community ID. The admin form uses an existing admin event's community ID when available; set `NEXT_PUBLIC_UDS_COMMUNITY_ID` for an empty community with no current events.
- The PWA is a distinct deployment. Configure `UDS_API_BASE_URL` on the server to an authorized UDS API origin; use a staging origin for testing. User-submitted event edits and admin actions affect that backend immediately.

## Project scripts

- `npm run dev` — start development server
- `npm run lint` — run ESLint
- `npm run build` — create a production build
- `npm run start` — serve the production build

## Security and data

Do not put secrets in client-exposed environment variables, commit local environment files, or run database migrations/seeds from this mobile workspace. Admin operations use the existing UDS admin session and database. Review the existing backend's event visibility and registration enforcement before inviting broad public use.
