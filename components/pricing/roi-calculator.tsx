"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TrendingUp, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const formatTHB = (n: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(Math.max(0, Math.round(n)));

export function RoiCalculator() {
  // Defaults tuned for a typical Bangkok dental clinic
  const [leadsPerMonth, setLeadsPerMonth] = useState(100);
  const [closeRate, setCloseRate] = useState(15); // %
  const [dealValue, setDealValue] = useState(8000); // THB

  // Industry assumption: clinics lose ~30% of after-hours leads + slow responders
  // We assume our system recovers 60% of those lost leads (conservative).
  const LEAK_RATE = 0.3;
  const RECOVERY_RATE = 0.6;
  const SETUP_FEE = 15000;
  const ENTRY_FEE = 4900;
  const MONTHLY_RETAINER = 9500; // Growth package

  const numbers = useMemo(() => {
    const lostLeads = leadsPerMonth * LEAK_RATE;
    const lostRevenue = lostLeads * (closeRate / 100) * dealValue;
    const recoveredLeads = lostLeads * RECOVERY_RATE;
    const recoveredRevenue = recoveredLeads * (closeRate / 100) * dealValue;
    const monthlyCost = MONTHLY_RETAINER;
    const monthlyNet = recoveredRevenue - monthlyCost;
    const breakEvenMonths = monthlyNet > 0 ? SETUP_FEE / monthlyNet : Infinity;
    const yearOneNet = recoveredRevenue * 12 - monthlyCost * 12 - SETUP_FEE;
    const entryRoi = recoveredRevenue / ENTRY_FEE;
    return {
      lostLeads,
      lostRevenue,
      recoveredLeads,
      recoveredRevenue,
      monthlyNet,
      breakEvenMonths,
      yearOneNet,
      entryRoi,
    };
  }, [leadsPerMonth, closeRate, dealValue]);

  return (
    <section className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 md:p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
            <TrendingUp className="h-3.5 w-3.5" /> ROI Calculator
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            คำนวณว่าคลินิกคุณ &ldquo;หล่น&rdquo; รายได้กี่บาท/เดือน
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            ใส่ตัวเลขโดยประมาณ — ระบบจะคำนวณ revenue ที่หายไป และ ROI ของการลงระบบให้
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1.2fr]">
        {/* Inputs */}
        <div className="grid gap-4">
          <NumberField
            label="จำนวน lead ต่อเดือน"
            hint="รวมทุกช่องทาง (LINE, FB, Walk-in, Form)"
            value={leadsPerMonth}
            onChange={setLeadsPerMonth}
            min={1}
            max={5000}
            step={10}
          />
          <NumberField
            label="อัตราปิดปัจจุบัน (%)"
            hint="กี่ % ของ lead กลายเป็นลูกค้า"
            value={closeRate}
            onChange={setCloseRate}
            min={1}
            max={100}
            step={1}
            suffix="%"
          />
          <NumberField
            label="มูลค่าเฉลี่ยต่อดีล (บาท)"
            hint="เช่น จัดฟัน 35,000 / ครอบฟัน 18,000 / รากฟันเทียม 30,000"
            value={dealValue}
            onChange={setDealValue}
            min={500}
            max={500000}
            step={500}
            suffix="บาท"
          />
        </div>

        {/* Outputs */}
        <div className="grid gap-4">
          <StatRow
            label="Lead ที่หล่นปัจจุบัน (ตอบช้า/นอกเวลา)"
            value={`~${formatTHB(numbers.lostLeads)} ราย/เดือน`}
            tone="warning"
          />
          <StatRow
            label="รายได้ที่หายไป (ปัจจุบัน)"
            value={`${formatTHB(numbers.lostRevenue)} บาท/เดือน`}
            tone="warning"
            big
          />
          <StatRow
            label="รายได้ที่ระบบช่วยกู้คืน"
            value={`+${formatTHB(numbers.recoveredRevenue)} บาท/เดือน`}
            tone="success"
            big
          />
          <StatRow
            label="กำไรสุทธิ หลังหักค่าระบบ (Growth 9,500)"
            value={`${formatTHB(numbers.monthlyNet)} บาท/เดือน`}
            tone={numbers.monthlyNet > 0 ? "success" : "warning"}
          />
          <StatRow
            label="คืนทุนค่า Setup (15,000) ใน"
            value={
              Number.isFinite(numbers.breakEvenMonths)
                ? `${numbers.breakEvenMonths.toFixed(1)} เดือน`
                : "—"
            }
          />
          <StatRow
            label="กำไรสุทธิปีแรก (หลังหัก setup + retainer)"
            value={`${formatTHB(numbers.yearOneNet)} บาท`}
            tone="success"
            big
          />
        </div>
      </div>

      {/* Entry Offer pitch */}
      <div className="mt-8 rounded-2xl bg-[var(--foreground)] p-5 text-white md:p-6">
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">เริ่มต้นเสี่ยงต่ำ</p>
            <h3 className="mt-2 text-xl font-semibold md:text-2xl">
              ลอง Entry Offer 4,900 บาท ก่อน
            </h3>
            <p className="mt-2 text-sm text-white/70">
              {Number.isFinite(numbers.entryRoi) && numbers.entryRoi > 0 ? (
                <>
                  ค่าใช้จ่ายนี้ <strong className="text-white">{numbers.entryRoi.toFixed(1)}x</strong> ของ
                  revenue ที่ระบบจะช่วยกู้คืนใน <strong className="text-white">เดือนแรก</strong>
                </>
              ) : (
                <>ตรวจ LINE OA + flow lead + ตั้งระบบรับ lead พื้นฐานใน 3 วัน</>
              )}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/intake"
              className={buttonVariants({
                size: "lg",
                className: "!bg-white !text-[var(--foreground)] hover:!bg-white/90",
              })}
            >
              <span className="inline-flex items-center gap-2">
                ขอ Audit Report ฟรี <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link
              href="/intake?package=growth"
              className="text-center text-xs text-white/70 hover:text-white hover:underline"
            >
              หรือเริ่ม Growth 9,500/เดือนเลย →
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        * ตัวเลขเป็นค่าประมาณการอนุรักษ์นิยม (สมมติว่า 30% ของ lead หล่นนอกเวลา/ตอบช้า และระบบช่วยกู้ได้ 60%)
        ผลจริงขึ้นกับประเภทบริการและช่องทาง
      </p>
    </section>
  );
}

function NumberField({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      <div className="relative">
        <Input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, n)));
          }}
          className={suffix ? "pr-16" : undefined}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)]">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-[var(--muted-foreground)]">{hint}</p>}
    </div>
  );
}

function StatRow({
  label,
  value,
  tone = "default",
  big = false,
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning";
  big?: boolean;
}) {
  const toneClass =
    tone === "success"
      ? "text-emerald-700"
      : tone === "warning"
        ? "text-amber-700"
        : "text-[var(--foreground)]";

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
      <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
      <span className={`${big ? "text-xl" : "text-base"} font-semibold ${toneClass}`}>{value}</span>
    </div>
  );
}

