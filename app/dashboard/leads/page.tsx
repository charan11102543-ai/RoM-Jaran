import { LeadsTable } from "@/components/dashboard/leads-table";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <LeadsTable leads={leads} />;
}
