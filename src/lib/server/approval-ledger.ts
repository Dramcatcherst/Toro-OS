import "server-only";

import { get, put } from "@vercel/blob";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import type { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { approvalSeed } from "@/lib/approval-store";
import type { ApprovalRecord, ApprovalState, ApprovalSummary } from "@/lib/toro-types";

const COOKIE_NAME = "toro_os_approvals_v03";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
const LOCAL_LEDGER_PATH = path.join(process.cwd(), ".toro-data", "approval-ledger.json");
const BLOB_LEDGER_PATH = "toro-os/system/approval-ledger.json";

type LedgerBackend = "vercel_blob" | "local_file" | "cookie_fallback";

type LedgerState = {
  approvals: ApprovalRecord[];
  updatedAt: string;
};

function isApprovalState(value: unknown): value is ApprovalState {
  return value === "Pending" || value === "Approved" || value === "Rejected" || value === "Needs changes";
}

function buildSummary(approvals: ApprovalRecord[]): ApprovalSummary {
  return approvals.reduce<ApprovalSummary>(
    (acc, approval) => {
      acc[approval.state] += 1;
      return acc;
    },
    { Pending: 0, Approved: 0, Rejected: 0, "Needs changes": 0 },
  );
}

function normalizeApprovals(raw: unknown): ApprovalRecord[] {
  if (!Array.isArray(raw)) {
    return approvalSeed;
  }

  const seedById = new Map(approvalSeed.map((approval) => [approval.id, approval]));
  const next = raw
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Partial<ApprovalRecord>;
      const seed = record.id ? seedById.get(record.id) : null;
      if (!seed) {
        return null;
      }

      return {
        ...seed,
        state: isApprovalState(record.state) ? record.state : seed.state,
        updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : seed.updatedAt,
      } satisfies ApprovalRecord;
    })
    .filter((item): item is ApprovalRecord => Boolean(item));

  return next.length ? next : approvalSeed;
}

function normalizeState(raw: unknown): LedgerState {
  if (!raw || typeof raw !== "object") {
    return { approvals: approvalSeed, updatedAt: new Date().toISOString() };
  }

  const input = raw as Partial<LedgerState>;
  return {
    approvals: normalizeApprovals(input.approvals),
    updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : new Date().toISOString(),
  };
}

async function readBlobLedger(): Promise<LedgerState | null> {
  const result = await get(BLOB_LEDGER_PATH, { access: "private" });
  if (!result || result.statusCode !== 200 || !result.stream) {
    return null;
  }

  const text = await new Response(result.stream).text();
  return normalizeState(JSON.parse(text));
}

async function writeBlobLedger(state: LedgerState) {
  await put(BLOB_LEDGER_PATH, JSON.stringify(state, null, 2), {
    access: "private",
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: "application/json",
  });
}

async function readLocalLedger(): Promise<LedgerState | null> {
  try {
    const text = await readFile(LOCAL_LEDGER_PATH, "utf8");
    return normalizeState(JSON.parse(text));
  } catch {
    return null;
  }
}

async function writeLocalLedger(state: LedgerState) {
  await mkdir(path.dirname(LOCAL_LEDGER_PATH), { recursive: true });
  await writeFile(LOCAL_LEDGER_PATH, JSON.stringify(state, null, 2), "utf8");
}

async function readCookieLedger(): Promise<LedgerState | null> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  if (!value) {
    return null;
  }

  try {
    return normalizeState(JSON.parse(value));
  } catch {
    return null;
  }
}

function writeCookieLedger(store: ResponseCookies, state: LedgerState) {
  store.set(COOKIE_NAME, JSON.stringify(state), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

async function resolveBackend(): Promise<LedgerBackend> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return "vercel_blob";
  }

  if (!process.env.VERCEL) {
    return "local_file";
  }

  return "cookie_fallback";
}

export async function getApprovalLedger() {
  const backend = await resolveBackend();
  let state: LedgerState | null = null;

  if (backend === "vercel_blob") {
    state = await readBlobLedger();
  } else if (backend === "local_file") {
    state = await readLocalLedger();
  } else {
    state = await readCookieLedger();
  }

  const resolved = state ?? { approvals: approvalSeed, updatedAt: new Date().toISOString() };

  return {
    backend,
    mode: backend === "vercel_blob" ? "blob_persisted" : backend === "local_file" ? "file_persisted" : "cookie_fallback",
    approvals: resolved.approvals,
    summary: buildSummary(resolved.approvals),
    updatedAt: resolved.updatedAt,
    durable: backend === "vercel_blob" || backend === "local_file",
  };
}

export function applyApprovalUpdate(approvals: ApprovalRecord[], id: string, state: ApprovalState) {
  return approvals.map((approval) =>
    approval.id === id ? { ...approval, state, updatedAt: new Date().toISOString() } : approval,
  );
}

export async function persistApprovalLedger(approvals: ApprovalRecord[], responseCookies?: ResponseCookies) {
  const backend = await resolveBackend();
  const state: LedgerState = {
    approvals,
    updatedAt: new Date().toISOString(),
  };

  if (backend === "vercel_blob") {
    await writeBlobLedger(state);
  } else if (backend === "local_file") {
    await writeLocalLedger(state);
  } else {
    if (!responseCookies) {
      throw new Error("Cookie fallback requires response cookies.");
    }
    writeCookieLedger(responseCookies, state);
  }

  return {
    backend,
    mode: backend === "vercel_blob" ? "blob_persisted" : backend === "local_file" ? "file_persisted" : "cookie_fallback",
    durable: backend === "vercel_blob" || backend === "local_file",
    updatedAt: state.updatedAt,
  };
}
