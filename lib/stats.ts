import "server-only";
import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const [totalLeads, qualifiedLeads, bookedLeads] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "QUALIFIED" } }),
    prisma.lead.count({ where: { status: "BOOKED" } }),
  ]);

  return {
    totalLeads,
    qualifiedLeads,
    bookedLeads,
    conversionRate: totalLeads === 0 ? 0 : bookedLeads / totalLeads,
  };
}
