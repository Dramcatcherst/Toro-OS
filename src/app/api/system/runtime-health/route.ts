import { internalCapabilityEnabled, publicDemoResponse } from "@/lib/server/public-demo";
import { withAuthBudget } from "@/features/auth/request-budget";
import { SUPABASE_READ_TIMEOUT_MS } from "@/lib/supabase/read-fetch";
import { createWorkerSupabaseClient } from "@/lib/supabase/worker";
import {
  buildToroRuntimeHealthConfig,
  isToroRuntimeHealthAuthorized,
  isToroRuntimeHealthEnabled,
} from "@/features/runtime/health";

function noStoreHeaders() {
  return {
    "cache-control": "no-store, max-age=0",
  };
}

export async function GET(request: Request) {
  const demo = publicDemoResponse();
  if (demo) return demo;
  if (!internalCapabilityEnabled("TORO_RUNTIME_HEALTH_ENABLED") || !isToroRuntimeHealthEnabled(process.env)) {
    return new Response(null, {
      status: 404,
      headers: noStoreHeaders(),
    });
  }

  if (
    !isToroRuntimeHealthAuthorized(
      request.headers.get("authorization"),
      process.env,
    )
  ) {
    return Response.json(
      { state: "unauthorized" },
      { status: 401, headers: noStoreHeaders() },
    );
  }

  const config = buildToroRuntimeHealthConfig(process.env);

  if (
    !config.authConfigured ||
    !config.supabasePublicConfigured ||
    !config.workerSecretConfigured
  ) {
    return Response.json(
      {
        state: "unconfigured",
        config,
        controlPlane: {
          reachable: false,
          runsReadable: false,
          receiptsReadable: false,
        },
      },
      { status: 503, headers: noStoreHeaders() },
    );
  }

  try {
    const [runs, receipts] = await withAuthBudget(SUPABASE_READ_TIMEOUT_MS, async signal => {
      const supabase = createWorkerSupabaseClient({ signal });
      return Promise.all([
      supabase
        .from("toro_execution_runs")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("toro_execution_receipts")
        .select("id", { count: "exact", head: true }),
      ]);
    }, request.signal);

    const runsReadable = !runs.error;
    const receiptsReadable = !receipts.error;
    const reachable = runsReadable && receiptsReadable;

    return Response.json(
      {
        state: reachable ? "ready" : "degraded",
        config,
        controlPlane: {
          reachable,
          runsReadable,
          receiptsReadable,
          runCount: runsReadable ? (runs.count ?? null) : null,
          receiptCount: receiptsReadable ? (receipts.count ?? null) : null,
        },
      },
      {
        status: reachable ? 200 : 503,
        headers: noStoreHeaders(),
      },
    );
  } catch {
    return Response.json(
      {
        state: "degraded",
        config,
        controlPlane: {
          reachable: false,
          runsReadable: false,
          receiptsReadable: false,
        },
      },
      { status: 503, headers: noStoreHeaders() },
    );
  }
}
