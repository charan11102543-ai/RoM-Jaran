"use client";

import { useState } from "react";
import type { AgentSummary } from "./types";
import { AgentTypeBadge, EnvBadge } from "./agent-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const AGENT_TYPES = [
  { value: "LEAD_QUALIFIER", label: "Lead Qualifier", icon: "🤖" },
  { value: "CONTENT_AUTOMATION", label: "Content Automation", icon: "✍️" },
  { value: "EMAIL_AUTOMATION", label: "Email Automation", icon: "📧" },
  { value: "N8N_ORCHESTRATOR", label: "n8n Orchestrator", icon: "⚙️" },
  { value: "CRM_MANAGER", label: "CRM Manager", icon: "📊" },
];

interface PingResult { reachable: boolean; latencyMs: number | null; error: string | null }

function AgentRow({
  agent,
  onToggle,
  toggling,
}: {
  agent: AgentSummary;
  onToggle: (a: AgentSummary) => void;
  toggling: boolean;
}) {
  const [ping, setPing] = useState<PingResult | null>(null);
  const [pinging, setPinging] = useState(false);
  const icon = AGENT_TYPES.find((t) => t.value === agent.type)?.icon ?? "🔧";

  async function doPing() {
    setPinging(true);
    try {
      const res = await fetch(`/api/agents/${agent.id}/ping`, { method: "POST" });
      if (res.ok) setPing(await res.json());
    } finally {
      setPinging(false);
    }
  }

  return (
    <div
      className={cn(
        "rounded-[24px] border border-[var(--border)] bg-white/80 p-5 shadow-sm transition-opacity",
        !agent.isActive && "opacity-60",
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--muted)] text-2xl">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{agent.name}</p>
            <button
              disabled={toggling}
              onClick={() => onToggle(agent)}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium transition",
                agent.isActive
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200",
              )}
            >
              {toggling ? "…" : agent.isActive ? "● Active" : "○ Inactive"}
            </button>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <AgentTypeBadge type={agent.type} />
            <EnvBadge environment={agent.environment} />
          </div>
          {agent.description && (
            <p className="mt-2 text-xs leading-relaxed text-[var(--muted-foreground)]">
              {agent.description}
            </p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <StatCell label="Tasks" value={agent._count.tasks} />
        <StatCell label="Spaces" value={agent.spaces.length} />
        <StatCell
          label="Type"
          value={agent.environment === "CLOUD" ? "☁ Cloud" : "⬡ Local"}
          small
        />
      </div>

      {/* Spaces */}
      {agent.spaces.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {agent.spaces.map(({ space }) => (
            <span
              key={space.id}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${space.color}20`, color: space.color }}
            >
              {space.name}
            </span>
          ))}
        </div>
      )}

      {/* Cloud endpoint + ping */}
      {agent.environment === "CLOUD" && agent.endpoint && (
        <div className="mt-3 flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-xs font-mono text-[var(--muted-foreground)]">
            {agent.endpoint}
          </span>
          <button
            onClick={doPing}
            disabled={pinging}
            className="shrink-0 rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium hover:bg-[var(--muted)]"
          >
            {pinging ? "Pinging…" : "Ping"}
          </button>
          {ping && (
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                ping.reachable ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700",
              )}
            >
              {ping.reachable
                ? `✓ ${ping.latencyMs != null ? `${ping.latencyMs}ms` : "reachable"}`
                : `✕ ${ping.error ?? "unreachable"}`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function StatCell({ label, value, small }: { label: string; value: string | number; small?: boolean }) {
  return (
    <div className="rounded-xl bg-[var(--muted)]/60 p-2">
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      <p className={cn("mt-0.5 font-semibold", small ? "text-sm" : "text-xl")}>{value}</p>
    </div>
  );
}

interface Props {
  agents: AgentSummary[];
  onRefresh: () => void;
}

export function AgentRegistryPanel({ agents, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("LEAD_QUALIFIER");
  const [env, setEnv] = useState("LOCAL");
  const [description, setDescription] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState("");
  const [filterEnv, setFilterEnv] = useState<string>("");

  const filtered = filterEnv
    ? agents.filter((a) => a.environment === filterEnv)
    : agents;

  async function registerAgent(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          environment: env,
          description: description || undefined,
          endpoint: endpoint || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(JSON.stringify(d.error ?? "Failed"));
        return;
      }
      setName(""); setDescription(""); setEndpoint("");
      setShowForm(false);
      onRefresh();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(agent: AgentSummary) {
    setToggling(agent.id);
    setToggleError("");
    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !agent.isActive }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setToggleError(JSON.stringify(d.error ?? "Toggle failed"));
        return;
      }
      onRefresh();
    } finally {
      setToggling(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Agent Registry</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {agents.length} registered · {agents.filter((a) => a.isActive).length} active
            · {agents.filter((a) => a.environment === "CLOUD").length} cloud
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={filterEnv}
            onChange={(e) => setFilterEnv(e.target.value)}
            className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm focus:outline-none"
          >
            <option value="">All environments</option>
            <option value="LOCAL">Local</option>
            <option value="CLOUD">Cloud</option>
          </select>
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "+ Register Agent"}
          </Button>
        </div>
      </div>

      {/* Registration form */}
      {showForm && (
        <form
          onSubmit={registerAgent}
          className="rounded-[28px] border border-[var(--border)] bg-white/80 p-6 shadow-sm space-y-4"
        >
          <h3 className="font-semibold">Register New Agent</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Name *</label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Lead Qualifier Bot"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-full border border-[var(--border)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                {AGENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.icon} {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Environment</label>
              <div className="flex gap-2">
                {["LOCAL", "CLOUD"].map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEnv(e)}
                    className={cn(
                      "flex-1 rounded-full border py-2 text-sm font-medium transition",
                      env === e
                        ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                        : "border-[var(--border)] bg-white",
                    )}
                  >
                    {e === "CLOUD" ? "☁ Cloud" : "⬡ Local"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Endpoint {env === "CLOUD" && <span className="text-rose-500">*</span>}
              </label>
              <Input
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://n8n.example.com/webhook/…"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this agent do?"
            />
          </div>
          {error && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
          )}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? "Saving…" : "Register"}
            </Button>
          </div>
        </form>
      )}

      {toggleError && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{toggleError}</p>
      )}

      {/* Agent grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((agent) => (
          <AgentRow
            key={agent.id}
            agent={agent}
            onToggle={toggleActive}
            toggling={toggling === agent.id}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-[var(--muted-foreground)]">
            {filterEnv ? `No ${filterEnv.toLowerCase()} agents registered.` : "No agents registered yet."}
          </div>
        )}
      </div>
    </div>
  );
}
