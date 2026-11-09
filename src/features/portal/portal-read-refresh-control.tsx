"use client";
import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatAttentionCut } from "@/features/attention/owner-attention-presentation";
import { createPortalReadRefresh } from "./portal-read-refresh";
import styles from "./portal.module.css";

export function PortalReadRefresh({ queriedAt }: { queriedAt: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const pendingRef = useRef(false);
  const controller = useRef<ReturnType<typeof createPortalReadRefresh> | null>(null);
  useEffect(() => { pendingRef.current = pending; }, [pending]);
  useEffect(() => {
    const current = createPortalReadRefresh({
      now: () => performance.now(),
      ready: () => document.visibilityState === "visible" && navigator.onLine && !pendingRef.current,
      refresh: () => { pendingRef.current = true; startTransition(() => router.refresh()); },
      schedule: (callback, delay) => { const timer = window.setInterval(callback, delay); return () => window.clearInterval(timer); },
    });
    controller.current = current;
    const wake = () => { current.request(); };
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("online", wake);
    window.addEventListener("focus", wake);
    return () => {
      current.stop(); controller.current = null;
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("online", wake);
      window.removeEventListener("focus", wake);
    };
  }, [router]);
  return <div className={styles.sourceDisclosure} aria-label="Actualización de lecturas">
    <button type="button" className={styles.utilityButton} disabled={pending}
      onClick={() => controller.current?.request(true)}>{pending ? "Consultando…" : "Actualizar ahora"}</button>
    <p className={styles.utilityNote}>Consulta de pantalla: {formatAttentionCut(queriedAt)}. Lecturas cada 2 min mientras está visible y conectado.</p>
    <p className={styles.utilityNote}>Cada fuente conserva su corte y cobertura; volver a consultar no renueva datos antiguos.</p>
  </div>;
}
