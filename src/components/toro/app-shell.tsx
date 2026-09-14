import type { ReactNode } from "react";

import type { NavItem } from "@/features/auth/role-nav";
import type { ToroSession } from "@/features/auth/session";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { SearchDialog } from "@/features/search/search-dialog";

import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";

export function AppShell({
  session,
  navigation,
  children,
}: {
  session: ToroSession;
  navigation: NavItem[];
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <DesktopNav items={navigation} />
        <div className="min-w-0 flex-1 pb-20 md:pb-0">
          <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between gap-3 border-b border-black/10 bg-neutral-50/95 px-4 backdrop-blur md:px-6">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Dreamcatcher</p>
              <p className="truncate font-semibold">{session.displayName}</p>
            </div>
            <div className="flex items-center gap-2">
              <SearchDialog />
              <span className="hidden rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium sm:inline-flex">
                {session.role}
              </span>
              <SignOutButton />
            </div>
          </header>
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
      <MobileNav items={navigation} />
    </div>
  );
}
