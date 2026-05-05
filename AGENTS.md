<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-overview -->
# AI Automation Hustle - Lead Qualification & Booking SaaS

This is a Next.js 16 App Router project with Prisma + PostgreSQL, NextAuth credentials, OpenAI integration, and n8n webhooks. It captures leads via AI chat, qualifies them, and allows booking of time slots.

Key features: AI-powered lead qualification, booking system with double-booking protection, admin dashboard with metrics and pipeline board.
<!-- END:project-overview -->

<!-- BEGIN:build-test-commands -->
# Build & Test Commands

- `pnpm dev`: Start development server (localhost:3000)
- `pnpm build`: Production build
- `pnpm start`: Run production server
- `pnpm lint`: ESLint check
- `pnpm test`: Run tests (Vitest)
- `pnpm test:watch`: Watch mode tests
- `pnpm test:coverage`: Tests with coverage
- `pnpm prisma:generate`: Generate Prisma client
- `pnpm prisma:migrate`: Run migrations
- `pnpm prisma:studio`: Open Prisma UI (localhost:5555)
- `pnpm db:seed`: Seed admin user
- `docker compose up -d postgres`: Start PostgreSQL container
<!-- END:build-test-commands -->

<!-- BEGIN:architecture-decisions -->
# Architecture Decisions

- **App Router**: Uses Next.js 16 App Router with server/client components. Server components for data fetching, client for interactivity.
- **Database**: Prisma with PostgreSQL adapter. Global singleton to prevent connection pool issues.
- **Auth**: NextAuth v4 with credentials provider for admin login.
- **AI**: OpenAI gpt-4o-mini for lead extraction from chat.
- **Styling**: Tailwind CSS v4 with CVA for component variants, custom CSS variables.
- **Timezones**: All business logic uses BUSINESS_TIMEZONE (Asia/Bangkok by default). Use date-fns-tz for calculations.
- **Validation**: Zod for environment variables and API inputs.
- **Testing**: Vitest with coverage.
<!-- END:architecture-decisions -->

<!-- BEGIN:conventions -->
# Project Conventions

- **Components**: Server by default, "use client" only when needed (forms, localStorage).
- **API Routes**: Async handlers, use Prisma for DB operations.
- **Environment**: All config via env vars, validated with Zod.
- **Styling**: Use `cn()` utility for class merging (clsx + tailwind-merge).
- **Dynamic Rendering**: Dashboard pages use `export const dynamic = "force-dynamic"` for fresh data.
- **Imports**: Absolute paths with @/ alias.
- **Naming**: Kebab-case for files, PascalCase for components.
<!-- END:conventions -->

<!-- BEGIN:pitfalls -->
# Potential Pitfalls

- Many API routes are missing implementations - check [README.md](README.md) for setup.
- Next.js 16 has breaking changes - always check `node_modules/next/dist/docs/`.
- Timezone handling is critical - use date-fns-tz, not native Date.
- Prisma global singleton required to avoid connection issues.
- Force-dynamic may impact performance - consider ISR where possible.
- React Compiler enabled - ensure code is compatible.
<!-- END:pitfalls -->

<!-- BEGIN:key-files -->
# Key Files & Directories

- [README.md](README.md): Setup instructions and feature overview.
- [package.json](package.json): Dependencies and scripts.
- [prisma/schema.prisma](prisma/schema.prisma): Database schema.
- [.env.example](.env.example): Required environment variables.
- [app/layout.tsx](app/layout.tsx): Root layout and metadata.
- [components/ui/button.tsx](components/ui/button.tsx): Example of CVA component pattern.
- [components/chat/chat-shell.tsx](components/chat/chat-shell.tsx): Chat UI logic.
- [lib/](lib/): Utility functions (auth, utils - some missing).
- [app/api/](app/api/): API routes (many need implementation).
<!-- END:key-files -->
