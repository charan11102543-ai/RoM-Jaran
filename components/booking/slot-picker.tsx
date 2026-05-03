"use client";

import { useEffect, useState, useTransition } from "react";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

type SlotsResponse = {
  slots: string[];
};

export function SlotPicker({ leadId }: { leadId: string }) {
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadSlots() {
      const response = await fetch(`/api/slots?leadId=${leadId}`);
      const payload = (await response.json()) as SlotsResponse | { error: string };
      if (!response.ok || "error" in payload) {
        setError("Unable to load booking slots.");
        return;
      }

      setSlots(payload.slots);
      if (payload.slots[0]) {
        setSelectedSlot(payload.slots[0]);
      }
    }

    void loadSlots();
  }, [leadId]);

  async function createBooking() {
    setError("");
    setMessage("");

    const response = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, datetime: selectedSlot }),
    });

    const payload = (await response.json()) as { booking?: { datetime: string }; error?: string };
    if (!response.ok) {
      setError(payload.error ?? "Booking failed.");
      return;
    }

    setMessage(`Booked successfully for ${formatDateTime(payload.booking!.datetime)}.`);
  }

  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-[var(--muted)] p-2 text-[var(--primary)]">
          <CalendarClock className="h-5 w-5" />
        </span>
        <div>
          <CardTitle>Select a time slot</CardTitle>
          <CardDescription>Available slots are generated from your configured business hours.</CardDescription>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {slots.map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => setSelectedSlot(slot)}
            className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
              selectedSlot === slot
                ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                : "border-[var(--border)] bg-white hover:border-[var(--primary)]"
            }`}
          >
            {formatDateTime(slot)}
          </button>
        ))}
      </div>
      {!slots.length ? <p className="mt-6 text-sm text-[var(--muted-foreground)]">No slots available in the current booking window.</p> : null}
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
      <Button
        className="mt-6"
        disabled={!selectedSlot || isPending}
        onClick={() => {
          startTransition(() => {
            void createBooking();
          });
        }}
      >
        Confirm Booking
      </Button>
    </Card>
  );
}
