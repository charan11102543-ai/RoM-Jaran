import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });
  console.log("✓ Admin user seeded");
}

async function seedCommandCenter() {
  const existing = await prisma.agentRegistry.count();
  if (existing > 0) {
    console.log("⟳ Command center already seeded — skipping");
    return;
  }

  // ─── Agents ───────────────────────────────────────────────────────
  const [leadQual, contentAgent, emailAgent, n8nAgent, crmAgent] = await Promise.all([
    prisma.agentRegistry.create({
      data: {
        name: "Lead Qualifier Bot",
        type: "LEAD_QUALIFIER",
        environment: "LOCAL",
        description: "Processes incoming LINE/chat leads, scores them, routes to qualified or nurture path.",
        isActive: true,
      },
    }),
    prisma.agentRegistry.create({
      data: {
        name: "Content Automation Agent",
        type: "CONTENT_AUTOMATION",
        environment: "CLOUD",
        description: "Pulls ideas from Notion, generates LinkedIn + email + X content, sends to approval queue.",
        endpoint: "https://n8n.example.com/webhook/content-automation",
        isActive: true,
      },
    }),
    prisma.agentRegistry.create({
      data: {
        name: "Email Sequence Agent",
        type: "EMAIL_AUTOMATION",
        environment: "CLOUD",
        description: "Manages Brevo sequences: welcome, nurture, re-engagement, booking reminders.",
        endpoint: "https://n8n.example.com/webhook/email-automation",
        isActive: true,
      },
    }),
    prisma.agentRegistry.create({
      data: {
        name: "n8n Orchestrator",
        type: "N8N_ORCHESTRATOR",
        environment: "LOCAL",
        description: "Core workflow backbone — routes events, enforces SLAs, handles cost guardrails.",
        isActive: true,
      },
    }),
    prisma.agentRegistry.create({
      data: {
        name: "CRM & Analytics Agent",
        type: "CRM_MANAGER",
        environment: "LOCAL",
        description: "Maintains Supabase CRM state, generates KPI views, triggers dashboard updates.",
        isActive: true,
      },
    }),
  ]);
  console.log("✓ 5 agents registered");

  // ─── Spaces ───────────────────────────────────────────────────────
  const [leadSpace, contentSpace, opsSpace] = await Promise.all([
    prisma.space.create({
      data: {
        name: "Lead Pipeline",
        description: "Intake, qualification, and booking flows",
        color: "#0f766e",
        agents: { create: [{ agentId: leadQual.id }, { agentId: n8nAgent.id }, { agentId: crmAgent.id }] },
      },
    }),
    prisma.space.create({
      data: {
        name: "Content Engine",
        description: "Content generation and approval pipeline",
        color: "#7c3aed",
        agents: { create: [{ agentId: contentAgent.id }, { agentId: emailAgent.id }] },
      },
    }),
    prisma.space.create({
      data: {
        name: "Ops & Monitoring",
        description: "SLA alerts, cost guardrails, and error recovery",
        color: "#d97706",
        agents: { create: [{ agentId: n8nAgent.id }, { agentId: crmAgent.id }] },
      },
    }),
  ]);
  console.log("✓ 3 spaces created");

  // ─── Tasks ────────────────────────────────────────────────────────
  const now = new Date();

  await Promise.all([
    // Lead Pipeline tasks
    prisma.agentTask.create({
      data: {
        title: "Qualify LINE batch — May 16 morning",
        description: "Process 8 new leads from LINE OA received overnight. Extract fields, score, route.",
        status: "RUNNING",
        priority: "HIGH",
        agentId: leadQual.id,
        spaceId: leadSpace.id,
        startedAt: new Date(now.getTime() - 5 * 60 * 1000),
        logs: {
          create: [
            { level: "info", message: "Started processing 8 leads" },
            { level: "info", message: "Lead 1: scored 85 → QUALIFIED, Slack sent" },
            { level: "info", message: "Lead 2: scored 40 → NURTURE, added to Brevo" },
            { level: "info", message: "Lead 3: scored 90 → QUALIFIED, Cal.com link sent" },
          ],
        },
      },
    }),
    prisma.agentTask.create({
      data: {
        title: "Re-score cold leads from last week",
        description: "Run re-engagement scoring on 15 leads untouched for >7 days.",
        status: "QUEUED",
        priority: "NORMAL",
        agentId: leadQual.id,
        spaceId: leadSpace.id,
      },
    }),
    prisma.agentTask.create({
      data: {
        title: "CRM KPI sync — daily",
        description: "Refresh kpi_daily view, push metrics to dashboard.",
        status: "DONE",
        priority: "NORMAL",
        agentId: crmAgent.id,
        spaceId: leadSpace.id,
        startedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        completedAt: new Date(now.getTime() - 115 * 60 * 1000),
        output: { leads_processed: 23, qualified: 7, booked: 3 },
        logs: {
          create: [
            { level: "info", message: "KPI sync started" },
            { level: "info", message: "Refreshed kpi_daily view — 23 leads, 7 qualified, 3 booked" },
            { level: "info", message: "KPI sync completed in 42s" },
          ],
        },
      },
    }),

    // Content Engine tasks
    prisma.agentTask.create({
      data: {
        title: "Generate weekly content batch",
        description: "Pull 5 ideas from Notion, generate LinkedIn + email + X formats, queue for human approval.",
        status: "REVIEW",
        priority: "HIGH",
        agentId: contentAgent.id,
        spaceId: contentSpace.id,
        startedAt: new Date(now.getTime() - 30 * 60 * 1000),
        completedAt: new Date(now.getTime() - 10 * 60 * 1000),
        output: { ideas_processed: 5, drafts_created: 15, queued_for_approval: 15 },
        reviewNote: "",
        logs: {
          create: [
            { level: "info", message: "Fetched 5 ideas from Notion DB" },
            { level: "info", message: "Generated 3 formats × 5 ideas = 15 drafts" },
            { level: "info", message: "QA: all drafts passed length and keyword checks" },
            { level: "info", message: "Sent approval request to Telegram" },
          ],
        },
      },
    }),
    prisma.agentTask.create({
      data: {
        title: "Nurture email sequence — batch 3",
        description: "Send Day-5 email to 12 leads in nurture path.",
        status: "BLOCKED",
        priority: "HIGH",
        agentId: emailAgent.id,
        spaceId: contentSpace.id,
        errorMsg: "Brevo API rate limit hit (400 req/hr). Retry window opens at 14:00 UTC.",
        logs: {
          create: [
            { level: "info", message: "Started Day-5 email batch for 12 leads" },
            { level: "warn", message: "Brevo rate limit approaching (380/400)" },
            { level: "error", message: "Rate limit exceeded — task blocked until 14:00 UTC" },
          ],
        },
      },
    }),
    prisma.agentTask.create({
      data: {
        title: "Publish approved LinkedIn posts",
        description: "Post 3 approved drafts to LinkedIn via UGC API.",
        status: "QUEUED",
        priority: "NORMAL",
        agentId: contentAgent.id,
        spaceId: contentSpace.id,
      },
    }),

    // Ops tasks
    prisma.agentTask.create({
      data: {
        title: "SLA alert: lead response > 10 min",
        description: "One uncontacted qualified lead detected. Escalate to sales manager.",
        status: "FAILED",
        priority: "URGENT",
        agentId: n8nAgent.id,
        spaceId: opsSpace.id,
        errorMsg: "Slack webhook returned 503. Alert not delivered.",
        startedAt: new Date(now.getTime() - 60 * 60 * 1000),
        completedAt: new Date(now.getTime() - 58 * 60 * 1000),
        logs: {
          create: [
            { level: "warn", message: "Lead cly123 qualified 12min ago with no contact" },
            { level: "error", message: "Slack webhook POST failed: 503 Service Unavailable" },
            { level: "error", message: "Retry 1/3 failed" },
            { level: "error", message: "Retry 2/3 failed — task marked FAILED" },
          ],
        },
      },
    }),
    prisma.agentTask.create({
      data: {
        title: "OpenAI cost guardrail check",
        description: "Daily check: verify OpenAI spend is within $5/day budget. Downgrade model if over.",
        status: "DONE",
        priority: "NORMAL",
        agentId: n8nAgent.id,
        spaceId: opsSpace.id,
        startedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        completedAt: new Date(now.getTime() - 170 * 60 * 1000),
        output: { spend_usd: 1.24, budget_usd: 5.0, status: "within_budget", model: "gpt-4o-mini" },
        logs: {
          create: [
            { level: "info", message: "Daily cost check: $1.24 / $5.00 budget — OK" },
            { level: "info", message: "Model remains gpt-4o-mini — no downgrade needed" },
          ],
        },
      },
    }),
  ]);
  console.log("✓ 8 demo tasks created with logs");
}

async function main() {
  await seedAdmin();
  await seedCommandCenter();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
