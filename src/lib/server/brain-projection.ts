import "server-only";

import { loadCanonicalBrainReadSlice } from "@/features/brain/canonical-read";
import {
  buildCanonicalBrainLayout,
  buildCanonicalBrainProjection,
} from "@/features/brain/canonical-projection";
import { resolveToroContext } from "@/features/context/resolver";
import type { BrainProjection } from "@/lib/brain-contracts";
import {
  visualBrainDemo,
  visualBrainDemoLayout,
} from "@/lib/brain-fixtures";

export type BrainLayoutPoint = {
  x: number;
  y: number;
};

export type BrainLayout = Record<string, BrainLayoutPoint>;

export type BrainProjectionRuntime = {
  mode: "synthetic_only" | "canonical_read_only";
  realData: boolean;
  externalWrite: false;
  stage: "B" | "C";
  reason: string;
};

export type BrainProjectionView = {
  projection: BrainProjection;
  layout: BrainLayout;
  runtime: BrainProjectionRuntime;
};

function syntheticView(reason: string): BrainProjectionView {
  return {
    projection: visualBrainDemo,
    layout: visualBrainDemoLayout,
    runtime: {
      mode: "synthetic_only",
      realData: false,
      externalWrite: false,
      stage: "B",
      reason,
    },
  };
}

function canonicalReadEnabled() {
  return process.env.TORO_BRAIN_CANONICAL_READ_ENABLED === "true";
}

/**
 * Single server-side projection seam for the Visual Brain.
 *
 * Default/current production behavior remains synthetic-only until the
 * canonical-read feature flag is explicitly enabled after authenticated QA.
 *
 * Even with the flag enabled, real data is returned only after the canonical
 * context resolver proves an active organization context. All reads continue
 * through the authenticated Supabase client + RLS.
 */
export async function loadBrainProjectionView(): Promise<BrainProjectionView> {
  if (!canonicalReadEnabled()) {
    return syntheticView(
      "Canonical read path is prepared but disabled until authenticated Stage C QA passes.",
    );
  }

  try {
    const context = await resolveToroContext({ mode: "organization" });

    if (!context) {
      return syntheticView(
        "Canonical read gate is enabled, but no authenticated organization context is resolved.",
      );
    }

    if (context.requiresContextChoice) {
      return syntheticView(
        "Canonical read gate is enabled, but the authenticated user must choose an organization.",
      );
    }

    if (
      context.mode !== "organization" ||
      !context.orgId ||
      !context.membership ||
      context.membership.status !== "active" ||
      context.membership.orgId !== context.orgId ||
      !context.canUseOrganizationData
    ) {
      return syntheticView(
        "Canonical read gate is enabled, but organization data access is denied by context policy.",
      );
    }

    const slice = await loadCanonicalBrainReadSlice(context);
    const projection = buildCanonicalBrainProjection(slice);
    const layout = buildCanonicalBrainLayout(projection);

    return {
      projection,
      layout,
      runtime: {
        mode: "canonical_read_only",
        realData: true,
        externalWrite: false,
        stage: "C",
        reason:
          "Authenticated, RLS-scoped canonical read projection. External writes remain disabled.",
      },
    };
  } catch {
    return syntheticView(
      "Canonical read failed closed; synthetic projection retained and no private data exposed.",
    );
  }
}
