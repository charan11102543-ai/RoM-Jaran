import "server-only";
import { db } from "@/lib/db";

export async function getDashboardStats() {
  const [totalLeads, qualifiedLeads, bookedLeads] = await Promise.all([
    db.lead.count(),
    db.lead.count({ where: { status: "QUALIFIED" } }),
    db.lead.count({ where: { status: "BOOKED" } }),
  ]);

  return {
    totalLeads,
    qualifiedLeads,
    bookedLeads,
    conversionRate: totalLeads === 0 ? 0 : bookedLeads / totalLeads,
  };
}
