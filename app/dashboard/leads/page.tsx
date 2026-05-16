import { LeadsTable } from "@/components/dashboard/leads-table";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await db.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <LeadsTable leads={leads} />;
}
