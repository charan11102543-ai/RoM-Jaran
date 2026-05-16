import Link from "next/link";
import { BarChart3, Bot, CalendarRange, KanbanSquare, Users } from "lucide-react";
import { Brand } from "@/components/brand";
import { LogoutButton } from "@/components/logout-button";
import { requireAdminPageSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const links = [
  { href: "/dashboard", label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
  { href: "/dashboard/leads", label: "Leads", icon: <Users className="h-4 w-4" /> },
  { href: "/dashboard/bookings", label: "Bookings", icon: <CalendarRange className="h-4 w-4" /> },
  { href: "/dashboard/pipeline", label: "Pipeline", icon: <KanbanSquare className="h-4 w-4" /> },
  { href: "/dashboard/command-center", label: "Command Center", icon: <Bot className="h-4 w-4" /> },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPageSession();

  return (
    <main className="min-h-screen px-6 py-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[32px] border border-white/50 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <Brand />
          <div className="flex flex-wrap items-center gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-4 py-2 text-sm font-medium"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <LogoutButton />
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}
