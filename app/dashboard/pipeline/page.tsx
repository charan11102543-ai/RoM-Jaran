import { PipelineBoard } from "@/components/dashboard/pipeline-board";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <PipelineBoard leads={leads} />;
}
