import "server-only";

export type ReadOnlyConnectorResult<T> = {
  configured: boolean;
  externalWrite: false;
  mode: "read_only";
  data: T | null;
  error: string | null;
};

export async function readAirtableRecords(input: {
  baseId: string;
  tableId: string;
  pageSize?: number;
}): Promise<ReadOnlyConnectorResult<unknown>> {
  const token = process.env.AIRTABLE_TOKEN;

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

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      configured: true,
      externalWrite: false,
      mode: "read_only",
      data: null,
      error: `Airtable read failed with ${response.status}.`,
    };
  }

  return {
    configured: true,
    externalWrite: false,
    mode: "read_only",
    data: await response.json(),
    error: null,
  };
}

export async function readVercelDeployments(input: {
  projectId: string;
  teamId?: string;
}): Promise<ReadOnlyConnectorResult<unknown>> {
  const token = process.env.VERCEL_TOKEN;

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

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      configured: true,
      externalWrite: false,
      mode: "read_only",
      data: null,
      error: `Vercel read failed with ${response.status}.`,
    };
  }

  return {
    configured: true,
    externalWrite: false,
    mode: "read_only",
    data: await response.json(),
    error: null,
  };
}
