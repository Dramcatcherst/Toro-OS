import { ExecutiveHome } from "@/features/executive/executive-home";
import { loadExecutiveHome } from "@/features/executive/server";

export default async function ToroHomePage() {
  const data = await loadExecutiveHome();

  return <ExecutiveHome data={data} />;
}
