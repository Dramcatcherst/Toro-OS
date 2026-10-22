import "server-only";
import { internalCapabilityEnabled } from "./public-demo";

export type ReadOnlyConnectorResult<T> = {
  configured: boolean;
  externalWrite: false;
  mode: "read_only";
  data: T | null;
  error: string | null;
};

export const READ_ONLY_CONNECTOR_TIMEOUT_MS = 8_000;

async function readProviderJson(
  url: URL,
  token: string,
  provider: "Airtable" | "Vercel",
  collection: "records" | "deployments",
): Promise<ReadOnlyConnectorResult<unknown>> {
  const controller = new AbortController();
  let timedOut = false;
  // Keep cancellation armed until body consumption completes, not only headers.
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, READ_ONLY_CONNECTOR_TIMEOUT_MS);
  const failure = (error: string): ReadOnlyConnectorResult<unknown> => ({
    configured: true, externalWrite: false, mode: "read_only", data: null, error,
  });
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: controller.signal,
      redirect: "error",
    });
    if (!response.ok) return failure(`${provider} read failed with ${response.status}.`);
    const data: unknown = await response.json();
    const records = data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)[collection] : null;
    if (!Array.isArray(records) || records.some((entry) => !entry || typeof entry !== "object" || Array.isArray(entry))) {
      return failure(`${provider} returned an invalid read response.`);
    }
    return { configured: true, externalWrite: false, mode: "read_only", data, error: null };
  } catch {
    // Provider errors may contain request headers/URLs. Return only fixed text.
    return failure(timedOut ? `${provider} read timed out.` : `${provider} read failed.`);
  } finally {
    clearTimeout(timer);
  }
}

export async function readAirtableRecords(input: {
  baseId: string;
  tableId: string;
  pageSize?: number;
}): Promise<ReadOnlyConnectorResult<unknown>> {
  if (!internalCapabilityEnabled("TORO_LEGACY_OPERATIONS_ENABLED")) {
    return { configured: false, externalWrite: false, mode: "read_only", data: null, error: "Operational reads are disabled." };
  }
  const token = process.env.AIRTABLE_TOKEN?.trim();

  if (!token) {
    return {
      configured: false,
      externalWrite: false,
      mode: "read_only",
      data: null,
      error: "AIRTABLE_TOKEN is not configured. Returning scaffold metadata only.",
    };
  }

  const url = new URL(`https://api.airtable.com/v0/${encodeURIComponent(input.baseId)}/${encodeURIComponent(input.tableId)}`);
  url.searchParams.set("pageSize", String(input.pageSize ?? 10));

  return readProviderJson(url, token, "Airtable", "records");
}

export async function readVercelDeployments(input: {
  projectId: string;
  teamId?: string;
}): Promise<ReadOnlyConnectorResult<unknown>> {
  if (!internalCapabilityEnabled("TORO_LEGACY_OPERATIONS_ENABLED")) {
    return { configured: false, externalWrite: false, mode: "read_only", data: null, error: "Operational reads are disabled." };
  }
  const token = process.env.VERCEL_TOKEN?.trim();

  if (!token) {
    return {
      configured: false,
      externalWrite: false,
      mode: "read_only",
      data: null,
      error: "VERCEL_TOKEN is not configured. Returning scaffold metadata only.",
    };
  }

  const url = new URL("https://api.vercel.com/v6/deployments");
  url.searchParams.set("projectId", input.projectId);
  if (input.teamId) {
    url.searchParams.set("teamId", input.teamId);
  }

  return readProviderJson(url, token, "Vercel", "deployments");
}
