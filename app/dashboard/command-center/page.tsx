import { db } from "@/lib/db";
import { requireAdminPageSession } from "@/lib/auth";
import { CommandCenterClient } from "./command-center-client";

export const dynamic = "force-dynamic";

export default async function CommandCenterPage() {
  await requireAdminPageSession();

  const [agents, spaces, tasks] = await Promise.all([
    db.agentRegistry.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { tasks: true } },
        spaces: {
          include: { space: { select: { id: true, name: true, color: true } } },
        },
      },
    }),
    db.space.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { tasks: true } },
        agents: {
          include: {
            agent: {
              select: { id: true, name: true, type: true, environment: true, isActive: true },
            },
          },
        },
      },
    }),
    db.agentTask.findMany({
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 200,
      include: {
        agent: { select: { id: true, name: true, type: true, environment: true } },
        space: { select: { id: true, name: true, color: true } },
        _count: { select: { logs: true } },
      },
    }),
  ]);

  return (
    <CommandCenterClient
      initialAgents={JSON.parse(JSON.stringify(agents))}
      initialSpaces={JSON.parse(JSON.stringify(spaces))}
      initialTasks={JSON.parse(JSON.stringify(tasks))}
    />
  );
}
