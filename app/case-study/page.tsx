import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  LineChart,
  MessageCircle,
  Search,
  TrendingUp,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Dental Clinic Lead Recovery Case Study",
  description:
    "A lightweight before and after case study showing how LINE OA automation improves dental clinic response speed and lead recovery.",
};

const auditFindings = [
  "New Facebook and LINE OA inquiries waited 3-6 hours before the first reply.",
  "Price questions for braces and implants were answered manually with no follow-up.",
  "Hot leads were mixed with low-intent messages, so the admin team had no priority queue.",
  "No 3-day or 7-day recovery sequence existed for patients who went quiet.",
];

const roiNumbers = [
  { label: "First reply time", before: "4h 20m", after: "< 2m" },
  { label: "Recovered leads / month", before: "0", after: "18" },
  { label: "Booked consults", before: "22", after: "34" },
  { label: "Estimated monthly upside", before: "-", after: "126,000 THB" },
];

const beforeAfter = [
  {
    before: "Patient asks for braces price in Facebook comments.",
    after: "Patient gets a LINE OA link with a service-specific intake flow.",
  },
  {
    before: "Admin replies when available and asks the same questions manually.",
    after: "Automation captures service, budget, urgency, and preferred appointment time.",
  },
  {
    before: "Quiet leads are forgotten after the first conversation.",
    after: "A 7-day recovery sequence follows up with useful reminders and booking CTA.",
  },
];

export default function CaseStudyPage() {
  return (
    <main className="min-h-screen px-6 py-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="flex flex-col gap-5 rounded-[28px] border border-white/60 bg-white/75 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <Brand />
          <nav className="flex flex-wrap items-center gap-3">
            <Link href="/pricing" className="text-sm font-medium hover:text-[var(--accent)]">
              Pricing
            </Link>
            <Link href="/intake" className={buttonVariants({ size: "sm" })}>
              Request free audit
            </Link>
          </nav>
        </header>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)] lg:items-stretch">
          <div className="rounded-[36px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_36px_110px_rgba(15,23,42,0.12)] md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
              Demo case study
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              How a Bangkok dental clinic recovered lost leads with faster LINE OA follow-up
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted-foreground)]">
              A practical before/after example for clinics that receive inquiries from Facebook ads,
              Instagram, and LINE OA but lose patients because replies and follow-ups happen too late.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/intake" className={buttonVariants({ size: "lg" })}>
                <span className="inline-flex items-center gap-2">
                  Request free audit <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link href="/pricing" className={buttonVariants({ size: "lg", variant: "outline" })}>
                View packages
              </Link>
            </div>
          </div>

          <Card className="bg-[var(--foreground)] text-white">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-white/10 p-3 text-cyan-200">
                <MessageCircle className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-white/55">Clinic problem</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Good demand, weak recovery</h2>
              </div>
            </div>
            <p className="mt-6 text-sm leading-7 text-white/72">
              The clinic was paying for social traffic and receiving qualified questions about braces,
              implants, and whitening. The problem was not lead volume. The problem was speed,
              qualification, and follow-up after patients stopped replying.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/8 p-4">
                <p className="text-2xl font-semibold">120</p>
                <p className="mt-1 text-xs text-white/60">monthly inquiries</p>
              </div>
              <div className="rounded-2xl bg-white/8 p-4">
                <p className="text-2xl font-semibold">31%</p>
                <p className="mt-1 text-xs text-white/60">estimated leakage</p>
              </div>
              <div className="rounded-2xl bg-white/8 p-4">
                <p className="text-2xl font-semibold">7 days</p>
                <p className="mt-1 text-xs text-white/60">setup window</p>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
          <Card>
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-[var(--muted)] p-3 text-[var(--primary)]">
                <Search className="h-5 w-5" />
              </span>
              <CardTitle>Audit findings</CardTitle>
            </div>
            <ul className="mt-6 space-y-3 text-sm leading-6 text-[var(--muted-foreground)]">
              {auditFindings.map((finding) => (
                <li key={finding} className="flex gap-3 rounded-2xl border border-[var(--border)] bg-white p-4">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-[var(--accent)]">ROI snapshot</p>
                <CardTitle className="mt-2 text-2xl">What changed after the automation went live</CardTitle>
              </div>
              <TrendingUp className="hidden h-8 w-8 text-[var(--primary)] sm:block" />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {roiNumbers.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-[var(--border)] bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    {metric.label}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)]">Before</p>
                      <p className="mt-1 text-xl font-semibold text-rose-700">{metric.before}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)]">After</p>
                      <p className="mt-1 text-xl font-semibold text-emerald-700">{metric.after}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="rounded-[32px] border border-[var(--border)] bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.07)] md:p-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--accent)]">Before vs after</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                From manual replies to a recoverable lead pipeline
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">
              The system did not replace the admin team. It gave them faster intake, cleaner lead context,
              and automatic follow-up when patients needed more time.
            </p>
          </div>

          <div className="mt-8 grid gap-4">
            {beforeAfter.map((row) => (
              <div key={row.before} className="grid gap-4 rounded-3xl border border-[var(--border)] bg-[#fbfaf6] p-5 md:grid-cols-2">
                <div>
                  <p className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                    Before
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{row.before}</p>
                </div>
                <div>
                  <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    After
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{row.after}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-[var(--muted)] p-3 text-[var(--primary)]">
                <Clock className="h-5 w-5" />
              </span>
              <CardTitle>Screenshot placeholder: LINE OA recovery flow</CardTitle>
            </div>
            <div className="mt-6 flex min-h-[280px] items-center justify-center rounded-[24px] border border-dashed border-[var(--border)] bg-[#f8f5ed] p-6 text-center">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">[SCREENSHOT_PLACEHOLDER_LINE_OA]</p>
                <p className="mt-2 max-w-sm text-sm text-[var(--muted-foreground)]">
                  Replace with a screenshot showing greeting message, service selection, and follow-up CTA.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-[var(--muted)] p-3 text-[var(--primary)]">
                <LineChart className="h-5 w-5" />
              </span>
              <CardTitle>Screenshot placeholder: lead recovery dashboard</CardTitle>
            </div>
            <div className="mt-6 flex min-h-[280px] items-center justify-center rounded-[24px] border border-dashed border-[var(--border)] bg-[#f8f5ed] p-6 text-center">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">[SCREENSHOT_PLACEHOLDER_DASHBOARD]</p>
                <p className="mt-2 max-w-sm text-sm text-[var(--muted-foreground)]">
                  Replace with a dashboard view showing new leads, recovered leads, appointments, and revenue estimate.
                </p>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="bg-[var(--foreground)] text-white">
            <p className="text-sm uppercase tracking-[0.24em] text-white/55">Testimonial placeholder</p>
            <blockquote className="mt-5 text-2xl font-semibold leading-9 text-white">
              "[TESTIMONIAL_QUOTE]"
            </blockquote>
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="font-semibold text-white">[CLIENT_NAME]</p>
              <p className="text-sm text-white/60">[ROLE], [CLINIC_NAME]</p>
            </div>
          </Card>

          <section className="rounded-[32px] bg-[var(--primary)] p-8 text-white shadow-[0_24px_70px_rgba(15,118,110,0.22)] md:p-10">
            <p className="text-sm uppercase tracking-[0.24em] text-white/70">Free audit CTA</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Want to see where your clinic is losing leads?
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78">
              Request a free audit and receive a short report covering response speed, LINE OA flow,
              follow-up gaps, and quick wins your clinic can implement within 7 days.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/intake"
                className={buttonVariants({
                  size: "lg",
                  className: "!bg-white !text-[var(--foreground)] hover:!bg-white/90",
                })}
              >
                Request free audit
              </Link>
              <Link
                href="/pricing"
                className={buttonVariants({
                  size: "lg",
                  variant: "outline",
                  className: "!border-white/35 !bg-transparent !text-white hover:!bg-white/10",
                })}
              >
                See Entry Offer
              </Link>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
