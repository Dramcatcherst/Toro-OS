import { KnowledgeDirectory } from "@/features/knowledge/knowledge-directory";
import { loadKnowledgeDirectory } from "@/features/knowledge/server";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type KnowledgePageProps = {
  searchParams: Promise<{ item?: string | string[] }>;
};

export default async function ToroKnowledgePage({ searchParams }: KnowledgePageProps) {
  const [items, params] = await Promise.all([loadKnowledgeDirectory(), searchParams]);
  const rawItem = Array.isArray(params.item) ? params.item[0] : params.item;
  const selectedItemId = rawItem && uuidPattern.test(rawItem) ? rawItem : null;

  return <KnowledgeDirectory items={items} selectedItemId={selectedItemId} />;
}
