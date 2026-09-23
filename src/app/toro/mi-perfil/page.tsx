import { redirect } from "next/navigation";

import { resolveToroContext } from "@/features/context/resolver";
import { loadMyPeopleSelfService } from "@/features/people/self-service/server";
import { PeopleSelfServiceView } from "@/features/people/self-service/view";

export const dynamic = "force-dynamic";

export default async function MyPeopleProfilePage() {
  const context = await resolveToroContext({ mode: "organization" });

  if (!context || context.requiresContextChoice) {
    redirect("/login?next=/toro/mi-perfil");
  }

  const state = await loadMyPeopleSelfService(context);

  return <PeopleSelfServiceView state={state} />;
}
