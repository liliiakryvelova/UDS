# Events Module Specification (UDS + Catchball Community)

Date: 2026-08-26
Status: Draft proposal for implementation

## 1) Product Goal
Build a reusable Events module for multiple communities (starting with UDS and Catchball Community) with:
- Admin event management (full CRUD and registration controls)
- Public event discovery and registration
- Multi-day shift and role scheduling
- Registration management without passwords via secure personal links

This module replaces brittle form automation with a centralized, scalable system.

## 2) Scope

### V1 (Must Have)
- Communities management (basic): UDS, Catchball Community, extensible to more
- Event CRUD (create, edit, duplicate, delete)
- Multi-day event support
- Shift and role modeling independent from event header
- Registration flow: create, update, cancel
- Capacity enforcement per shift-role slot
- Participant list view and CSV export for admins
- Event state controls: Draft, Published, Registration Closed, Cancelled, Completed
- Email confirmations and reminder emails
- Personalized manage-registration link for each registrant (no password required)

### V2 (Deferred)
- Waitlist
- Team registration
- Payments
- Check-in
- Expanded analytics and attendance reporting

## 3) Roles and Permissions

### Admin
Can:
- Create/edit/duplicate/delete events
- Add/edit/delete shifts and roles
- Set required participant counts
- View/filter/export participant list
- Close registration
- Cancel event

### User (Public Registrant)
Can:
- View upcoming published events
- Open event details
- Select shift and role
- Register
- Update or cancel registration through personal link
- Receive confirmation and reminder emails

## 4) Core Information Architecture
Main sections:
- Upcoming Events (public listing)
- Event Details and Sign Up
- My Registrations (optional in V1 if using email-link-only access)
- Admin Dashboard
- Manage Events
- Registrations and Participants
- Communities

## 5) Domain Model

### Community
- id
- name (for example UDS, Catchball Community)
- slug (for separate links)
- status (active/inactive)
- branding fields (optional, later)

### Event
General Information:
- id
- community_id
- name
- short_description
- full_description
- event_type (tournament, practice, festival, volunteer, workshop)
- cover_image_url
- status (draft, published, registration_closed, cancelled, completed)

Date and Time:
- start_date
- end_date
- timezone
- registration_deadline

Location:
- venue_name
- full_address
- meeting_point
- google_maps_link
- online_event_link

Registration Settings:
- registration_capacity_mode (per_event or per_shift_role; V1 uses per_shift_role authoritative)
- allow_guest_registration (boolean)
- allow_team_registration (boolean, default false in V1 UI)
- min_age
- max_age
- skill_level_policy (none, optional, required)
- price_type (free, paid)
- price_amount (nullable, V2 if payments are added)
- special_instructions

Contacts:
- organizer_name
- organizer_email
- organizer_phone
- emergency_contact_name
- emergency_contact_phone

Operational:
- published_at
- cancelled_at
- completed_at
- created_by
- updated_by
- created_at
- updated_at

### ShiftRoleSlot
Represents a specific date+time+role block under an event.
- id
- event_id
- slot_date
- start_time
- end_time
- role_name
- people_needed
- people_registered (derived, not manually edited)
- meeting_point
- instructions
- is_active
- created_at
- updated_at

Notes:
- Store slot_date separately from event start/end to support true multi-day scheduling.
- Capacity should be enforced against people_needed.

### Registration
- id
- event_id
- slot_id
- community_id

Registrant fields:
- full_name
- email
- phone
- team_name (nullable, V2 use-case)
- skill_level (nullable)
- emergency_contact
- notes
- consent_waiver_accepted (boolean)

State:
- status (confirmed, waitlisted, cancelled, checked_in)
- cancelled_at
- cancellation_reason (optional)

Access:
- manage_token_hash
- manage_token_expires_at (optional)

Audit:
- created_at
- updated_at
- created_ip
- updated_ip

## 6) Status Logic

Event status rules:
- Draft: visible to admins only
- Published: visible publicly, registration open if deadline not passed and not manually closed
- Registration Closed: visible publicly, no new registrations
- Cancelled: visible with cancellation banner, no registration
- Completed: archived/completed state

Registration status rules:
- Confirmed: slot has capacity
- Waitlisted: V2 only when waitlist enabled and slot full
- Cancelled: user/admin cancellation
- Checked In: V2 onsite flow

## 7) URL and Multi-Community Routing
Use community slugs for separate links:
- /c/uds/events
- /c/catchball/events

Event URLs:
- /c/{communitySlug}/events/{eventSlugOrId}

Manage link URL:
- /registrations/manage/{token}

Recommendation:
- Token is random, single-purpose, high entropy
- Store only token hash in database
- Rotate token after sensitive updates if needed

## 8) API Surface (REST proposal)

Public:
- GET /api/communities/{slug}/events?status=published&upcoming=true
- GET /api/events/{eventId}
- GET /api/events/{eventId}/slots
- POST /api/events/{eventId}/registrations
- GET /api/registrations/manage/{token}
- PATCH /api/registrations/manage/{token}
- DELETE /api/registrations/manage/{token}

Admin:
- POST /api/admin/events
- GET /api/admin/events
- GET /api/admin/events/{eventId}
- PATCH /api/admin/events/{eventId}
- DELETE /api/admin/events/{eventId}
- POST /api/admin/events/{eventId}/duplicate

- POST /api/admin/events/{eventId}/slots
- PATCH /api/admin/slots/{slotId}
- DELETE /api/admin/slots/{slotId}

- GET /api/admin/events/{eventId}/registrations
- GET /api/admin/events/{eventId}/registrations/export.csv

- POST /api/admin/events/{eventId}/close-registration
- POST /api/admin/events/{eventId}/cancel

## 9) Capacity and Concurrency Controls
To prevent overbooking:
- Capacity is enforced at ShiftRoleSlot level
- Registration insert should run in transaction
- Lock slot row during count/update operation
- Reject registration when confirmed count >= people_needed

Recommended DB strategy:
- Use atomic transaction with SELECT FOR UPDATE on slot row
- Derive confirmed count via query or maintain a safe counter updated transactionally

## 10) Email Notifications

V1 templates:
- Registration confirmation
- Registration updated
- Registration cancelled
- Event reminder (for confirmed registrants)
- Event cancelled notice

Email fields include:
- Event name
- Date/time/role
- Venue/meeting point
- Manage registration link

Reminder schedule example:
- 48 hours before slot start
- 4 hours before slot start

## 11) Admin UI Requirements

Manage Events table:
- Filters: community, status, date range, event type
- Actions: create, duplicate, edit, publish/unpublish, close registration, cancel

Event editor:
- General info tab
- Date/time tab
- Location tab
- Registration settings tab
- Contacts tab
- Shifts and roles tab (grid editor)

Registrations view:
- Filter by slot, role, status
- Search by name/email/phone
- CSV export

## 12) Public UI Requirements

Upcoming Events page:
- Community-scoped event cards
- Date badges, event type, short description
- Capacity indicator (optional in V1)

Event Details page:
- Full event info
- Shift-role availability list
- Registration form

Manage Registration page:
- Load by secure token
- Allow editing slot/role and profile fields
- Allow cancellation

## 13) Validation Rules (V1)
- event_name required, max length
- start_date <= end_date
- registration_deadline <= event start
- slot_date between event start_date and end_date
- slot start_time < end_time
- people_needed >= 1
- consent_waiver_accepted required for registration
- valid email and phone format

## 14) Suggested Database Tables (SQL-oriented)
- communities
- events
- event_slots
- registrations
- admin_users (if not already present in platform auth)
- audit_logs (optional but recommended)

Indexes:
- events (community_id, status, start_date)
- event_slots (event_id, slot_date)
- registrations (event_id, slot_id, status)
- registrations (email)
- communities (slug unique)

Constraints:
- foreign keys with cascade rules where appropriate
- unique optional constraint to prevent duplicate active registration by same email per slot

## 15) Security and Privacy
- Manage link token is long random secret, hashed at rest
- Rate-limit manage and registration endpoints
- Add bot protection on public registration form (captcha or honeypot)
- Log admin actions for event state changes and deletions
- Minimize PII exposure in admin exports

## 16) Implementation Plan

Phase 1 (V1 MVP)
1. Data model + migrations
2. Admin event CRUD + slots editor
3. Public event listing/details
4. Registration create/update/cancel with token links
5. Capacity enforcement and concurrency safeguards
6. Email confirmations + reminders
7. CSV export for admins

Phase 2
1. Waitlist
2. Team registration
3. Payments
4. Check-in
5. Enhanced analytics/reporting

## 17) Acceptance Criteria for V1
- Admin can create a 2-day event with multiple shift-role slots
- Public user can register for a specific slot and role
- Capacity limit blocks overbooking reliably
- User can modify or cancel registration from secure link
- Admin can export participant list as CSV
- Confirmation and reminder emails are delivered
- Separate public listing links work for each community slug

## 18) Open Decisions to Finalize Before Build
- Authentication provider for admin dashboard
- Final tech stack (framework, database, email provider)
- Whether public My Registrations page is included in V1 or delayed
- Token expiry policy for manage links
- Timezone display rules when user timezone differs from event timezone
