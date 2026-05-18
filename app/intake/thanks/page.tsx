import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Brand } from "@/components/brand";
import { buttonVariants } from "@/components/ui/button";
import { getEnv } from "@/lib/env";

export const metadata = {
  title: "ขอบคุณ — เราได้รับข้อมูลแล้ว",
};

export default function IntakeThanksPage() {
  const env = getEnv();

  return (
    <main className="min-h-screen px-6 py-8 lg:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header>
          <Link href="/"><Brand /></Link>
        </header>

        <section className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-10 text-center shadow-[0_30px_80px_rgba(15,23,42,0.06)]">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">ขอบคุณครับ — ได้รับข้อมูลแล้ว</h1>
          <p className="mt-4 text-base leading-7 text-[var(--muted-foreground)]">
            ทีมของเราจะติดต่อกลับภายใน 1 วันทำการ พร้อมแนะนำแพ็กเกจที่เหมาะกับคลินิกของคุณและนัดเวลา Demo สด
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {env.BUSINESS_LINE_OA_URL && (
              <Link
                href={env.BUSINESS_LINE_OA_URL}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants()}
              >
                เพิ่มเราเป็นเพื่อนใน LINE OA
              </Link>
            )}
            <Link href="/" className={buttonVariants({ variant: "outline" })}>
              กลับหน้าแรก
            </Link>
          </div>

          {env.BUSINESS_CONTACT_EMAIL && (
            <p className="mt-6 text-xs text-[var(--muted-foreground)]">
              สอบถามด่วน: <a href={`mailto:${env.BUSINESS_CONTACT_EMAIL}`} className="text-[var(--accent)] hover:underline">{env.BUSINESS_CONTACT_EMAIL}</a>
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
