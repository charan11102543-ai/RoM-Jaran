import { requireAdminApiSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { leadStatusSchema } from "@/lib/validators";

export async function PATCH(request: Request, context: RouteContext<"/api/leads/[id]/status">) {
  const session = await requireAdminApiSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const status = leadStatusSchema.parse(body.status);
    const lead = await db.lead.update({
      where: { id },
      data: { status },
    });

    return Response.json({ lead });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Unable to update lead status." }, { status: 400 });
  }
}
