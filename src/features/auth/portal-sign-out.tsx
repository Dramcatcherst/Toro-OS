"use client";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function PortalSignOut({ className }: { className?: string }) {
  const [state, setState] = useState<"ready" | "pending" | "failed">("ready");
  async function exit() {
    setState("pending");
    try {
      const { error } = await createBrowserSupabaseClient().auth.signOut({ scope: "local" });
      if (error) throw error;
      // A full navigation discards the prior private client-router view too.
      window.location.assign("/login?next=/portal");
    } catch { setState("failed"); }
  }
  return <button type="button" className={className} disabled={state === "pending"} onClick={exit}>
    <LogOut size={16} aria-hidden="true" />{state === "pending" ? "Cerrando…" : state === "failed" ? "Reintentar salida" : "Cerrar sesión"}
  </button>;
}
