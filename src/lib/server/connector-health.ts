import "server-only";

import { airtableBase, connectors } from "@/lib/toro-data";
import { readAirtableRecords, readVercelDeployments } from "@/lib/server/read-only-connectors";
import type { ConnectorHealthRecord } from "@/lib/toro-types";

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
  summary: { live: number; configured: number; blocked: number };
}> {
  const airtableRead = await readAirtableRecords({
    baseId: process.env.AIRTABLE_BASE_ID ?? airtableBase.id,
    tableId: airtableBase.blueprintTableId,
    pageSize: 1,
  });

  const vercelRead = await readVercelDeployments({
    projectId: process.env.VERCEL_PROJECT_ID ?? "prj_nzsVpQZree5WuErakMPKIyiK6gsA",
    teamId: process.env.VERCEL_TEAM_ID ?? "team_zUbLBlOtoQBHDfGMYpDlg0XO",
  });

  const records = connectors.map<ConnectorHealthRecord>((connector) => {
    if (connector.id === "airtable") {
      const hasLiveData = Boolean((airtableRead.data as { records?: unknown[] } | null)?.records?.length);
      return {
        ...connector,
        configured: airtableRead.configured,
        live: hasLiveData,
        mode: hasLiveData ? "live_read" : "read_only",
        detail: hasLiveData
          ? "Blueprint table reachable through read-only server adapter."
          : airtableRead.error ?? "Waiting for read-only Airtable credentials.",
      };
    }

    if (connector.id === "vercel") {
      const detail = summarizeVercelLiveRead(vercelRead.data);
      return {
        ...connector,
        configured: vercelRead.configured,
        live: Boolean(detail),
        mode: detail ? "live_read" : "read_only",
        detail: detail ?? vercelRead.error ?? "Preview deployment metadata not available yet.",
      };
    }

    return {
      ...connector,
      configured: connector.status === "Active" || connector.status === "Ready",
      live: false,
      mode: connector.status === "Blocked" || connector.status === "Not connected" ? "blocked" : "prepare_only",
      detail: connector.currentCapability,
    };
  });

  return {
    records,
    summary: {
      live: records.filter((record) => record.live).length,
      configured: records.filter((record) => record.configured).length,
      blocked: records.filter((record) => record.mode === "blocked").length,
    },
  };
}
