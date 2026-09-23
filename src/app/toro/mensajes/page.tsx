import { redirect } from "next/navigation";

import { resolveToroContext } from "@/features/context/resolver";
import { loadToroCommsInbox } from "@/features/comms/inbox/server";
import { ToroCommsInboxView } from "@/features/comms/inbox/view";

export const dynamic = "force-dynamic";

export default async function ToroMessagesPage() {
  const context = await resolveToroContext({ mode: "organization" });

  if (!context || context.requiresContextChoice) {
    redirect("/login?next=/toro/mensajes");
  }

  const state = await loadToroCommsInbox(context);

  return <ToroCommsInboxView state={state} />;
}
