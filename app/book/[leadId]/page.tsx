import { notFound } from "next/navigation";
import { Brand } from "@/components/brand";
import { SlotPicker } from "@/components/booking/slot-picker";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;

  const lead = await db.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) {
    notFound();
  }

  return (
    <main className="min-h-screen px-6 py-8 lg:px-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <Brand />
        <Card>
          <CardTitle>Booking for {lead.name ?? "Anonymous lead"}</CardTitle>
          <CardDescription className="mt-3">
            Service: {lead.service ?? "Unknown"} · Budget: {formatCurrency(lead.budget)}
          </CardDescription>
        </Card>
        <SlotPicker leadId={leadId} />
      </div>
    </main>
  );
}
