import "server-only";

import { airtableBase, connectors } from "@/lib/toro-data";
import {
  readAirtableRecords,
  readKrossPublicHealth,
  readSupabaseHealth,
  readVercelDeployments,
} from "@/lib/server/read-only-connectors";
import { getToroVercelRuntimeConfig } from "@/lib/server/vercel-runtime";
import type { Connector, ConnectorHealthRecord } from "@/lib/toro-types";

const supabaseConnector: Connector = {
  id: "supabase",
  name: "Supabase",
  category: "Runtime data",
  mode: "Read-only health probe + governed app runtime",
  authority: "Canonical relational runtime for TORO OS governed domains",
  currentCapability: "Governed runtime reads behind Supabase RLS; live commercial truth remains external where declared.",
  futureConnectorNeed: "Keep health probe read-only and expand only through reviewed domain contracts.",
  allowedActions: ["observe", "analyze"],
  source: "TORO OS canonical runtime architecture",
  status: "Active",
  risk: "High",
  confidence: 96,
  approval: "Human review",
  nextAction: "Use live probe status before claiming Supabase is connected.",
};

function summarizeVercelLiveRead(data: unknown) {
  const deployments = (data as { deployments?: Array<{ name?: string; state?: string; url?: string }> } | null)?.deployments;
  if (!Array.isArray(deployments) || deployments.length === 0) {
    return null;
  }

  const latest = deployments[0];
  return latest ? `${latest.name ?? "deployment"} / ${latest.state ?? "unknown"} / ${latest.url ?? "no-url"}` : null;
}

export async function getConnectorHealth(): Promise<{
  records: ConnectorHealthRecord[];
  summary: { live: number; configured: number; blocked: number; degraded: number };
}> {
  const checkedAt = new Date().toISOString();
  const vercelRuntime = getToroVercelRuntimeConfig();
  const configuredAirtableBaseId = process.env.AIRTABLE_BASE_ID;
  const airtableReadPromise = configuredAirtableBaseId
    ? readAirtableRecords({
        baseId: configuredAirtableBaseId,
        tableId: airtableBase.blueprintTableId,
        pageSize: 1,
      })
    : Promise.resolve({
        configured: false,
        data: null,
        error: "AIRTABLE_BASE_ID is not configured; implicit Master Brain fallback is disabled.",
      });

  const [airtableRead, vercelRead, supabaseRead, krossPublicRead] = await Promise.all([
    airtableReadPromise,
    readVercelDeployments({
      projectId: vercelRuntime.projectId,
      teamId: vercelRuntime.teamId,
    }),
    readSupabaseHealth(),
    readKrossPublicHealth(),
  ]);

  const runtimeConnectors = [supabaseConnector, ...connectors];
  const records = runtimeConnectors.map<ConnectorHealthRecord>((connector) => {
    if (connector.id === "supabase") {
      const live = Boolean(supabaseRead.data?.reachable);
      return {
        ...connector,
        configured: supabaseRead.configured,
        live,
        mode: live ? "live_read" : "read_only",
        health: live
          ? "reachable"
          : supabaseRead.configured
            ? "degraded"
            : "unconfigured",
        checkedAt,
        detail: live
          ? "Supabase respondió a una prueba read-only del runtime canónico."
          : supabaseRead.error ?? "Supabase no respondió a la prueba runtime.",
      };
    }

    if (connector.id === "airtable") {
      const hasLiveData = Boolean((airtableRead.data as { records?: unknown[] } | null)?.records?.length);
      return {
        ...connector,
        configured: airtableRead.configured,
        live: hasLiveData,
        mode: hasLiveData ? "live_read" : "read_only",
        health: hasLiveData
          ? "reachable"
          : airtableRead.configured
            ? "degraded"
            : "unconfigured",
        checkedAt,
        detail: hasLiveData
          ? "Airtable respondió a una lectura read-only del Blueprint."
          : airtableRead.error ?? "Airtable no respondió a la prueba runtime.",
      };
    }

    if (connector.id === "vercel") {
      const detail = summarizeVercelLiveRead(vercelRead.data);
      return {
        ...connector,
        configured: vercelRead.configured,
        live: Boolean(detail),
        mode: detail ? "live_read" : "read_only",
        health: detail
          ? "reachable"
          : vercelRead.configured
            ? "degraded"
            : "unconfigured",
        checkedAt,
        detail: detail
          ? `${detail} · Proyecto canónico: ${vercelRuntime.projectName} / ${vercelRuntime.repository}`
          : vercelRead.error ?? `Vercel no respondió para ${vercelRuntime.projectName}.`,
      };
    }

    if (connector.id === "kross") {
      const publicReachable = Boolean(krossPublicRead.data?.reachable);
      return {
        ...connector,
        configured: true,
        live: false,
        mode: "read_only",
        health: publicReachable ? "configured_unverified" : "degraded",
        checkedAt,
        detail: publicReachable
          ? "Motor público Kross reachable. Operación autenticada no verificada; no usar este probe para afirmar ocupación, llegadas, salidas, disponibilidad o reservas live."
          : krossPublicRead.error ?? "Kross público no respondió; operación autenticada tampoco está verificada.",
      };
    }

    const configured = connector.status === "Active" || connector.status === "Ready";
    const blocked = connector.status === "Blocked" || connector.status === "Not connected";

    return {
      ...connector,
      configured,
      live: false,
      mode: blocked ? "blocked" : configured ? "prepare_only" : "read_only",
      health: blocked
        ? "blocked"
        : configured
          ? "configured_unverified"
          : "unconfigured",
      checkedAt: null,
      detail: blocked
        ? `${connector.currentCapability} · Sin conexión runtime habilitada.`
        : configured
          ? `${connector.currentCapability} · Configurado, pero sin prueba runtime activa.`
          : `${connector.currentCapability} · No hay prueba runtime ni configuración live confirmada.`,
    };
  });

  return {
    records,
    summary: {
      live: records.filter((record) => record.live).length,
      configured: records.filter((record) => record.configured).length,
      blocked: records.filter((record) => record.health === "blocked").length,
      degraded: records.filter((record) => record.health === "degraded").length,
    },
  };
}
