import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/toro/app-shell";
import { getRoleNavigation } from "@/features/auth/role-nav";
import { getToroSession } from "@/features/auth/session";

export const dynamic = "force-dynamic";

export default async function ToroLayout({ children }: { children: ReactNode }) {
  const session = await getToroSession();

  if (!session) {
    redirect("/login?next=/toro");
  }

  return (
    <AppShell session={session} navigation={getRoleNavigation(session.role)}>
      {children}
    </AppShell>
  );
}
