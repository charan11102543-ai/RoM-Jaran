import { PipelineBoard } from "@/components/dashboard/pipeline-board";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const leads = await db.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <PipelineBoard leads={leads} />;
}
