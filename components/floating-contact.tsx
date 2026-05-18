import { MessageCircle } from "lucide-react";

interface FloatingContactProps {
  lineUrl?: string;
  contactEmail?: string;
}

export function FloatingContact({ lineUrl, contactEmail }: FloatingContactProps) {
  if (!lineUrl && !contactEmail) return null;

  const href = lineUrl || (contactEmail ? `mailto:${contactEmail}` : "#");
  const label = lineUrl ? "ทักใน LINE" : "ส่งอีเมล";

  return (
    <a
      href={href}
      target={lineUrl ? "_blank" : undefined}
      rel={lineUrl ? "noreferrer" : undefined}
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-[#06C755] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_40px_rgba(6,199,85,0.4)] transition hover:scale-105 hover:bg-[#05b04c]"
      aria-label={label}
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}
