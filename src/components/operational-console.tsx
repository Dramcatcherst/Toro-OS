"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, DatabaseZap, GitPullRequestCreate, History, KeyRound, Server, XCircle } from "lucide-react";
import { auditEvents, connectorEndpoints, workspaceRoles } from "@/lib/toro-data";
import type { ApprovalRecord, ApprovalState, ApprovalSummary, ConnectorHealthRecord, SourceMeta } from "@/lib/toro-types";

function tone(state: ApprovalState) {
  return state === "Approved"
    ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-100"
    : state === "Rejected"
      ? "border-red-400/35 bg-red-400/10 text-red-100"
      : state === "Needs changes"
        ? "border-amber-300/35 bg-amber-300/10 text-amber-100"
        : "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
}

function MiniPill({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`inline-flex rounded-sm border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${className}`}>{children}</span>;
}

function MiniMeta({ item }: { item: SourceMeta }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 md:grid-cols-3">
      <div><span className="text-slate-500">Source</span><br />{item.source}</div>
      <div><span className="text-slate-500">Status</span><br />{item.status}</div>
      <div><span className="text-slate-500">Risk</span><br />{item.risk}</div>
      <div><span className="text-slate-500">Confidence</span><br />{item.confidence}%</div>
      <div><span className="text-slate-500">Approval</span><br />{item.approval}</div>
      <div><span className="text-slate-500">Next</span><br />{item.nextAction}</div>
    </div>
  );
}

export function OperationalConsole({ initialApprovals }: { initialApprovals: ApprovalRecord[] }) {
  const [approvals, setApprovals] = useState(initialApprovals);
  const [connectorHealth, setConnectorHealth] = useState<ConnectorHealthRecord[]>([]);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [serverMode, setServerMode] = useState("server_persisted");

  const summary = useMemo(() => {
    return approvals.reduce<ApprovalSummary>(
      (acc, approval) => {
        acc[approval.state] += 1;
        return acc;
      },
      { Pending: 0, Approved: 0, Rejected: 0, "Needs changes": 0 },
    );
  }, [approvals]);

  useEffect(() => {
    async function hydrate() {
      const [approvalResponse, connectorResponse] = await Promise.all([
        fetch("/api/approvals", { cache: "no-store" }),
        fetch("/api/connector-health", { cache: "no-store" }),
      ]);

      if (approvalResponse.ok) {
        const approvalPayload = await approvalResponse.json();
        setApprovals(approvalPayload.approvals ?? initialApprovals);
        setServerMode(approvalPayload.mode ?? "server_persisted");
      }

      if (connectorResponse.ok) {
        const connectorPayload = await connectorResponse.json();
        setConnectorHealth(connectorPayload.records ?? []);
      }
    }

    void hydrate();
  }, [initialApprovals]);

  async function setState(id: string, state: ApprovalState) {
    setIsSaving(id);

    const response = await fetch("/api/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, state }),
    });

    if (response.ok) {
      const payload = await response.json();
      setApprovals(payload.approvals ?? initialApprovals);
      setServerMode(payload.mode ?? "server_persisted");
    }

    setIsSaving(null);
  }

  return (
    <section id="live-ops" className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="border border-cyan-400/12 bg-slate-950/72">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-cyan-300" />
            <h2 className="text-sm font-semibold text-white">Persistent Approval Console</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <MiniPill className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100">{serverMode}</MiniPill>
            {(Object.keys(summary) as ApprovalState[]).map((state) => (
              <MiniPill key={state} className={tone(state)}>{summary[state]} {state}</MiniPill>
            ))}
          </div>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-2">
          {approvals.map((approval) => (
            <article key={approval.id} className="border border-slate-800 bg-black/25 p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">{approval.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">{approval.module} / {approval.targetTool}</p>
                </div>
                <MiniPill className={tone(approval.state)}>{approval.state}</MiniPill>
              </div>
              <MiniMeta item={approval} />
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button disabled={isSaving === approval.id} onClick={() => void setState(approval.id, "Approved")} className="border border-emerald-400/30 bg-emerald-400/10 px-2 py-2 text-xs text-emerald-100 disabled:opacity-50"><CheckCircle2 className="mx-auto mb-1 h-4 w-4" />Approve</button>
                <button disabled={isSaving === approval.id} onClick={() => void setState(approval.id, "Needs changes")} className="border border-amber-300/30 bg-amber-300/10 px-2 py-2 text-xs text-amber-100 disabled:opacity-50">Revise</button>
                <button disabled={isSaving === approval.id} onClick={() => void setState(approval.id, "Rejected")} className="border border-red-400/30 bg-red-400/10 px-2 py-2 text-xs text-red-100 disabled:opacity-50"><XCircle className="mx-auto mb-1 h-4 w-4" />Reject</button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="border border-cyan-400/12 bg-slate-950/72">
          <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
            <Server className="h-4 w-4 text-cyan-300" />
            <h2 className="text-sm font-semibold text-white">Server Connector Health</h2>
          </div>
          <div className="space-y-2 p-4">
            {connectorHealth.map((connector) => (
              <div key={connector.id} className="border border-slate-800 bg-black/25 p-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-white">{connector.name}</h3>
                  <MiniPill className={connector.mode === "blocked" ? "border-red-400/30 bg-red-400/10 text-red-100" : connector.live ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100" : "border-cyan-400/30 bg-cyan-400/10 text-cyan-100"}>{connector.mode}</MiniPill>
                </div>
                <p className="mt-1 text-xs text-slate-400">{connector.detail}</p>
                <p className="mt-2 text-[11px] text-slate-500">Configured: {connector.configured ? "yes" : "no"} / Live: {connector.live ? "yes" : "no"}</p>
              </div>
            ))}
            <div className="border border-slate-800 bg-black/25 p-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-white">Connector API Scaffolds</h3>
                <MiniPill className="border-slate-700 bg-slate-900 text-slate-300">{connectorEndpoints.length} routes</MiniPill>
              </div>
              <p className="mt-2 text-xs text-slate-500">The route surfaces below remain available as safe API scaffolds.</p>
            </div>
            {connectorEndpoints.map((endpoint) => (
              <div key={endpoint.id} className="border border-slate-800 bg-black/25 p-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-white">{endpoint.name}</h3>
                  <MiniPill className={endpoint.mode === "blocked" ? "border-red-400/30 bg-red-400/10 text-red-100" : "border-cyan-400/30 bg-cyan-400/10 text-cyan-100"}>{endpoint.mode}</MiniPill>
                </div>
                <p className="mt-1 font-mono text-[11px] text-slate-400">{endpoint.method} {endpoint.route}</p>
                <p className="mt-2 text-xs text-slate-500">{endpoint.envRequired.length ? endpoint.envRequired.join(", ") : "No env required"}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-cyan-400/12 bg-slate-950/72">
          <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
            <GitPullRequestCreate className="h-4 w-4 text-cyan-300" />
            <h2 className="text-sm font-semibold text-white">Roles / Workspaces</h2>
          </div>
          <div className="space-y-2 p-4">
            {workspaceRoles.map((role) => (
              <div key={role.id} className="border border-slate-800 bg-black/25 p-3">
                <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-white">{role.role}</h3><span className="text-xs text-amber-200">{role.workspace}</span></div>
                <p className="mt-2 text-xs text-slate-400">Allowed: {role.permissions.join(", ")}</p>
                <p className="mt-1 text-xs text-slate-500">Blocked: {role.blocked.join(", ")}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-cyan-400/12 bg-slate-950/72">
          <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
            <History className="h-4 w-4 text-cyan-300" />
            <h2 className="text-sm font-semibold text-white">Audit Log</h2>
          </div>
          <div className="space-y-2 p-4">
            {auditEvents.map((event) => (
              <div key={event.id} className="border border-slate-800 bg-black/25 p-3">
                <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-white">{event.event}</h3><MiniPill className="border-slate-700 bg-slate-900 text-slate-300">{event.outcome}</MiniPill></div>
                <p className="mt-1 text-xs text-slate-400">{event.actor} / {event.target}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-cyan-400/12 bg-slate-950/72 p-4">
          <div className="flex gap-2 text-xs text-slate-300">
            <DatabaseZap className="h-4 w-4 shrink-0 text-amber-200" />
            Approval decisions now persist through a server-managed cookie ledger. No external business system is modified.
          </div>
        </div>
      </div>
    </section>
  );
}
