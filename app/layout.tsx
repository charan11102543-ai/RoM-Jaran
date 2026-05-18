import type { Metadata } from "next";
import "./globals.css";
import { FloatingContact } from "@/components/floating-contact";
import { getEnv } from "@/lib/env";

const SITE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const BUSINESS_NAME = process.env.BUSINESS_NAME ?? "AI Automation Hustle";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BUSINESS_NAME} — ระบบรับ-คัด-นัด lead อัตโนมัติ 24/7 สำหรับคลินิก`,
    template: `%s · ${BUSINESS_NAME}`,
  },
  description:
    "AI Automation ตอบ-คัด-นัดคิวบน LINE OA + Web อัตโนมัติ 24/7 — ลดงานแอดมิน เพิ่ม lead qualified สำหรับคลินิกทันตกรรม คลินิกความงาม และคลินิกบริการสุขภาพ",
  keywords: [
    "AI คลินิก",
    "ระบบจองคิวคลินิก",
    "LINE OA คลินิก",
    "automation คลินิกทันตกรรม",
    "lead automation clinic Thailand",
    "AI chatbot LINE OA",
  ],
  openGraph: {
    type: "website",
    locale: "th_TH",
    title: `${BUSINESS_NAME} — รับ-คัด-นัด lead อัตโนมัติ 24/7 สำหรับคลินิก`,
    description:
      "ระบบ AI ตอบ LINE + เว็บ 24/7 ลด lead ตกหล่น เพิ่มอัตราการนัดคิว — เริ่มต้นที่ 4,900 บาท",
    siteName: BUSINESS_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS_NAME} — AI Automation สำหรับคลินิก`,
    description: "รับ-คัด-นัด lead อัตโนมัติ 24/7 บน LINE OA + Web",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const env = getEnv();
  return (
    <html lang="th">
      <body>
        {children}
        <FloatingContact
          lineUrl={env.BUSINESS_LINE_OA_URL || undefined}
          contactEmail={env.BUSINESS_CONTACT_EMAIL || undefined}
        />
      </body>
    </html>
  );
}
