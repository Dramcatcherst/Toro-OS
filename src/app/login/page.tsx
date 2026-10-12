import { Suspense } from "react";

import { LoginForm } from "@/features/auth/login-form";
import styles from "@/features/portal/portal.module.css";

export default function LoginPage() {
  return (
    <main className={styles.loginPage}>
      <section className={styles.loginBox}>
        <p className={styles.brand}><strong>TORO</strong><span>OPERATION SYSTEM</span></p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Entra a tu TORO</h1>
        <p className="mb-6 mt-2 text-sm leading-6">
          Usa tu cuenta de trabajo. Al entrar volverás a la pantalla que querías abrir.
        </p>
        <Suspense fallback={<p className="text-sm text-slate-500">Cargando acceso…</p>}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
