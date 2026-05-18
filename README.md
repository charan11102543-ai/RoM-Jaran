# AI Automation Hustle - Lead Qualification & Booking System

Production-ready SaaS MVP built with `Next.js App Router`, `Prisma + PostgreSQL`, `NextAuth credentials`, `OpenAI`, and `n8n-compatible webhooks`.

## Business Model

Agency offering: **Setup 15,000 THB + Retainer 6,000–15,000 THB/month** for Thai clinics (dental, med spa, aesthetic).

Three retainer packages: **Starter / Growth / Scale** — see [SYSTEM_BLUEPRINT_PHASE1.md](SYSTEM_BLUEPRINT_PHASE1.md) for full breakdown.

Sales flow:
1. Prospect visits `/` (landing) → `/pricing` → submits `/intake` form
2. `/api/intake` saves Lead + fires `ADMIN_NOTIFY_WEBHOOK_URL` (Slack/Discord)
3. Agency schedules demo call → quote → Stripe Payment Link (setup)
4. Onboard new client per [docs/CLIENT_DEPLOYMENT.md](docs/CLIENT_DEPLOYMENT.md) — 1 day per client

## Folder structure

```text
app/
  api/
  book/[leadId]/
  chat/
  dashboard/
  login/
components/
  booking/
  chat/
  dashboard/
  ui/
lib/
prisma/
tests/
types/
```

## Core features

- AI chat captures and qualifies leads from a conversational UI.
- Structured JSON extraction stores `name`, `service`, `budget`, and `datetime`.
- Qualified leads book time slots with double-booking protection.
- Lead creation and booking events can trigger n8n webhooks.
- Admin dashboard includes lead table, bookings table, pipeline board, and conversion metrics.

## Environment variables

Copy `.env.example` to `.env` and set:

- `DATABASE_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `WEBHOOK_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `QUALIFICATION_BUDGET_THRESHOLD`
- `BOOKING_SLOT_MINUTES`
- `BUSINESS_HOURS_START`
- `BUSINESS_HOURS_END`
- `BUSINESS_TIMEZONE`
- `BUSINESS_DAYS`
- `BOOKING_WINDOW_DAYS`

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start PostgreSQL locally:

   ```bash
   docker compose up -d postgres
   ```

3. Generate Prisma client:

   ```bash
   pnpm prisma:generate
   ```

4. Run the initial migration:

   ```bash
   pnpm prisma:migrate --name init
   ```

5. Seed the admin user:

   ```bash
   pnpm db:seed
   ```

6. Start the app:

   ```bash
   pnpm dev
   ```

7. Run tests:

   ```bash
   pnpm test
   ```

## Local URLs

- Landing (Thai sales): `http://localhost:3000`
- Pricing: `http://localhost:3000/pricing`
- Agency intake form: `http://localhost:3000/intake`
- Patient demo chat: `http://localhost:3000/chat`
- Admin login: `http://localhost:3000/login`
- Dashboard: `http://localhost:3000/dashboard`
- Command Center (Kanban): `http://localhost:3000/dashboard/command-center`

## Example API calls

Create a lead manually:

```bash
curl -X POST http://localhost:3000/api/lead \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Jamie\",\"service\":\"AI lead intake automation\",\"budget\":2500}"
```

Send a chat message:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"sessionToken\":\"local-demo-session-12345\",\"message\":\"Hi, I'm Jamie. I need AI lead intake automation with a budget of 2500 dollars next week.\"}"
```

Get available slots:

```bash
curl http://localhost:3000/api/slots
```

Create a booking:

```bash
curl -X POST http://localhost:3000/api/booking \
  -H "Content-Type: application/json" \
  -d "{\"leadId\":\"REPLACE_WITH_LEAD_ID\",\"datetime\":\"2026-05-05T02:00:00.000Z\"}"
```

## Deployment notes

- Works well on Vercel, Railway, Render, or any Node-compatible platform.
- Provision PostgreSQL first, then set `DATABASE_URL`.
- Seed the admin user after the first deployment.
- Keep `NEXTAUTH_URL` aligned with the deployed domain.
