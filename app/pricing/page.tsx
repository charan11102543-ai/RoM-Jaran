import Link from "next/link";
import { Check } from "lucide-react";
import { Brand } from "@/components/brand";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getEnv } from "@/lib/env";

export const metadata = {
  title: "แพ็กเกจ — AI Automation สำหรับคลินิก",
  description: "3 แพ็กเกจให้เลือก เริ่ม 6,000 บาท/เดือน + ค่าติดตั้ง 15,000 บาท ครั้งเดียว",
};

interface Package {
  key: "starter" | "growth" | "scale";
  name: string;
  monthlyTHB: number;
  highlight?: boolean;
  tagline: string;
  features: string[];
  paymentLink?: string;
}

export default function PricingPage() {
  const env = getEnv();

  const packages: Package[] = [
    {
      key: "starter",
      name: "Starter",
      monthlyTHB: 6000,
      tagline: "เริ่มต้นรับ lead จาก 1 ช่องทาง พร้อมรายงานรายสัปดาห์",
      features: [
        "Lead capture + qualification 1 ช่องทาง (LINE หรือ Form)",
        "AI ตอบและคัดกรอง lead อัตโนมัติ",
        "Admin dashboard ดู lead ทั้งหมด",
        "รายงานสรุปรายสัปดาห์",
        "Setup + train 1 ครั้ง",
      ],
      paymentLink: env.STRIPE_PAYMENT_LINK_STARTER || undefined,
    },
    {
      key: "growth",
      name: "Growth",
      monthlyTHB: 9500,
      highlight: true,
      tagline: "เพิ่ม email automation + content pipeline + SLA alerts",
      features: [
        "ทุกอย่างใน Starter",
        "Email automation 5-step nurture sequence",
        "Content pipeline 3 ชิ้น/สัปดาห์ (LinkedIn/Email)",
        "SLA alert (lead ไม่ตอบใน 10 นาที แจ้งทีม)",
        "Cal.com / Booking integration",
      ],
      paymentLink: env.STRIPE_PAYMENT_LINK_GROWTH || undefined,
    },
    {
      key: "scale",
      name: "Scale",
      monthlyTHB: 15000,
      tagline: "ครบ multi-channel + advanced scoring + monthly optimization",
      features: [
        "ทุกอย่างใน Growth",
        "Multi-channel (LINE + Web Chat + Email + FB Messenger)",
        "Advanced lead scoring + reactivation campaigns",
        "KPI dashboard + monthly review meeting",
        "Priority support + optimization รายเดือน",
      ],
      paymentLink: env.STRIPE_PAYMENT_LINK_SCALE || undefined,
    },
  ];

  return (
    <main className="min-h-screen px-6 py-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="flex items-center justify-between">
          <Link href="/"><Brand /></Link>
          <Link href="/intake" className={buttonVariants({ variant: "outline" })}>
            นัด Demo
          </Link>
        </header>

        <section className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]">Pricing</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            เลือกแพ็กเกจที่เหมาะกับคลินิกของคุณ
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            ทุกแพ็กเกจรวม <strong>ค่าติดตั้งระบบครั้งเดียว 15,000 บาท</strong> (รวม training + integration)
            ค่าบริการรายเดือนเริ่มหลังเปิดใช้งาน ยกเลิกได้ทุกเมื่อ
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {packages.map((pkg) => (
            <Card
              key={pkg.key}
              className={
                pkg.highlight
                  ? "border-2 border-[var(--primary)] shadow-[0_30px_80px_rgba(15,118,110,0.18)]"
                  : ""
              }
            >
              {pkg.highlight && (
                <p className="mb-3 inline-block rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-white">
                  แนะนำ
                </p>
              )}
              <CardTitle className="text-2xl">{pkg.name}</CardTitle>
              <CardDescription className="mt-2">{pkg.tagline}</CardDescription>

              <div className="mt-6">
                <span className="text-4xl font-semibold">{pkg.monthlyTHB.toLocaleString()}</span>
                <span className="ml-2 text-sm text-[var(--muted-foreground)]">บาท/เดือน</span>
              </div>

              <ul className="mt-6 space-y-3 text-sm">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-2">
                <Link
                  href={`/intake?package=${pkg.key}`}
                  className={buttonVariants({ variant: pkg.highlight ? "default" : "outline" })}
                >
                  เริ่มต้นกับแพ็กเกจนี้
                </Link>
                {pkg.paymentLink && (
                  <Link
                    href={pkg.paymentLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-center text-xs text-[var(--accent)] hover:underline"
                  >
                    ชำระค่าติดตั้งได้เลย →
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </section>

        <section className="rounded-[32px] border border-[var(--border)] bg-white p-8 md:p-10">
          <h2 className="text-2xl font-semibold">ค่าติดตั้งรวมอะไรบ้าง</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> ตั้งค่า LINE OA + Webhook</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> ออกแบบ AI qualification flow ตามคลินิก</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> ตั้งค่า booking calendar + business hours</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> เชื่อม n8n workflow + Slack/LINE notification</li>
            </ul>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> Training ทีมแอดมิน 1 ครั้ง (Zoom)</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> Deploy ขึ้น production พร้อม domain</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> Runbook + เอกสารใช้งานครบชุด</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> Support 14 วันแรกหลัง go-live</li>
            </ul>
          </div>

          {env.STRIPE_PAYMENT_LINK_SETUP ? (
            <Link
              href={env.STRIPE_PAYMENT_LINK_SETUP}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ className: "mt-8" })}
            >
              ชำระค่าติดตั้ง 15,000 บาท →
            </Link>
          ) : (
            <p className="mt-8 text-sm text-[var(--muted-foreground)]">
              ติดต่อทีมเพื่อรับลิงก์ชำระเงิน — <Link href="/intake" className="text-[var(--accent)] hover:underline">นัด Demo</Link>
            </p>
          )}
        </section>

        <section className="text-center text-sm text-[var(--muted-foreground)]">
          ยังไม่แน่ใจว่าเหมาะแพ็กเกจไหน? <Link href="/intake" className="text-[var(--accent)] hover:underline">นัดคุย 20 นาที</Link> เราจะแนะนำให้ฟรี
        </section>
      </div>
    </main>
  );
}
