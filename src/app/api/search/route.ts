import { parseSearchQuery } from "@/lib/search/search-http.mjs";
import { searchToroFromAirtable } from "@/lib/server/toro-search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = parseSearchQuery(searchParams.get("q"));
  const startedAt = Date.now();
  const result = await searchToroFromAirtable(query);

  return Response.json({
    ...result,
    elapsedMs: Date.now() - startedAt,
  });
}
