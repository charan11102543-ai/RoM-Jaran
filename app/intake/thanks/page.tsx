import Link from "next/link";
import { CheckCircle2, Clock, MessageCircle, QrCode } from "lucide-react";
import { Brand } from "@/components/brand";
import { buttonVariants } from "@/components/ui/button";
import { getEnv } from "@/lib/env";

export const metadata = {
  title: "รับข้อมูลแล้ว — ขั้นตอนต่อไป",
};

export default function IntakeThanksPage() {
  const env = getEnv();

  return (
    <main className="min-h-screen px-6 py-8 lg:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header>
          <Link href="/"><Brand /></Link>
        </header>

        {/* Confirmation + 24h promise */}
        <section className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.06)] md:p-10">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
          <h1 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">รับข้อมูลแล้ว ✓</h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[var(--muted-foreground)]">
            ทีมเรากำลังจัดทำ <strong>Audit Report</strong> ของคลินิกคุณ และจะส่งกลับภายใน{" "}
            <span className="inline-flex items-center gap-1 font-semibold text-[var(--foreground)]">
              <Clock className="h-4 w-4" /> 24 ชั่วโมง
            </span>
          </p>
        </section>

        {/* Two-column: LINE QR + PromptPay QR */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* LINE — receive the report faster */}
          <div className="rounded-[28px] border border-[var(--border)] bg-white p-6 text-center md:p-8">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#06C755]/10 px-3 py-1 text-xs font-semibold text-[#06C755]">
              <MessageCircle className="h-3.5 w-3.5" /> รับรายงานเร็วขึ้น
            </p>
            <h2 className="mt-4 text-xl font-semibold">สแกน LINE เพื่อรับรายงาน</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              ทักหาเราใน LINE OA ตอนนี้ — ส่งรายงานให้ทันทีที่ทำเสร็จ
            </p>

            <div className="mx-auto mt-5 flex h-56 w-56 items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--muted)]">
              {/* QR PNG ต้องวางที่ public/assets/line-qr.png (path กำหนดใน LINE_QR_PATH) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={env.LINE_QR_PATH}
                alt="LINE OA QR"
                className="h-full w-full rounded-2xl object-contain p-2"
              />
            </div>

            {env.BUSINESS_LINE_OA_ID && (
              <p className="mt-3 text-sm font-mono text-[var(--foreground)]">{env.BUSINESS_LINE_OA_ID}</p>
            )}

            {env.BUSINESS_LINE_OA_URL && (
              <Link
                href={env.BUSINESS_LINE_OA_URL}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ className: "mt-4 w-full !bg-[#06C755] hover:!bg-[#05b04c]" })}
              >
                <span className="inline-flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" /> เปิด LINE
                </span>
              </Link>
            )}
          </div>

          {/* PromptPay — pay deposit for Entry Offer */}
          <div className="rounded-[28px] border border-[var(--border)] bg-white p-6 text-center md:p-8">
            <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              <QrCode className="h-3.5 w-3.5" /> สำหรับลูกค้าที่พร้อมเริ่ม
            </p>
            <h2 className="mt-4 text-xl font-semibold">สแกน PromptPay เพื่อมัดจำ</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Entry Offer <strong>4,900 บาท</strong> — เริ่มงานทันทีหลังโอน · ส่งรายงาน + เริ่มตั้งระบบใน 3 วัน
            </p>

            <div className="mx-auto mt-5 flex h-56 w-56 items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--muted)]">
              {/* QR PNG ต้องวางที่ public/assets/promptpay-qr.png (path กำหนดใน PROMPTPAY_QR_PATH) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={env.PROMPTPAY_QR_PATH}
                alt="PromptPay QR"
                className="h-full w-full rounded-2xl object-contain p-2"
              />
            </div>

            {env.PROMPTPAY_NUMBER && (
              <p className="mt-3 text-sm">
                <span className="text-[var(--muted-foreground)]">PromptPay: </span>
                <span className="font-mono font-semibold">{env.PROMPTPAY_NUMBER}</span>
              </p>
            )}
            {env.PROMPTPAY_DISPLAY_NAME && (
              <p className="text-xs text-[var(--muted-foreground)]">ชื่อบัญชี: {env.PROMPTPAY_DISPLAY_NAME}</p>
            )}

            <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs text-amber-900">
              โอนแล้วส่งสลิปทาง LINE OA — เราจะเริ่มงานภายใน 1 ชม.
            </p>
          </div>
        </section>

        {/* Compact footer actions */}
        <section className="flex flex-col items-center gap-3 text-sm text-[var(--muted-foreground)]">
          <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            ← กลับหน้าแรก
          </Link>
          {env.BUSINESS_CONTACT_EMAIL && (
            <p>
              สอบถามด่วน:{" "}
              <a href={`mailto:${env.BUSINESS_CONTACT_EMAIL}`} className="text-[var(--accent)] hover:underline">
                {env.BUSINESS_CONTACT_EMAIL}
              </a>
              {env.BUSINESS_CONTACT_PHONE && (
                <>
                  {" · "}
                  <a href={`tel:${env.BUSINESS_CONTACT_PHONE}`} className="text-[var(--accent)] hover:underline">
                    {env.BUSINESS_CONTACT_PHONE}
                  </a>
                </>
              )}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
