import Link from "next/link";
import { ArrowRight, Bot, CalendarClock, MessageCircle, Webhook, Zap, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getEnv } from "@/lib/env";

const PAIN_POINTS = [
  "Lead จาก LINE/Facebook ตกหล่นเพราะตอบช้า",
  "ไม่มีคนแอดมินตอนกลางคืน/วันหยุด",
  "นัดซ้ำซ้อนหรือลืมยืนยันคิว",
  "ไม่รู้ว่า lead มาจากช่องทางไหนได้ผลที่สุด",
];

const OUTCOMES = [
  { label: "ตอบ lead", value: "< 1 นาที", caption: "ตลอด 24/7" },
  { label: "Qualified rate", value: "> 25%", caption: "จาก lead ทั้งหมด" },
  { label: "Setup เสร็จใน", value: "1 วัน", caption: "พร้อมใช้งานจริง" },
];

const FEATURES = [
  {
    icon: <Bot className="h-5 w-5" />,
    title: "AI คัดกรอง lead อัตโนมัติ",
    description: "คุยกับลูกค้าเหมือนแอดมินจริง เก็บชื่อ, บริการ, งบ, เวลาที่สะดวก แล้วให้คะแนนทันที",
  },
  {
    icon: <CalendarClock className="h-5 w-5" />,
    title: "ระบบจองคิวกันชน",
    description: "สร้าง slot ตาม business hours จริง ป้องกันการจองซ้ำซ้อนแบบอัตโนมัติ",
  },
  {
    icon: <Webhook className="h-5 w-5" />,
    title: "เชื่อม n8n / LINE OA / Slack",
    description: "ทุก lead ใหม่ส่งเข้า workflow ของคุณทันที พร้อมแจ้งทีมขายแบบ realtime",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Dashboard ผู้บริหาร",
    description: "เห็นจำนวน lead, อัตรา qualified, การจอง และ pipeline แบบ Kanban ในที่เดียว",
  },
];

const HOW_IT_WORKS = [
  { step: "1", title: "นัด Demo", body: "กรอกฟอร์ม 1 นาที ทีมเราติดต่อกลับใน 1 วันทำการ" },
  { step: "2", title: "ตั้งระบบ 1 วัน", body: "เราติดตั้ง + train ทีมแอดมินคลินิกคุณ ครบ end-to-end" },
  { step: "3", title: "Go live + วัดผล", body: "ระบบทำงาน 24/7 พร้อมรายงาน KPI รายสัปดาห์" },
];

export default function Home() {
  const env = getEnv();

  return (
    <main className="min-h-screen px-6 py-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-12">
        <header className="flex flex-col gap-6 rounded-[32px] border border-white/50 bg-white/70 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <Brand />
          <nav className="flex flex-wrap items-center gap-3">
            <Link href="/pricing" className="text-sm font-medium hover:text-[var(--accent)]">แพ็กเกจ</Link>
            <Link href="/chat" className="text-sm font-medium hover:text-[var(--accent)]">ทดลอง Chat</Link>
            <Link href="/login" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Admin Login
            </Link>
            <Link href="/intake" className={buttonVariants({ size: "sm" })}>
              นัด Demo
            </Link>
          </nav>
        </header>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="rounded-[40px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_40px_120px_rgba(15,23,42,0.12)] md:p-10">
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--accent)]">AI Automation สำหรับคลินิก</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              ระบบรับ-คัด-นัด lead อัตโนมัติ <span className="text-[var(--accent)]">ทำงาน 24/7</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted-foreground)]">
              เลิกพลาด lead เพราะตอบช้า เลิกจ้างแอดมินตอนกลางคืน
              ระบบของเราใช้ AI คุย คัดกรอง และจองคิวอัตโนมัติ พร้อม dashboard ผู้บริหารและรายงาน KPI รายสัปดาห์
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/intake" className={buttonVariants({ size: "lg" })}>
                <span className="inline-flex items-center gap-2">
                  นัด Demo ฟรี <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link href="/pricing" className={buttonVariants({ size: "lg", variant: "outline" })}>
                ดูแพ็กเกจ
              </Link>
              <Link href="/chat" className={buttonVariants({ size: "lg", variant: "ghost" })}>
                ลองคุยกับ AI
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {OUTCOMES.map((o) => (
                <div key={o.label} className="rounded-2xl border border-[var(--border)] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">{o.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{o.value}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">{o.caption}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="bg-[var(--foreground)] text-white">
            <p className="text-sm uppercase tracking-[0.25em] text-white/60">ปัญหาที่เราแก้</p>
            <CardTitle className="mt-3 text-white">คลินิกของคุณเจอแบบนี้หรือไม่?</CardTitle>
            <ul className="mt-6 space-y-3 text-sm">
              {PAIN_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-3 rounded-2xl bg-white/8 p-3">
                  <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-300" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <Link href="/intake" className={buttonVariants({ variant: "outline", className: "mt-6 w-full !bg-white !text-[var(--foreground)] hover:!bg-white/90" })}>
              ขอคำปรึกษาฟรี
            </Link>
          </Card>
        </section>

        <section>
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]">Features</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            ระบบครบ จบในที่เดียว
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {FEATURES.map((feature) => (
              <Card key={feature.title}>
                <div className="w-fit rounded-2xl bg-[var(--muted)] p-3 text-[var(--primary)]">{feature.icon}</div>
                <CardTitle className="mt-5">{feature.title}</CardTitle>
                <CardDescription className="mt-3 leading-7">{feature.description}</CardDescription>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 md:p-10">
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">เริ่มใช้งานใน 3 ขั้นตอน</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} className="rounded-2xl border border-[var(--border)] bg-white p-6">
                <p className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-lg font-semibold text-white">
                  {s.step}
                </p>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] bg-[var(--foreground)] p-8 text-white md:p-12">
          <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                พร้อมให้คลินิกของคุณรับ lead ตลอด 24 ชั่วโมงหรือยัง?
              </h2>
              <p className="mt-4 text-white/70">
                ปรึกษาฟรี 20 นาที — เราจะวิเคราะห์ flow ปัจจุบันและแนะนำว่าคุ้มที่จะลงระบบนี้หรือไม่
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/intake" className={buttonVariants({ size: "lg", className: "!bg-white !text-[var(--foreground)] hover:!bg-white/90" })}>
                นัด Demo ฟรี
              </Link>
              {env.BUSINESS_LINE_OA_URL && (
                <Link
                  href={env.BUSINESS_LINE_OA_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ variant: "outline", size: "lg", className: "!border-white/30 !bg-transparent !text-white hover:!bg-white/10" })}
                >
                  <span className="inline-flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" /> ทักใน LINE OA
                  </span>
                </Link>
              )}
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted-foreground)] md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {env.BUSINESS_NAME}</p>
          <div className="flex gap-4">
            <Link href="/pricing" className="hover:text-[var(--accent)]">แพ็กเกจ</Link>
            <Link href="/intake" className="hover:text-[var(--accent)]">นัด Demo</Link>
            <Link href="/chat" className="hover:text-[var(--accent)]">ทดลอง Chat</Link>
            {env.BUSINESS_CONTACT_EMAIL && (
              <a href={`mailto:${env.BUSINESS_CONTACT_EMAIL}`} className="hover:text-[var(--accent)]">
                {env.BUSINESS_CONTACT_EMAIL}
              </a>
            )}
          </div>
        </footer>
      </div>
    </main>
  );
}
