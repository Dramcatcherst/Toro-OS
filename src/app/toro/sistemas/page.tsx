import { loadSystemsHealth } from "@/features/systems/server";
import { SystemsHealthView } from "@/features/systems/systems-health-view";

export default async function ToroSystemsPage() {
  const data = await loadSystemsHealth();
  return <SystemsHealthView data={data} />;
}
