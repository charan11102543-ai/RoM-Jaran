"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Heuristic: pure digits/space/dash/+/() = phone; otherwise treat as LINE ID
function looksLikePhone(value: string): boolean {
  return /^[\d\s\-+()]{8,}$/.test(value.trim());
}

export function IntakeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pkgFromUrl = searchParams.get("package") ?? "unsure";

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const clinic = String(formData.get("clinic") ?? "").trim();
    const contact = String(formData.get("contact") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const isPhone = looksLikePhone(contact);

    // Map shrunk 3-field form to existing /api/intake payload (which requires
    // name + phone). Clinic doubles as "name"; contact fills phone and lineId
    // depending on its shape — admin sees the same value in both fields.
    const payload = {
      name: clinic,
      clinic,
      phone: isPhone ? contact : contact,
      lineId: isPhone ? "" : contact,
      email: "",
      packageInterest: pkgFromUrl,
      message,
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
      <Field label="ชื่อคลินิก / ธุรกิจ *" htmlFor="clinic">
        <Input
          id="clinic"
          name="clinic"
          required
          maxLength={200}
          placeholder="เช่น เดนทัล แคร์ คลินิก สาขาอโศก"
        />
      </Field>

      <Field
        label="LINE OA หรือเบอร์โทร *"
        htmlFor="contact"
        hint="ใส่อย่างใดอย่างหนึ่ง — เราจะติดต่อกลับช่องทางนี้"
      >
        <Input
          id="contact"
          name="contact"
          required
          minLength={8}
          maxLength={100}
          placeholder="@yourline หรือ 08x-xxx-xxxx"
        />
      </Field>

      <Field
        label="ปัญหาหลัก / สิ่งที่อยากให้ช่วย *"
        htmlFor="message"
        hint="ยิ่งบอกละเอียด รายงาน Audit ฟรีจะยิ่งตรงจุด"
      >
        <Textarea
          id="message"
          name="message"
          required
          maxLength={2000}
          rows={4}
          placeholder="เช่น lead จาก LINE หล่นกลางคืน, ลูกค้าถามราคาแล้วเงียบ, จองคิวซ้ำซ้อน..."
        />
      </Field>

      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? "กำลังส่ง..." : "ขอ Audit Report ฟรี →"}
      </Button>

      <p className="text-xs text-[var(--muted-foreground)]">
        ใช้เวลา 30 วินาที · ส่งรายงาน PDF ภายใน 24 ชม. · ไม่มีค่าใช้จ่าย ไม่ผูกมัด
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="grid gap-2">
      <span className="text-sm font-medium text-[var(--foreground)]">{label}</span>
      {children}
      {hint && <span className="text-xs text-[var(--muted-foreground)]">{hint}</span>}
    </label>
  );
}
