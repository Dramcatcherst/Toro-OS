import "server-only";

import type { RequestCookies, ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { approvalSeed } from "@/lib/approval-store";
import type { ApprovalRecord, ApprovalState, ApprovalSummary } from "@/lib/toro-types";

const COOKIE_NAME = "toro_os_approvals_v03";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function isApprovalState(value: unknown): value is ApprovalState {
  return value === "Pending" || value === "Approved" || value === "Rejected" || value === "Needs changes";
}

function approvalSummary(approvals: ApprovalRecord[]): ApprovalSummary {
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

function parseCookieValue(cookieValue?: string) {
  if (!cookieValue) {
    return approvalSeed;
  }

  try {
    return normalizeApprovals(JSON.parse(cookieValue));
  } catch {
    return approvalSeed;
  }
}

export async function getApprovalLedger() {
  const store = await cookies();
  const approvals = parseCookieValue(store.get(COOKIE_NAME)?.value);
  return {
    approvals,
    summary: approvalSummary(approvals),
  };
}

export function applyApprovalUpdate(approvals: ApprovalRecord[], id: string, state: ApprovalState) {
  return approvals.map((approval) =>
    approval.id === id ? { ...approval, state, updatedAt: new Date().toISOString() } : approval,
  );
}

export function writeApprovalLedger(store: RequestCookies | ResponseCookies, approvals: ApprovalRecord[]) {
  store.set(COOKIE_NAME, JSON.stringify(approvals), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}
