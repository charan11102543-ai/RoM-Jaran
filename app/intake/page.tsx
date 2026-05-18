import { Suspense } from "react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { IntakeForm } from "@/components/intake/intake-form";
import { getEnv } from "@/lib/env";

export const metadata = {
  title: "ขอใบเสนอราคา / นัด Demo",
  description: "กรอกข้อมูลเพื่อให้ทีมติดต่อกลับและให้คำปรึกษาฟรี ไม่ผูกมัด",
};

export default function IntakePage() {
  const env = getEnv();

  return (
    <main className="min-h-screen px-6 py-8 lg:px-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="flex items-center justify-between">
          <Link href="/"><Brand /></Link>
          <Link href="/pricing" className="text-sm text-[var(--accent)] hover:underline">
            ดูแพ็กเกจ →
          </Link>
        </header>

        <section className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_30px_80px_rgba(15,23,42,0.06)] md:p-10">
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]">Get started</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            นัด Demo / ขอใบเสนอราคา
          </h1>
          <p className="mt-3 text-base leading-7 text-[var(--muted-foreground)]">
            กรอกข้อมูลด้านล่าง ทีมจะติดต่อกลับภายใน 1 วันทำการ พร้อมตัวอย่างระบบและ ROI ที่คลินิกของคุณคาดหวังได้
          </p>

          <div className="mt-8">
            <Suspense fallback={<p className="text-sm text-[var(--muted-foreground)]">กำลังโหลดฟอร์ม...</p>}>
              <IntakeForm />
            </Suspense>
          </div>

          {env.BUSINESS_LINE_OA_URL && (
            <div className="mt-8 rounded-2xl bg-[var(--muted)] p-5">
              <p className="text-sm font-medium">หรือทักเราใน LINE OA ก่อนได้</p>
              <Link
                href={env.BUSINESS_LINE_OA_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-[var(--accent)] hover:underline"
              >
                เปิด LINE OA →
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
