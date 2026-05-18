"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const PACKAGES = [
  { value: "starter", label: "Starter — 6,000 บาท/เดือน" },
  { value: "growth", label: "Growth — 9,500 บาท/เดือน" },
  { value: "scale", label: "Scale — 15,000 บาท/เดือน" },
  { value: "unsure", label: "ยังไม่แน่ใจ — ขอให้แนะนำ" },
] as const;

export function IntakeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPackage = searchParams.get("package") ?? "unsure";

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      clinic: String(formData.get("clinic") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      lineId: String(formData.get("lineId") ?? ""),
      packageInterest: String(formData.get("packageInterest") ?? "unsure"),
      message: String(formData.get("message") ?? ""),
    };

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "ส่งฟอร์มไม่สำเร็จ กรุณาลองอีกครั้ง");
        setSubmitting(false);
        return;
      }
      router.push("/intake/thanks");
    } catch {
      setError("เครือข่ายมีปัญหา กรุณาลองอีกครั้ง");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <Field label="ชื่อ-นามสกุล *" htmlFor="name">
        <Input id="name" name="name" required maxLength={120} placeholder="ชื่อจริง นามสกุล" />
      </Field>

      <Field label="ชื่อคลินิก / ธุรกิจ *" htmlFor="clinic">
        <Input id="clinic" name="clinic" required maxLength={200} placeholder="เช่น เดนทัล แคร์ คลินิก" />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="เบอร์โทร *" htmlFor="phone">
          <Input id="phone" name="phone" required type="tel" maxLength={40} placeholder="08x-xxx-xxxx" />
        </Field>

        <Field label="LINE ID" htmlFor="lineId">
          <Input id="lineId" name="lineId" maxLength={100} placeholder="@yourline" />
        </Field>
      </div>

      <Field label="อีเมล (ถ้ามี)" htmlFor="email">
        <Input id="email" name="email" type="email" placeholder="you@clinic.com" />
      </Field>

      <Field label="แพ็กเกจที่สนใจ" htmlFor="packageInterest">
        <select
          id="packageInterest"
          name="packageInterest"
          defaultValue={initialPackage}
          className="flex h-11 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
        >
          {PACKAGES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </Field>

      <Field label="บอกเราเล็กน้อยเกี่ยวกับคลินิกของคุณ" htmlFor="message">
        <Textarea
          id="message"
          name="message"
          maxLength={2000}
          rows={5}
          placeholder="ปัจจุบันรับ lead จากช่องทางไหนบ้าง, ปัญหาที่อยากแก้, ปริมาณ lead/สัปดาห์..."
        />
      </Field>

      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? "กำลังส่ง..." : "ส่งคำขอ — ทีมจะติดต่อกลับภายใน 1 วันทำการ"}
      </Button>

      <p className="text-xs text-[var(--muted-foreground)]">
        การส่งฟอร์มถือว่ายินยอมให้เราติดต่อกลับเพื่อให้คำปรึกษา ไม่มีค่าใช้จ่ายและไม่ผูกมัด
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="grid gap-2">
      <span className="text-sm font-medium text-[var(--foreground)]">{label}</span>
      {children}
    </label>
  );
}
