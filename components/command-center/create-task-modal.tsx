"use client";

import { useState } from "react";
import type { AgentSummary, SpaceSummary, TaskPriority } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  agents: AgentSummary[];
  spaces: SpaceSummary[];
  onCreated: () => void;
  onClose: () => void;
}

export function CreateTaskModal({ agents, spaces, onCreated, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [agentId, setAgentId] = useState("");
  const [spaceId, setSpaceId] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("NORMAL");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          agentId: agentId || undefined,
          spaceId: spaceId || undefined,
          priority,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(JSON.stringify(d.error ?? "Failed"));
        return;
      }
      onCreated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-lg font-semibold">New Task</h2>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-[var(--muted)]">✕</button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Title *</label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Qualify new leads from LINE batch…"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional context or instructions…"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Agent</label>
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="w-full rounded-full border border-[var(--border)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">Unassigned</option>
                {agents.filter((a) => a.isActive).map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Space</label>
              <select
                value={spaceId}
                onChange={(e) => setSpaceId(e.target.value)}
                className="w-full rounded-full border border-[var(--border)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">No space</option>
                {spaces.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Priority</label>
            <div className="flex gap-2">
              {(["LOW", "NORMAL", "HIGH", "URGENT"] as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${
                    priority === p
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-[var(--border)] bg-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !title.trim()}>
              {saving ? "Creating…" : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
