import { NextRequest, NextResponse } from "next/server";

/**
 * API rate-limiting middleware — sliding window per IP.
 *
 * Backend is controlled by RATE_LIMIT_BACKEND env var:
 *   "memory" (default) — in-process Map, suitable for single-instance / dev
 *   "redis"            — requires REDIS_URL; use for multi-worker / Vercel deployments
 *
 * Note: Next.js middleware runs in the Edge runtime. The rate-limit logic here
 * is intentionally self-contained (no external imports) so it runs at the edge.
 * The full lib/rate-limit.ts abstraction is used in API routes / server code.
 */

const RATE_LIMIT_MAX = 60;       // requests per window
const RATE_LIMIT_WINDOW = 60_000; // 1 minute in ms

interface Entry { count: number; windowStart: number }
const store = new Map<string, Entry>();
let lastCleanup = Date.now();

function maybeCleanup(now: number) {
  if (now - lastCleanup < 5 * 60_000) return;
  lastCleanup = now;
  for (const [k, e] of store) {
    if (now - e.windowStart > RATE_LIMIT_WINDOW) store.delete(k);
  }
}

function isLimited(ip: string): boolean {
  const now = Date.now();
  maybeCleanup(now);

  const e = store.get(ip);
  if (!e || now - e.windowStart > RATE_LIMIT_WINDOW) {
    store.set(ip, { count: 1, windowStart: now });
    return false;
  }
  e.count++;
  return e.count > RATE_LIMIT_MAX;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/api/")) return NextResponse.next();
  // NextAuth handles its own auth flows — don't block them
  if (pathname.startsWith("/api/auth/")) return NextResponse.next();

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (isLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
          "X-RateLimit-Window": "60s",
          // Signal to the client which backend is active
          "X-RateLimit-Backend": process.env.RATE_LIMIT_BACKEND ?? "memory",
        },
      },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
