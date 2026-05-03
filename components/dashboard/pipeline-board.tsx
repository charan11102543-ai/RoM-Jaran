"use client";

import { startTransition, useState } from "react";
import type { Lead, LeadStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const columns: LeadStatus[] = ["NEW", "QUALIFIED", "BOOKED", "FOLLOW_UP", "CLOSED"];

type PipelineLead = Pick<Lead, "id" | "name" | "service" | "budget" | "status" | "createdAt">;

export function PipelineBoard({ leads }: { leads: PipelineLead[] }) {
  const [items, setItems] = useState(leads);

  async function moveLead(leadId: string, status: LeadStatus) {
    const previous = items;
    setItems((current) => current.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)));

    const response = await fetch(`/api/leads/${leadId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      setItems(previous);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-5">
      {columns.map((column) => (
        <Card key={column} className="min-h-[420px]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">{column.replace("_", " ")}</h2>
            <Badge variant={column}>{items.filter((lead) => lead.status === column).length.toString()}</Badge>
          </div>
          <div className="space-y-4">
            {items
              .filter((lead) => lead.status === column)
              .map((lead) => (
                <div key={lead.id} className="rounded-3xl border border-[var(--border)] bg-[var(--muted)]/60 p-4">
                  <p className="font-semibold">{lead.name ?? "Anonymous"}</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{lead.service ?? "No service yet"}</p>
                  <p className="mt-3 text-sm">{formatCurrency(lead.budget)}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    {formatDateTime(lead.createdAt)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {columns
                      .filter((candidate) => candidate !== column)
                      .map((candidate) => (
                        <Button
                          key={candidate}
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            startTransition(() => {
                              void moveLead(lead.id, candidate);
                            });
                          }}
                        >
                          Move to {candidate.replace("_", " ")}
                        </Button>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
