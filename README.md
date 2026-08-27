## UDS Events Module (Starter)

This app is the initial implementation for the UDS multi-community Events module.
It currently includes:

- Next.js App Router project setup
- Public community event listing pages
- Event details and slot visibility
- Token-based manage-registration page
- API route scaffolds aligned with the module spec
- Admin API and dashboard placeholders

## Local Development

Run the app:

```bash
npm run dev
```

Open http://localhost:3000.

## Database Setup (PostgreSQL + Prisma)

1. Create a local `.env` file from `.env.example` and update `DATABASE_URL`.
2. Generate Prisma client:

```bash
npm run db:generate
```

3. Apply schema to your database:

```bash
npm run db:push
```

4. Seed sample data:

```bash
npm run db:seed
```

Seed output includes demo token `sample-manage-token` for `/registrations/manage/:token`.

## Key Routes

- `/` - UDS starter landing page
- `/c/uds/events` - UDS published events
- `/c/catchball/events` - Catchball published events
- `/admin/events` - Admin dashboard placeholder
- `/registrations/manage/:token` - Token-based registration management

## API Routes (Current)

- `GET /api/communities/:slug/events`
- `GET /api/events/:eventId`
- `GET /api/events/:eventId/slots`
- `POST /api/events/:eventId/registrations`
- `GET|PATCH|DELETE /api/registrations/manage/:token`
- Admin route stubs under `/api/admin/*`

## Next Build Steps

- Add persistent database (Prisma + PostgreSQL recommended)
- Add admin authentication and authorization
- Add email notifications for confirmation/update/reminder flows
- Implement transactional concurrency controls for slot capacity
- Replace in-memory mock store with service and repository layers

## Source Spec

See [docs/events-module-spec.md](docs/events-module-spec.md).

## Google VM Database Path

If you want Google-only hosting with low initial cost, follow:

- [docs/google-e2-micro-postgres.md](docs/google-e2-micro-postgres.md)

