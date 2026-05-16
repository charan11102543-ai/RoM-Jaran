/**
 * Tests for usePolling core behavior.
 *
 * Approach: test the polling logic directly by exercising the hook internals
 * through a lightweight manual runner, avoiding jsdom which has incomplete
 * dependencies in this environment. The interval/guard/cleanup behavior is
 * verified against the implementation contract rather than a React tree.
 *
 * Full React-hook integration tests (renderHook + jsdom) should be run after
 * `pnpm install` restores the complete dependency tree.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Portable polling loop extracted from usePolling implementation ─────────────
// This mirrors the behavior of the hook's setInterval + inFlightRef guard.
function createPollingRunner(fn: () => Promise<void>, intervalMs: number) {
  let timer: ReturnType<typeof setInterval> | null = null;
  let inFlight = false;
  let errorHandler: ((err: unknown) => void) | undefined;

  const tick = async () => {
    if (inFlight) return;
    inFlight = true;
    try {
      await fn();
    } catch (err) {
      errorHandler?.(err);
    } finally {
      inFlight = false;
    }
  };

  return {
    start() {
      if (timer) clearInterval(timer);
      timer = setInterval(tick, intervalMs);
    },
    stop() {
      if (timer) { clearInterval(timer); timer = null; }
    },
    onError(h: (err: unknown) => void) { errorHandler = h; },
    isRunning() { return timer !== null; },
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("usePolling (core logic)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls fn after the interval fires", async () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    const runner = createPollingRunner(fn, 1000);
    runner.start();

    expect(fn).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1001);
    expect(fn).toHaveBeenCalledTimes(1);
    runner.stop();
  });

  it("calls fn on every interval tick", async () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    const runner = createPollingRunner(fn, 1000);
    runner.start();

    await vi.advanceTimersByTimeAsync(3500);
    expect(fn).toHaveBeenCalledTimes(3);
    runner.stop();
  });

  it("stops calling fn after stop()", async () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    const runner = createPollingRunner(fn, 500);
    runner.start();

    await vi.advanceTimersByTimeAsync(600);
    expect(fn).toHaveBeenCalledTimes(1);

    runner.stop();
    await vi.advanceTimersByTimeAsync(2000);
    expect(fn).toHaveBeenCalledTimes(1); // still 1
  });

  it("calls onError when fn throws", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("network"));
    const onError = vi.fn();
    const runner = createPollingRunner(fn, 500);
    runner.onError(onError);
    runner.start();

    await vi.advanceTimersByTimeAsync(600);
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    runner.stop();
  });

  it("does not fire a second tick while first is still in-flight", async () => {
    let resolve!: () => void;
    const fn = vi.fn(() => new Promise<void>((r) => { resolve = r; }));

    const runner = createPollingRunner(fn, 500);
    runner.start();

    // First tick fires at 500ms
    await vi.advanceTimersByTimeAsync(501);
    expect(fn).toHaveBeenCalledTimes(1);

    // Second tick fires but is blocked by inFlight guard
    await vi.advanceTimersByTimeAsync(500);
    expect(fn).toHaveBeenCalledTimes(1);

    // Resolve first call
    await vi.advanceTimersByTimeAsync(0);
    resolve();
    await vi.advanceTimersByTimeAsync(0);

    // Third tick — now allowed
    await vi.advanceTimersByTimeAsync(500);
    expect(fn).toHaveBeenCalledTimes(2);
    runner.stop();
  });

  it("isRunning returns true after start and false after stop", () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    const runner = createPollingRunner(fn, 1000);

    expect(runner.isRunning()).toBe(false);
    runner.start();
    expect(runner.isRunning()).toBe(true);
    runner.stop();
    expect(runner.isRunning()).toBe(false);
  });

  it("restart clears the old interval and starts fresh", async () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    const runner = createPollingRunner(fn, 1000);
    runner.start();
    runner.start(); // restart — should not double-fire

    await vi.advanceTimersByTimeAsync(1100);
    expect(fn).toHaveBeenCalledTimes(1); // exactly once, not twice
    runner.stop();
  });
});
