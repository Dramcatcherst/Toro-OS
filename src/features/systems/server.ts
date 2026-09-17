import "server-only";

import { redirect } from "next/navigation";

import { getToroSession } from "@/features/auth/session";
import { getConnectorHealth } from "@/lib/server/connector-health";

export async function loadSystemsHealth() {
  const session = await getToroSession();
  if (!session) {
    redirect("/login?next=/toro/sistemas");
  }
  if (session.role !== "FOUNDER" && session.role !== "SYSTEMS") {
    redirect("/toro");
  }

  return getConnectorHealth();
}
