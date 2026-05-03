import Link from "next/link";
import { ArrowRight, Bot, CalendarClock, Database, Webhook } from "lucide-react";
import { Brand } from "@/components/brand";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: <Bot className="h-5 w-5" />,
    title: "AI chat qualification",
    description: "Collect name, service, budget, and preferred time through a real conversation.",
  },
  {
    icon: <CalendarClock className="h-5 w-5" />,
    title: "Booking with collision protection",
    description: "Generate live slots from business hours and block exact double bookings.",
  },
  {
    icon: <Webhook className="h-5 w-5" />,
    title: "n8n-ready webhook automation",
    description: "Push every created lead into downstream workflows immediately.",
  },
  {
    icon: <Database className="h-5 w-5" />,
    title: "Admin visibility",
    description: "Track leads, bookings, pipeline stages, and conversion from one dashboard.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="flex flex-col gap-6 rounded-[32px] border border-white/50 bg-white/70 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <Brand />
          <div className="flex flex-wrap gap-3">
            <Link href="/login" className={buttonVariants({ variant: "outline" })}>
              Admin Login
            </Link>
            <Link href="/chat" className={buttonVariants()}>
              <span className="inline-flex items-center gap-2">
                Launch Chat <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="rounded-[40px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_40px_120px_rgba(15,23,42,0.12)]">
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--accent)]">Production-ready SaaS MVP</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
              Capture, qualify, and book high-intent leads without manual back-and-forth.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted-foreground)]">
              This MVP combines AI chat, qualification logic, live slot booking, webhook automation, PostgreSQL storage, and an admin dashboard in one deployable app.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/chat" className={buttonVariants({ size: "lg" })}>
                Start the lead chat
              </Link>
              <Link href="/dashboard" className={buttonVariants({ size: "lg", variant: "outline" })}>
                View dashboard
              </Link>
            </div>
          </div>

          <Card className="bg-[var(--foreground)] text-white">
            <CardTitle className="text-white">System Outcomes</CardTitle>
            <CardDescription className="mt-2 text-white/70">
              Built for agencies, operators, and productized AI automation services.
            </CardDescription>
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl bg-white/8 p-5">
                <p className="text-sm uppercase tracking-[0.25em] text-white/60">Lead ops</p>
                <p className="mt-2 text-3xl font-semibold">24/7 intake</p>
              </div>
              <div className="rounded-3xl bg-white/8 p-5">
                <p className="text-sm uppercase tracking-[0.25em] text-white/60">Qualification</p>
                <p className="mt-2 text-3xl font-semibold">Budget-threshold scoring</p>
              </div>
              <div className="rounded-3xl bg-white/8 p-5">
                <p className="text-sm uppercase tracking-[0.25em] text-white/60">Automation</p>
                <p className="mt-2 text-3xl font-semibold">n8n webhook dispatch</p>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title}>
              <div className="w-fit rounded-2xl bg-[var(--muted)] p-3 text-[var(--primary)]">{feature.icon}</div>
              <CardTitle className="mt-5">{feature.title}</CardTitle>
              <CardDescription className="mt-3 leading-7">{feature.description}</CardDescription>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
