import { toBrainClientView } from "@/features/brain/presentation";
import { loadBrainProjectionView } from "@/lib/server/brain-projection";
import { BrainExplorer } from "./brain-explorer";

// Evaluate server deployment policy per request; never reuse a pre-rendered operational view.
export const dynamic = "force-dynamic";

export default async function BrainPage() {
  const view = await loadBrainProjectionView();
  return <BrainExplorer view={toBrainClientView(view)} />;
}
