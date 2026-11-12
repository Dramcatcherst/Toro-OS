import { PrivateViewGuard } from "@/features/auth/private-view-guard";
import { toBrainClientView } from "@/features/brain/presentation";
import { loadBrainProjectionView } from "@/lib/server/brain-projection";
import { BrainExplorer } from "./brain-explorer";
import { resolveToroContext } from "@/features/context/resolver";
import { isPortalDeployment, isPublicDemo } from "@/lib/server/public-demo";
import { hasPortalOrganizationContext } from "@/features/portal/model";
import { canReadHotelDirectory } from "@/features/tools/directory";
import { PortalHeader } from "@/features/portal/portal-header";
import Link from "next/link";
import { PortalSignOut } from "@/features/auth/portal-sign-out";
import { PortalAccessRecovery } from "@/features/auth/portal-access-recovery";
import styles from "@/features/portal/portal.module.css";

// Evaluate server deployment policy per request; never reuse a pre-rendered operational view.
export const dynamic = "force-dynamic";

export default async function BrainPage() {
  const view = await loadBrainProjectionView();
  // Public demos never resolve or serialize a private Portal context.
  let context = null;
  try { context = isPublicDemo() ? null : await resolveToroContext({ mode: "organization" }); }
  catch {
    return <main id="portal-content" className={styles.page}><div className={styles.content}>
      <PortalAccessRecovery retryPath="/brain" />
    </div></main>;
  }
  if (view.runtime.realData && !hasPortalOrganizationContext(context)) {
    return <main id="portal-content" className={styles.page}><div className={styles.content}>
      <PortalAccessRecovery retryPath="/brain" />
    </div></main>;
  }
  const content = <>
    {hasPortalOrganizationContext(context) ? <PortalHeader current="brain"
      scopeLabel={canReadHotelDirectory(context) ? "Dreamcatcher" : "Organización activa"} /> : null}
    {isPortalDeployment() && !hasPortalOrganizationContext(context) ? <section className={styles.content} aria-label="Acceso al Cerebro">
      <p className={styles.contextNote}>Esta vista es una demostración. {context ? "Elige tu contexto autorizado para continuar." : "Inicia sesión para consultar tu contexto autorizado."}</p>
      <Link href={context ? "/my-toro" : "/login?next=/brain"} prefetch={false} className={styles.personalLink}>
        {context ? "Elegir contexto" : "Iniciar sesión"}
      </Link>
      <PortalSignOut className={styles.textLink} />
    </section> : null}
    <BrainExplorer view={toBrainClientView(view)} />
  </>;
  return context ? <PrivateViewGuard>{content}</PrivateViewGuard> : content;
}
