import type { ReactNode } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function MetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <CardDescription>{title}</CardDescription>
          <CardTitle className="mt-3 text-3xl">{value}</CardTitle>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">{description}</p>
        </div>
        <div className="rounded-2xl bg-[var(--muted)] p-3 text-[var(--primary)]">{icon}</div>
      </div>
    </Card>
  );
}
