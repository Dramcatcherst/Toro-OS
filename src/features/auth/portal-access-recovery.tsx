import Link from "next/link";
import { PortalSignOut } from "./portal-sign-out";
import styles from "@/features/portal/portal.module.css";

export function PortalAccessRecovery({ retryPath }: { retryPath: "/portal" | "/my-toro" | "/brain" }) {
  return <section className={styles.panel} aria-label="Recuperar acceso">
    <h1 className={styles.accessHeading}>No pudimos verificar tu acceso ahora.</h1>
    <p className={styles.contextNote}>Vuelve a intentar o cierra esta sesión para entrar de nuevo.</p>
    <a href={retryPath} className={styles.personalLink}>Volver a intentar</a>
    <Link href={`/login?next=${retryPath}`} prefetch={false} className={styles.personalLink}>Ir al acceso</Link>
    <PortalSignOut className={styles.textLink} />
  </section>;
}
