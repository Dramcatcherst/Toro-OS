import { redirect } from "next/navigation";

import { resolveToroContext } from "@/features/context/resolver";
import { loadMyAttendance } from "@/features/people/attendance/server";
import { MyAttendanceView } from "@/features/people/attendance/view";

export const dynamic = "force-dynamic";

export default async function MyAttendancePage() {
  const context = await resolveToroContext({ mode: "organization" });

  if (!context || context.requiresContextChoice) {
    redirect("/login?next=/toro/mi-asistencia");
  }

  const state = await loadMyAttendance(context);

  return <MyAttendanceView state={state} />;
}
