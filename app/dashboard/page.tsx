import { Activity, CalendarRange, Funnel, Users } from "lucide-react";
import { BookingsTable } from "@/components/dashboard/bookings-table";
import { LeadsTable } from "@/components/dashboard/leads-table";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getDashboardStats } from "@/lib/stats";
import { formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, recentLeads, recentBookings] = await Promise.all([
    getDashboardStats(),
    db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    db.booking.findMany({
      orderBy: { datetime: "asc" },
      take: 5,
      include: { lead: { select: { name: true, service: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Leads" value={stats.totalLeads.toString()} description="All inbound conversations persisted in PostgreSQL." icon={<Users className="h-5 w-5" />} />
        <MetricCard title="Qualified" value={stats.qualifiedLeads.toString()} description="Budget and service match the configured threshold." icon={<Funnel className="h-5 w-5" />} />
        <MetricCard title="Booked" value={stats.bookedLeads.toString()} description="Appointments locked and collision-checked." icon={<CalendarRange className="h-5 w-5" />} />
        <MetricCard title="Conversion" value={formatPercent(stats.conversionRate)} description="Booked leads divided by total leads." icon={<Activity className="h-5 w-5" />} />
      </section>

      <Card>
        <CardTitle>Operating Snapshot</CardTitle>
        <CardDescription className="mt-2">
          The dashboard is live-backed by Prisma queries, not mock data. Use the dedicated tabs for full tables and pipeline actions.
        </CardDescription>
      </Card>

      <LeadsTable leads={recentLeads} />
      <BookingsTable bookings={recentBookings} />
    </div>
  );
}
