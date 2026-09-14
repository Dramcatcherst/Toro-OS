import { DecisionList } from "@/features/decisions/decision-list";
import { listMyDecisions } from "@/features/decisions/server";

export default async function ToroDecisionsPage() {
  const decisions = await listMyDecisions({ limit: 20 });

  return (
    <section className="space-y-5 pb-24 md:pb-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          TORO OS
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">Decisiones</h1>
        <p className="max-w-2xl text-sm leading-6 text-neutral-600">
          Revisa recomendación y evidencia antes de ejecutar una acción. Las decisiones actuales requieren aprobación Founder hasta que exista una regla canónica más específica.
        </p>
      </header>

      <DecisionList decisions={decisions} />
    </section>
  );
}
