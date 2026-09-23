import { redirect } from "next/navigation";

import { resolveToroContext } from "@/features/context/resolver";
import { loadAttendanceReview } from "@/features/people/attendance/review-server";
import { AttendanceReviewView } from "@/features/people/attendance/review-view";

export const dynamic = "force-dynamic";

export default async function AttendanceReviewPage() {
  const context = await resolveToroContext({ mode: "organization" });

  if (!context || context.requiresContextChoice) {
    redirect("/login?next=/toro/asistencia");
  }

  const state = await loadAttendanceReview(context);

  return <AttendanceReviewView state={state} />;
}
