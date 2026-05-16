import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--foreground)] text-sm font-bold uppercase tracking-[0.25em] text-white">
        AH
      </span>
      <span className="flex flex-col">
        <span className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">AI Automation Hustle</span>
        <span className="text-sm font-semibold text-[var(--foreground)]">Lead Qualification Engine</span>
      </span>
    </Link>
  );
}
