export const dynamic = "force-dynamic";

import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { leadStatusSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const status = leadStatusSchema.parse(body.status);

    const lead = await prisma.lead.update({
      where: { id },
      data: { status },
    });

    return Response.json({ lead });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Unable to update lead status." }, { status: 400 });
  }
}
