import "server-only";

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

/**
 * Single server-side projection seam for the Visual Brain.
 *
 * CURRENT:
 * - synthetic fixture only;
 * - no private canonical data;
 * - no external writes.
 *
 * TARGET Stage C:
 * - resolve canonical TORO context server-side;
 * - load permitted canonical domain state;
 * - project/redact before returning to the UI.
 *
 * Do not add direct Supabase/domain reads to the /brain page component.
 */
export async function loadBrainProjectionView(): Promise<BrainProjectionView> {
  return {
    projection: visualBrainDemo,
    layout: visualBrainDemoLayout,
    runtime: {
      mode: "synthetic_only",
      realData: false,
      externalWrite: false,
      stage: "B",
      reason:
        "Stage C real-state projection is gated by canonical server-side Identity/context authorization.",
    },
  };
}
