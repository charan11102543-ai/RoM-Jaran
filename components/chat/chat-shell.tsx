"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { MessageSquare, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency, titleCase } from "@/lib/utils";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

type ChatApiResponse = {
  message: string;
  data: {
    name: string | null;
    service: string | null;
    budget: number | null;
    datetime: string | null;
  };
  leadId: string | null;
  status: "new" | "qualified" | "booked" | "follow-up" | "closed";
  nextAction: "collect_info" | "offer_booking" | "confirm_booking";
};

const greeting: ChatMessage = {
  role: "assistant",
  content:
    "Hi, I am your AI lead qualification assistant. Tell me your name, the service you need, your budget, and your preferred date or time.",
};

export function ChatShell() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") {
      return [greeting];
    }

    const cached = window.localStorage.getItem("lead-chat:messages");
    return cached ? (JSON.parse(cached) as ChatMessage[]) : [greeting];
  });
  const [sessionToken] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const cached = window.localStorage.getItem("lead-chat:session");
    if (cached) {
      return cached;
    }

    const created = crypto.randomUUID();
    window.localStorage.setItem("lead-chat:session", created);
    return created;
  });
  const [leadId, setLeadId] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem("lead-chat:leadId");
  });
  const [draft, setDraft] = useState("");
  const [summary, setSummary] = useState<ChatApiResponse["data"] | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const cached = window.localStorage.getItem("lead-chat:summary");
    return cached ? (JSON.parse(cached) as ChatApiResponse["data"]) : null;
  });
  const [status, setStatus] = useState<ChatApiResponse["status"]>(() => {
    if (typeof window === "undefined") {
      return "new";
    }

    return (window.localStorage.getItem("lead-chat:status") as ChatApiResponse["status"] | null) ?? "new";
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startChatTransition] = useTransition();

  useEffect(() => {
    if (sessionToken) {
      window.localStorage.setItem("lead-chat:session", sessionToken);
    }
  }, [sessionToken]);

  useEffect(() => {
    window.localStorage.setItem("lead-chat:messages", JSON.stringify(messages));
  }, [messages]);

  async function sendMessage() {
    const message = draft.trim();
    if (!message || !sessionToken) {
      return;
    }

    setError(null);
    setDraft("");
    setMessages((current) => [...current, { role: "user", content: message }]);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionToken, message }),
    });

    const payload = (await response.json()) as ChatApiResponse | { error: string };

    if (!response.ok || "error" in payload) {
      const nextError = "error" in payload ? payload.error : "Chat request failed.";
      setError(nextError);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: "I hit an issue processing that. Please try again in a moment." },
      ]);
      return;
    }

    setMessages((current) => [...current, { role: "assistant", content: payload.message }]);
    setLeadId(payload.leadId);
    setSummary(payload.data);
    setStatus(payload.status);
    if (payload.leadId) {
      window.localStorage.setItem("lead-chat:leadId", payload.leadId);
    }
    window.localStorage.setItem("lead-chat:summary", JSON.stringify(payload.data));
    window.localStorage.setItem("lead-chat:status", payload.status);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <Card className="flex min-h-[680px] flex-col overflow-hidden p-0">
        <div className="border-b border-[var(--border)] bg-[var(--foreground)] px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/10 p-2">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">AI Qualification Chat</p>
              <p className="text-sm text-white/70">Collect real lead data and move them to booking.</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,rgba(248,250,252,0.75),rgba(255,255,255,0.95))] p-6">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-[24px] px-5 py-4 text-sm leading-7 shadow-sm",
                  message.role === "user"
                    ? "bg-[var(--primary)] text-white"
                    : "border border-[var(--border)] bg-white text-[var(--foreground)]",
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--border)] bg-white p-4">
          <div className="flex gap-3">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  startChatTransition(() => {
                    void sendMessage();
                  });
                }
              }}
              placeholder="Tell us what you need help automating..."
            />
            <Button
              disabled={isPending || !draft.trim()}
              onClick={() => {
                startChatTransition(() => {
                  void sendMessage();
                });
              }}
            >
              Send
            </Button>
          </div>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </div>
      </Card>

      <div className="space-y-6">
        <Card>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[var(--muted)] p-2 text-[var(--primary)]">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <CardTitle>Qualification Snapshot</CardTitle>
              <CardDescription>Structured extraction updates in real time.</CardDescription>
            </div>
          </div>
          <div className="mt-6 space-y-4 text-sm">
            <SummaryRow label="Name" value={summary?.name ?? "Waiting"} />
            <SummaryRow label="Service" value={summary?.service ?? "Waiting"} />
            <SummaryRow label="Budget" value={summary?.budget != null ? formatCurrency(summary.budget) : "Waiting"} />
            <SummaryRow
              label="Preferred time"
              value={summary?.datetime ? new Date(summary.datetime).toLocaleString() : "Waiting"}
            />
            <div className="flex items-center justify-between rounded-2xl bg-[var(--muted)] px-4 py-3">
              <span className="text-[var(--muted-foreground)]">Status</span>
              <Badge variant={status.toUpperCase().replace("-", "_")}>{titleCase(status.replace("-", "_"))}</Badge>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle>Next Step</CardTitle>
          <CardDescription className="mt-2">
            Qualified leads can jump directly into the booking flow with double-booking protection.
          </CardDescription>
          {status === "qualified" || status === "booked" ? (
            <Link
              href={leadId ? `/book/${leadId}` : "#"}
              className={cn(buttonVariants({ className: "mt-6 w-full" }), !leadId && "pointer-events-none opacity-50")}
            >
              Open Booking
            </Link>
          ) : (
            <p className="mt-6 text-sm text-[var(--muted-foreground)]">
              Keep chatting until the assistant has the service and a budget above threshold.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[var(--muted)] px-4 py-3">
      <span className="text-[var(--muted-foreground)]">{label}</span>
      <span className="max-w-[58%] text-right font-medium text-[var(--foreground)]">{value}</span>
    </div>
  );
}
