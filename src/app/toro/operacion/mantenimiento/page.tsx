import { DataState } from "@/components/toro/data-state";
import { MaintenanceBoard } from "@/features/operations/maintenance-board";
import { loadMaintenanceWorkspace } from "@/features/operations/maintenance-server";

export default async function MaintenancePage() {
  const workspace = await loadMaintenanceWorkspace();

  return (
    <section className="space-y-5 pb-24 md:pb-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          RICO · Operaciones
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
          Mantenimiento
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-neutral-600">
          Ejecuta la ronda P0/P1 con evidencia. Un PASS no cierra un P0 hasta
          que Gerencia lo confirme.
        </p>
      </header>

      {workspace.kind === "ready" ? (
        <MaintenanceBoard
          data={workspace.data}
          defaultResponsible={workspace.defaultResponsible}
          canConfirmP0={workspace.canConfirmP0}
        />
      ) : (
        <DataState
          variant={workspace.kind === "forbidden" ? "forbidden" : "error"}
          detail={workspace.detail}
        />
      )}
    </section>
  );
}
