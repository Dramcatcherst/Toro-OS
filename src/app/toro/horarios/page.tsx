import { redirect } from "next/navigation";

import { resolveToroContext } from "@/features/context/resolver";
import { loadTeamSchedule } from "@/features/people/schedule/team-server";
import { TeamScheduleView } from "@/features/people/schedule/team-view";

export const dynamic = "force-dynamic";

export default async function TeamSchedulePage() {
  const context = await resolveToroContext({ mode: "organization" });

  if (!context || context.requiresContextChoice) {
    redirect("/login?next=/toro/horarios");
  }

  const state = await loadTeamSchedule(context);

  return <TeamScheduleView state={state} />;
}
