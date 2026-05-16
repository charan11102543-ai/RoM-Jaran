import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  NEW: "bg-slate-100 text-slate-700",
  QUALIFIED: "bg-emerald-100 text-emerald-700",
  BOOKED: "bg-blue-100 text-blue-700",
  FOLLOW_UP: "bg-amber-100 text-amber-700",
  CLOSED: "bg-rose-100 text-rose-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PENDING: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-rose-100 text-rose-700",
};

export function Badge({
  className,
  variant = "NEW",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        variants[variant] ?? "bg-slate-100 text-slate-700",
        className,
      )}
      {...props}
    />
  );
}
