import { toBrainClientView } from "@/features/brain/presentation";
import { loadBrainProjectionView } from "@/lib/server/brain-projection";
import { BrainExplorer } from "./brain-explorer";

export default async function BrainPage() {
  const view = await loadBrainProjectionView();
  return <BrainExplorer view={toBrainClientView(view)} />;
}
