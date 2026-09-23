import { redirect } from "next/navigation";

import { resolveToroContext } from "@/features/context/resolver";
import { PeopleLeaveWorkspace } from "@/features/people/leave/workspace";
import { loadMyPeopleSelfService } from "@/features/people/self-service/server";

export const dynamic = "force-dynamic";

export default async function PeopleRequestsPage() {
  const context = await resolveToroContext({ mode: "organization" });

  if (!context || context.requiresContextChoice) {
    redirect("/login?next=/toro/solicitudes");
  }

  const state = await loadMyPeopleSelfService(context);

  return <PeopleLeaveWorkspace state={state} />;
}
