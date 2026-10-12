import { toBrainClientView } from "@/features/brain/presentation";
import { loadBrainProjectionView } from "@/lib/server/brain-projection";
import { BrainExplorer } from "./brain-explorer";
import { resolveToroContext } from "@/features/context/resolver";
import { isPublicDemo } from "@/lib/server/public-demo";
import { hasPortalOrganizationContext } from "@/features/portal/model";
import { canReadHotelDirectory } from "@/features/tools/directory";
import { PortalHeader } from "@/features/portal/portal-header";

// Evaluate server deployment policy per request; never reuse a pre-rendered operational view.
export const dynamic = "force-dynamic";

export default async function BrainPage() {
  const view = await loadBrainProjectionView();
  // Public demos never resolve or serialize a private Portal context.
  const context = isPublicDemo() ? null : await resolveToroContext({ mode: "organization" }).catch(() => null);
  return <>
    {hasPortalOrganizationContext(context) ? <PortalHeader current="brain"
      scopeLabel={canReadHotelDirectory(context) ? "Dreamcatcher" : "Organización activa"} /> : null}
    <BrainExplorer view={toBrainClientView(view)} />
  </>;
}
