import { Suspense } from "react";

import { LoginForm } from "@/features/auth/login-form";
import styles from "@/features/portal/portal.module.css";
import { isPortalDeployment } from "@/lib/server/public-demo";

export default function LoginPage() {
  return (
    <main className={styles.loginPage}>
      <section className={styles.loginBox}>
        <p className={styles.brand}><strong>TORO</strong><span>OPERATION SYSTEM</span></p>
        <h1 className="mt-3 text-xl font-semibold tracking-tight">Entra a tu TORO</h1>
        <p className="mb-4 mt-1 text-sm">{isPortalDeployment() ? "Con tu acceso de DreamTeam." : "Con tu cuenta de trabajo."}</p>
        <Suspense fallback={<p className="text-sm text-slate-500">Cargando acceso…</p>}>
          <LoginForm dreamTeamAccess={isPortalDeployment()} />
        </Suspense>
      </section>
    </main>
  );
}
