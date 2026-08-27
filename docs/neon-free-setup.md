# Neon Free PostgreSQL Setup (Recommended)

This is the easiest no-cost way to run the UDS app database with the current Prisma setup.

## 1) Create a free Neon project

1. Open https://console.neon.tech
2. Sign up / log in.
3. Create a new project (region closest to your users).
4. Create a database named `uds_events` (or use default and rename later).

## 2) Copy connection string

From Neon dashboard, copy the Prisma/Postgres connection string.
It should look similar to:

```env
postgresql://USER:PASSWORD@HOST/uds_events?sslmode=require&channel_binding=require
```

## 3) Configure local environment

In the app root, create `.env` from `.env.example` and set `DATABASE_URL` to your Neon URL.

## 4) Initialize schema and seed

Run:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

## 5) Start app

```bash
npm run dev
```

Open http://localhost:3000

## 6) Verify working pages

- `/c/uds/events`
- `/admin/events`
- `/registrations/manage/sample-manage-token`

## Troubleshooting

1. `Environment variable not found: DATABASE_URL`
- Ensure `.env` exists in the app root and includes `DATABASE_URL`.

2. SSL connection errors
- Ensure `sslmode=require` is present in connection string.

3. Prisma schema mismatch
- Re-run:
  - `npm run db:generate`
  - `npm run db:push`

## Cost note

Neon free tier limits can change over time. If you outgrow free limits, you can upgrade Neon plan or migrate later to Cloud SQL with minimal app changes (same Prisma model).
