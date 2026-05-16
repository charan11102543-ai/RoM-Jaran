"use client";

import { useDeferredValue, useState } from "react";
import type { Lead } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type LeadRow = Pick<Lead, "id" | "name" | "service" | "budget" | "status" | "createdAt">;

export function LeadsTable({ leads }: { leads: LeadRow[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filtered = leads.filter((lead) => {
    const term = deferredQuery.toLowerCase();
    return [lead.name, lead.service, lead.status].some((value) => value?.toLowerCase().includes(term));
  });

  return (
    <Card>
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Lead Table</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Search by name, service, or status.</p>
        </div>
        <Input
          className="max-w-sm"
          placeholder="Search leads..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Service</TableHeaderCell>
              <TableHeaderCell>Budget</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Created</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {filtered.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>{lead.name ?? "Anonymous"}</TableCell>
                <TableCell>{lead.service ?? "Unknown"}</TableCell>
                <TableCell>{formatCurrency(lead.budget)}</TableCell>
                <TableCell>
                  <Badge variant={lead.status}>{lead.status.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell>{formatDateTime(lead.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
