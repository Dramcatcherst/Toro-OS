import { NextResponse } from "next/server";

import {
  loadHumanLayerRuntimeConfig,
  type HumanLayerRuntimeConfig,
} from "@/lib/server/human-layer-config";
import { authorizeOpenClawStatus } from "@/lib/server/machine-auth";
import { getOperationalStatus } from "@/lib/server/operational-status";

export const runtime = "nodejs";

const VERSION_RE = /^TORO-HUMAN-LAYER-v\d+(?:\.\d+)?$/;
const HASH_RE = /^sha256:[0-9a-f]{64}$/;

type HumanLayerAck = {
  state:
    | "match"
    | "mismatch"
    | "not_reported"
    | "invalid_report"
    | "source_unverified";
  versionMatches: boolean | null;
  hashMatches: boolean | null;
};

function getHumanLayerAck(
  request: Request,
  humanLayer: HumanLayerRuntimeConfig,
): HumanLayerAck {
  if (
    humanLayer.state !== "verified" ||
    !humanLayer.configVersion ||
    !humanLayer.configHash
  ) {
    return {
      state: "source_unverified",
      versionMatches: null,
      hashMatches: null,
    };
  }

  const reportedVersion = request.headers
    .get("x-toro-human-layer-version")
    ?.trim();
  const reportedHash = request.headers.get("x-toro-human-layer-hash")?.trim();

  if (!reportedVersion && !reportedHash) {
    return {
      state: "not_reported",
      versionMatches: null,
      hashMatches: null,
    };
  }

  if (
    !reportedVersion ||
    !reportedHash ||
    !VERSION_RE.test(reportedVersion) ||
    !HASH_RE.test(reportedHash)
  ) {
    return {
      state: "invalid_report",
      versionMatches: null,
      hashMatches: null,
    };
  }

  const versionMatches = reportedVersion === humanLayer.configVersion;
  const hashMatches = reportedHash === humanLayer.configHash;

  return {
    state: versionMatches && hashMatches ? "match" : "mismatch",
    versionMatches,
    hashMatches,
  };
}

export async function GET(request: Request) {
  const auth = authorizeOpenClawStatus(request);
  if (!auth.ok) return auth.response;

  const [status, humanLayer] = await Promise.all([
    getOperationalStatus(),
    loadHumanLayerRuntimeConfig(),
  ]);
  const humanLayerAck = getHumanLayerAck(request, humanLayer);

  return NextResponse.json(
    {
      version: status.version,
      generatedAt: status.generatedAt,
      currentHotelClaimsAllowed: status.currentHotelClaimsAllowed,
      hotel: status.hotel,
      sourceSummary: status.sources.summary,
      warnings: status.warnings,
      chatSummary: status.chatSummary,
      humanLayer,
      humanLayerAck,
    },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    },
  );
}
