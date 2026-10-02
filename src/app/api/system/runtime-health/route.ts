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
  if (!isToroRuntimeHealthEnabled(process.env)) {
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
    const supabase = createWorkerSupabaseClient();

    const [runs, receipts] = await Promise.all([
      supabase
        .from("toro_execution_runs")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("toro_execution_receipts")
        .select("id", { count: "exact", head: true }),
    ]);

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
