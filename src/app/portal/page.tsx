import { DailyEnvironmentCard } from "@/features/environment/daily-environment-card";
import { loadDailyEnvironment } from "@/features/environment/server";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { resolveCurrentToroReadOnlyMenu } from "@/features/menu/server";
import { canReadHotelDirectory } from "@/features/tools/directory";
import { loadHotelDirectory } from "@/features/tools/server";
import { portalNavigation } from "@/features/tools/portal-navigation";
import { hasPortalOrganizationContext, resolvePortalModules } from "@/features/portal/model";
import { PortalWorkspace } from "@/features/portal/portal-workspace";
import { PortalAttentionSummary, type PortalAttentionState } from "@/features/portal/portal-attention-summary";
import { canViewOwnerAttention, type OwnerAttentionProjection } from "@/features/attention/owner-attention";
import { loadOwnerAttentionProjection, ownerAttentionReadEnabled } from "@/features/attention/owner-attention-server";
import { PortalConnectionNote, PortalHeader } from "@/features/portal/portal-header";
import styles from "@/features/portal/portal.module.css";
import { isPublicDemo } from "@/lib/server/public-demo";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  if (isPublicDemo()) redirect("/brain");
  const view = await resolveCurrentToroReadOnlyMenu();
  if (!view || view.state !== "resolved" || !hasPortalOrganizationContext(view.context)) {
    return <main id="portal-content" className={styles.page}><div className={styles.content}>
      <p className={styles.eyebrow}>TORO · OPERATION SYSTEM</p><h1 className={styles.accessHeading}>Tu espacio de trabajo</h1>
      <p className={styles.contextNote}>{view ? "Revisa tu contexto autorizado en Mi espacio para abrir el Portal." : "Inicia sesión con tu cuenta de trabajo para acceder al Portal."}</p>
      <Link className={styles.personalLink + " mt-6"} href={view ? "/my-toro" : "/login?next=/portal"} prefetch={false}>
        {view ? "Ir a Mi espacio" : "Iniciar sesión"}<ArrowRight size={16} aria-hidden="true" />
      </Link>
    </div></main>;
  }
  const modules = resolvePortalModules(view);
  const hotelAllowed = canReadHotelDirectory(view.context);
  const scopeLabel = hotelAllowed ? "Dreamcatcher Hotel" : "Organización activa";
  const attentionAllowed = canViewOwnerAttention(view.context);
  async function readAttention(): Promise<{ state: PortalAttentionState; projection: OwnerAttentionProjection | null }> {
    if (!attentionAllowed || !ownerAttentionReadEnabled()) return { state: "disabled", projection: null };
    try { return { state: "ready", projection: await loadOwnerAttentionProjection(view!.context) }; }
    catch { return { state: "unavailable", projection: null }; }
  }
  const [directory, attention, environment] = await Promise.all([hotelAllowed ? loadHotelDirectory() : Promise.resolve(null), readAttention(), hotelAllowed ? loadDailyEnvironment(view.context) : Promise.resolve(null)]);
  const links = [...(directory?.state === "ready" ? directory.links : []), ...portalNavigation(view.context)];
  const availableCount = modules.filter(module => module.href).length;
  return <>
    <PortalHeader current="overview" scopeLabel={scopeLabel} includeTools={hotelAllowed} />
    <main id="portal-content" className={styles.page} tabIndex={-1}><div className={styles.content}>
      <PortalWorkspace key={`${view.context.userId}:${view.context.orgId}`} modules={modules} links={links} hotelAllowed={hotelAllowed} directoryAvailable={directory?.state === "ready"}
        attention={attentionAllowed ? <PortalAttentionSummary {...attention} /> : null} />
      {hotelAllowed ? <DailyEnvironmentCard view={environment} /> : null}
      <details id="portal-scope" className={styles.contextDisclosure}><summary>Mi contexto · {scopeLabel}</summary>
        <p>{availableCount} módulos con destino disponible; {modules.length - availableCount} en preparación. Un destino puede ser una consulta o una guía.</p>
        <p>Mi TORO es tu espacio personal dentro de este mismo Portal. Accesos según tu cuenta.</p>
      </details>
      <PortalConnectionNote />
    </div></main>
  </>;
}
