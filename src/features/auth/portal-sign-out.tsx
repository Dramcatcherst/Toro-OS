"use client";

import { notifyPrivateViews } from "./private-view-guard";
import { LogOut } from "lucide-react";

export function PortalSignOut({ className }: { className?: string }) {
  // A native POST replaces the document and discards its private router state.
  // It also works without JavaScript or a configured browser Auth client.
  return <form method="post" action="/api/auth/logout" onSubmit={notifyPrivateViews}><button type="submit" className={className}>
    <LogOut size={16} aria-hidden="true" />Cerrar sesión
  </button></form>;
}
