"use client";

import { useState } from "react";
import type { AgentSummary, SpaceSummary } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#0f766e", "#7c3aed", "#d97706", "#0284c7",
  "#dc2626", "#16a34a", "#9333ea", "#ea580c",
];

interface SpaceCardProps {
  space: SpaceSummary;
  agents: AgentSummary[];
  onSave: (id: string, data: Partial<SpaceSummary> & { agentIds?: string[] }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function SpaceCard({ space, agents, onSave, onDelete }: SpaceCardProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(space.name);
  const [description, setDescription] = useState(space.description ?? "");
  const [color, setColor] = useState(space.color);
  const [agentIds, setAgentIds] = useState(
    space.agents.map((sa) => sa.agent.id),
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function save() {
    setSaving(true);
    setSaveError("");
    try {
      await onSave(space.id, { name, description, color, agentIds });
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete space "${space.name}"? Tasks won't be deleted but will lose their space.`)) return;
    setDeleting(true);
    try { await onDelete(space.id); } finally { setDeleting(false); }
  }

  function toggleAgent(id: string) {
    setAgentIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  }

  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-white/80 p-5 shadow-sm">
      {!editing ? (
        <>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <span
                className="h-10 w-10 shrink-0 rounded-2xl"
                style={{ backgroundColor: space.color }}
              />
              <div>
                <p className="font-semibold">{space.name}</p>
                {space.description && (
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{space.description}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-[var(--muted)]"
              >
                Edit
              </button>
              <button
                onClick={remove}
                disabled={deleting}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
              >
                {deleting ? "…" : "Delete"}
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)]">
            <span>{space._count.tasks} tasks</span>
            <span>·</span>
            <span>{space.agents.length} agents assigned</span>
          </div>
          {space.agents.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {space.agents.map(({ agent }) => (
                <span key={agent.id} className="rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-xs">
                  {agent.name}
                </span>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-full transition",
                    color === c && "ring-2 ring-offset-2 ring-[var(--foreground)]",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Assigned Agents</label>
            <div className="flex flex-wrap gap-2">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => toggleAgent(agent.id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition",
                    agentIds.includes(agent.id)
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-[var(--border)] bg-white",
                  )}
                >
                  {agent.name}
                </button>
              ))}
            </div>
          </div>
          {saveError && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{saveError}</p>
          )}
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={save} disabled={saving || !name.trim()}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditing(false);
                setSaveError("");
                setName(space.name);
                setDescription(space.description ?? "");
                setColor(space.color);
                setAgentIds(space.agents.map((sa) => sa.agent.id));
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  spaces: SpaceSummary[];
  agents: AgentSummary[];
  onSpacesChange: (spaces: SpaceSummary[]) => void;
}

export function SpacesPanel({ spaces, agents, onSpacesChange }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [newAgentIds, setNewAgentIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function createSpace(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          description: newDesc || undefined,
          color: newColor,
          agentIds: newAgentIds,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(JSON.stringify(d.error ?? "Failed"));
        return;
      }
      const created: SpaceSummary = await res.json();
      onSpacesChange([...spaces, created]);
      setNewName(""); setNewDesc(""); setNewAgentIds([]);
      setShowCreate(false);
    } finally {
      setCreating(false);
    }
  }

  async function saveSpace(
    id: string,
    data: Partial<SpaceSummary> & { agentIds?: string[] },
  ) {
    const res = await fetch(`/api/spaces/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(JSON.stringify(d.error ?? "Save failed"));
    }
    const updated: SpaceSummary = await res.json();
    onSpacesChange(spaces.map((s) => (s.id === id ? updated : s)));
  }

  async function deleteSpace(id: string) {
    const res = await fetch(`/api/spaces/${id}`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      onSpacesChange(spaces.filter((s) => s.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Spaces</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {spaces.length} space{spaces.length !== 1 ? "s" : ""} — group agents and tasks into projects
          </p>
        </div>
        <Button onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? "Cancel" : "+ New Space"}
        </Button>
      </div>

      {showCreate && (
        <form
          onSubmit={createSpace}
          className="rounded-[28px] border border-[var(--border)] bg-white/80 p-6 shadow-sm space-y-4"
        >
          <h3 className="font-semibold">Create Space</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Name *</label>
              <Input required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Lead Pipeline" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Description</label>
              <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-full transition",
                    newColor === c && "ring-2 ring-offset-2 ring-[var(--foreground)]",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Assign Agents</label>
            <div className="flex flex-wrap gap-2">
              {agents.filter((a) => a.isActive).map((agent) => (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() =>
                    setNewAgentIds((prev) =>
                      prev.includes(agent.id)
                        ? prev.filter((id) => id !== agent.id)
                        : [...prev, agent.id],
                    )
                  }
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition",
                    newAgentIds.includes(agent.id)
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-[var(--border)] bg-white",
                  )}
                >
                  {agent.name}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" disabled={creating || !newName.trim()}>
              {creating ? "Creating…" : "Create Space"}
            </Button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {spaces.map((space) => (
          <SpaceCard
            key={space.id}
            space={space}
            agents={agents}
            onSave={saveSpace}
            onDelete={deleteSpace}
          />
        ))}
        {spaces.length === 0 && (
          <div className="col-span-full py-12 text-center text-[var(--muted-foreground)]">
            No spaces yet. Create one to group tasks and agents together.
          </div>
        )}
      </div>
    </div>
  );
}
