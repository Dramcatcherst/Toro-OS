import { redirect } from "next/navigation";

import { resolveToroContext } from "@/features/context/resolver";
import { loadMySchedule } from "@/features/people/schedule/server";
import { MyScheduleView } from "@/features/people/schedule/view";

export const dynamic = "force-dynamic";

export default async function MySchedulePage() {
  const context = await resolveToroContext({ mode: "organization" });

  if (!context || context.requiresContextChoice) {
    redirect("/login?next=/toro/mi-horario");
  }

  const state = await loadMySchedule(context);

  return <MyScheduleView state={state} />;
}
